import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { BarChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

  const loadData = async () => {
    try {
      const labels = [];
      const dataPoints = [];
      const today = new Date();

      // Iterate through the last 7 days for example
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const key = `dailyTotals_${date.toISOString().split("T")[0]}`;
        const storedTotals = await AsyncStorage.getItem(key);
        const totals = storedTotals
          ? JSON.parse(storedTotals)
          : { totalEarnings: 0 };

        labels.push(date.toLocaleDateString());
        dataPoints.push(totals.totalEarnings);
      }

      const chartData = {
        labels,
        datasets: [
          {
            data: dataPoints,
          },
        ],
      };

      setData(chartData);
    } catch (error) {
      console.error("Failed to load data", error);
    }
  };

  useEffect(() => {
    loadData(); // Load data when component mounts
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Statistics</Text>
      <BarChart
        data={data}
        width={screenWidth - 30}
        height={220}
        yAxisLabel="$"
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
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default StatisticsScreen;
