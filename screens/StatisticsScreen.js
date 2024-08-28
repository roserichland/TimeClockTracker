//backwards graphs
//not updating with edits on history screen

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
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
          const key = `dailyTotals_${startDate.toISOString().split("T")[0]}`;
          const storedTotals = await AsyncStorage.getItem(key);
          const totals = storedTotals
            ? JSON.parse(storedTotals)
            : { totalEarnings: 0 };

          labels.push(startDate.toLocaleDateString());
          dataPoints.push(totals.totalEarnings);

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
        labels.push(...weekLabels.reverse()); // Reverse order for display
        dataPoints.push(...weekDataPoints.reverse()); // Reverse order for display
      } else if (chartType === "monthly") {
        const year = today.getFullYear();
        const month = today.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const monthLabels = [];
        const monthDataPoints = Array.from(
          { length: Math.ceil(daysInMonth / 7) },
          () => 0
        ); // Initialize for up to 5 weeks

        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(year, month, day);
          const key = `dailyTotals_${date.toISOString().split("T")[0]}`;
          const storedTotals = await AsyncStorage.getItem(key);
          const totals = storedTotals
            ? JSON.parse(storedTotals)
            : { totalEarnings: 0 };

          const weekIndex = Math.floor((day - 1) / 7);
          monthDataPoints[weekIndex] += totals.totalEarnings;
        }

        // Create labels for weeks in the month
        for (let i = 0; i < monthDataPoints.length; i++) {
          monthLabels.push(`Week ${i + 1}`);
        }

        labels.length = 0;
        dataPoints.length = 0;
        labels.push(...monthLabels.reverse()); // Reverse order for display
        dataPoints.push(...monthDataPoints.reverse()); // Reverse order for display
      }

      // Round data points to two decimal places
      const roundedDataPoints = dataPoints.map((point) =>
        parseFloat(point.toFixed(2))
      );

      const chartData = {
        labels,
        datasets: [
          {
            data: roundedDataPoints,
          },
        ],
      };

      console.log("Chart Data:", chartData); // Log chart data for debugging
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
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chartContainer}>
          <BarChart
            data={data}
            width={Math.max(screenWidth * 1.5, 600)} // Ensure width for horizontal scrolling
            height={220}
            yAxisLabel="$"
            fromZero={true}
            showBarTops={false}
            showValuesOnTopOfBars={true}
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
      </ScrollView>
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
  chartContainer: {
    width: Math.max(screenWidth * 1.5, 600), // Ensure container width is sufficient
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
