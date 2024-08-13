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
  const [chartType, setChartType] = useState("weekly"); // "weekly" or "monthly"

  const loadData = async () => {
    try {
      const labels = [];
      const dataPoints = [];
      const today = new Date();
      let startDate, endDate;

      if (chartType === "weekly") {
        // Weekly data
        startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay()); // Start of the week
        endDate = new Date(today);
        endDate.setDate(today.getDate() - today.getDay() + 6); // End of the week

        for (let i = 0; i < 7; i++) {
          const date = new Date(startDate);
          date.setDate(startDate.getDate() + i);
          const key = `dailyTotals_${date.toISOString().split("T")[0]}`;
          const storedTotals = await AsyncStorage.getItem(key);
          const totals = storedTotals
            ? JSON.parse(storedTotals)
            : { totalEarnings: 0 };

          labels.push(date.toLocaleDateString());
          dataPoints.push(totals.totalEarnings);
        }
      } else {
        // Monthly data
        const year = today.getFullYear();
        const month = today.getMonth(); // 0-based index (0 = January, 11 = December)
        const daysInMonth = new Date(year, month + 1, 0).getDate(); // Number of days in the month

        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(year, month, day);
          const key = `dailyTotals_${date.toISOString().split("T")[0]}`;
          const storedTotals = await AsyncStorage.getItem(key);
          const totals = storedTotals
            ? JSON.parse(storedTotals)
            : { totalEarnings: 0 };

          labels.push(date.toLocaleDateString("en-US", { day: "numeric" })); // Use day of the month as label
          dataPoints.push(totals.totalEarnings);
        }
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

      setData(chartData);

      // Set showValues to true only if all totals are greater than 0.01
      const shouldShowValues = roundedDataPoints.every((point) => point > 0.01);
      setShowValues(shouldShowValues);
    } catch (error) {
      console.error("Failed to load data", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData(); // Load data when component mounts or when navigated to
    }, [chartType]) // Reload data when chartType changes
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Statistics</Text>
      <View style={styles.buttonRow}>
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
    backgroundColor: "#003366", // Active button color
  },
  buttonText: {
    color: "white",
    fontSize: 18,
  },
});

export default StatisticsScreen;
