import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { BarChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

const screenWidth = Dimensions.get("window").width;

const StatisticsScreen = () => {
  const [data, setData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
      },
    ],
  });

  const [showValues, setShowValues] = useState(false);
  const [chartType, setChartType] = useState("daily");

  const loadData = async () => {
    try {
      const labels = [];
      const dataPoints = [];
      const today = new Date();
      const roundedDataPoints = [];

      if (chartType === "daily") {
        const key = `dailyTotals_${today.toISOString().split("T")[0]}`;
        const storedTotals = await AsyncStorage.getItem(key);
        const totals = storedTotals
          ? JSON.parse(storedTotals)
          : { totalEarnings: 0 };

        labels.push(today.toLocaleDateString());
        dataPoints.push(totals.totalEarnings);
      } else if (chartType === "weekly") {
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay()); // Start of the week
        const endDate = new Date(today);
        endDate.setDate(today.getDate() - today.getDay() + 6); // End of the week

        while (startDate <= endDate) {
          try {
            const key = `dailyTotals_${startDate.toISOString().split("T")[0]}`;
            const storedTotals = await AsyncStorage.getItem(key);
            const totals = storedTotals
              ? JSON.parse(storedTotals)
              : { totalEarnings: 0 };

            labels.push(startDate.toLocaleDateString());
            dataPoints.push(totals.totalEarnings);
          } catch (error) {
            console.error(
              `Error fetching data for ${
                startDate.toISOString().split("T")[0]
              }`,
              error
            );
          }
          startDate.setDate(startDate.getDate() + 1);
        }

        // Aggregate data by week
        const weekLabels = [];
        const weekDataPoints = [];
        for (let i = 0; i < dataPoints.length; i += 7) {
          const weekData = dataPoints.slice(i, i + 7);
          weekLabels.push(`Week ${Math.floor(i / 7) + 1}`);
          weekDataPoints.push(weekData.reduce((a, b) => a + b, 0));
        }

        labels.length = 0;
        dataPoints.length = 0;
        labels.push(...weekLabels);
        dataPoints.push(...weekDataPoints);
      } else if (chartType === "monthly") {
        const year = today.getFullYear();
        const month = today.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const monthLabels = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"];
        const monthDataPoints = [0, 0, 0, 0, 0];

        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(year, month, day);
          try {
            const key = `dailyTotals_${date.toISOString().split("T")[0]}`;
            const storedTotals = await AsyncStorage.getItem(key);
            const totals = storedTotals
              ? JSON.parse(storedTotals)
              : { totalEarnings: 0 };

            const weekIndex = Math.floor((day - 1) / 7);
            monthDataPoints[weekIndex] += totals.totalEarnings;
          } catch (error) {
            console.error(
              `Error fetching data for ${date.toISOString().split("T")[0]}`,
              error
            );
          }
        }

        labels.length = 0;
        dataPoints.length = 0;
        labels.push(...monthLabels);
        dataPoints.push(...monthDataPoints);
      }

      const chartData = {
        labels,
        datasets: [
          {
            data: roundedDataPoints.length
              ? roundedDataPoints
              : dataPoints.map((point) => parseFloat(point.toFixed(2))),
          },
        ],
      };

      setData(chartData);
      setShowValues(dataPoints.every((point) => point > 0.01));
    } catch (error) {
      console.error("Failed to load data", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [chartType])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Statistics</Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[
            styles.button,
            chartType === "daily" ? styles.buttonActive : {},
          ]}
          onPress={() => setChartType("daily")}
        >
          <Text style={styles.buttonText}>Daily</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            chartType === "weekly" ? styles.buttonActive : {},
          ]}
          onPress={() => setChartType("weekly")}
        >
          <Text style={styles.buttonText}>Weekly</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            chartType === "monthly" ? styles.buttonActive : {},
          ]}
          onPress={() => setChartType("monthly")}
        >
          <Text style={styles.buttonText}>Monthly</Text>
        </TouchableOpacity>
      </View>
      <BarChart
        data={data}
        width={screenWidth - 30}
        height={220}
        yAxisLabel="$"
        fromZero={true}
        showBarTops={false}
        showValuesOnTopOfBars={showValues}
        horizontalLabelRotation={0}
        verticalLabelRotation={-45}
        chartConfig={{
          backgroundColor: "#fff",
          backgroundGradientFrom: "#fff",
          backgroundGradientTo: "#fff",
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        style={styles.chart}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  chart: {
    marginVertical: 8,
  },
  buttonRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#4a90e2",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 5,
    alignItems: "center",
  },
  buttonActive: {
    backgroundColor: "#003366",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
  },
});

export default StatisticsScreen;
