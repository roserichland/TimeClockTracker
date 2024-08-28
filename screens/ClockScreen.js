// want displayoverapps module to show the "earned" only

import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

const ClockScreen = () => {
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [hourlyWage, setHourlyWage] = useState(20); // Default value

  const loadSettings = async () => {
    try {
      const storedWage = await AsyncStorage.getItem("hourlyWage");
      const wage = storedWage ? parseFloat(storedWage) : 20; // Default if not set
      if (isNaN(wage)) {
        console.warn(
          "Loaded hourly wage is not a valid number. Using default."
        );
        setHourlyWage(20); // Default if invalid
      } else {
        setHourlyWage(wage);
      }
      console.log(`Loaded hourly wage: $${wage.toFixed(2)}`);
    } catch (error) {
      console.error("Failed to load settings", error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadSettings(); // Reload settings when screen gains focus
    }, [])
  );

  useEffect(() => {
    let timer;
    if (isActive) {
      timer = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 10);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isActive, startTime]);

  const handleStart = () => {
    setStartTime(Date.now() - elapsedTime);
    setIsActive(true);
  };

  const handleStop = () => {
    setIsActive(false);
  };

  const handleSave = async () => {
    const hoursElapsed = elapsedTime / 3600000;
    const earnings = hoursElapsed * hourlyWage;

    const timestamp = new Date().toISOString();
    const entryKey = `clockEntry_${timestamp}`;

    const entry = {
      timestamp,
      totalHours: hoursElapsed,
      totalEarnings: earnings,
    };

    try {
      await AsyncStorage.setItem(entryKey, JSON.stringify(entry));
      Alert.alert(
        "Saved",
        `Total Hours: ${hoursElapsed.toFixed(
          2
        )}h, Total Earnings: $${earnings.toFixed(2)}`
      );
      setElapsedTime(0);
      setStartTime(Date.now());
    } catch (error) {
      console.error("Error saving entry:", error);
    }
  };

  const handleClear = () => {
    Alert.alert(
      "Clear",
      "Are you sure you want to clear the current session?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK",
          onPress: () => {
            setElapsedTime(0);
            setStartTime(Date.now());
          },
        },
      ]
    );
  };

  const formatTime = (ms) => {
    const milliseconds = Math.floor(ms % 1000);
    const seconds = Math.floor(ms / 1000) % 60;
    const minutes = Math.floor(ms / (1000 * 60)) % 60;
    const hours = Math.floor(ms / (1000 * 60 * 60));
    return `${hours}h ${minutes}m ${seconds}s ${Math.floor(
      milliseconds / 10
    )}ms`;
  };

  // Handle potential NaN values for earnings
  const earnings = !isNaN((elapsedTime / 3600000) * hourlyWage)
    ? (elapsedTime / 3600000) * hourlyWage
    : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Clock</Text>
      <View style={styles.earningsBox}>
        <Text style={styles.earnings}>Earned: ${earnings.toFixed(2)}</Text>
      </View>
      <Text style={styles.time}>{formatTime(elapsedTime)}</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[
            styles.button,
            isActive ? styles.buttonActive : styles.buttonStart,
          ]}
          onPress={isActive ? handleStop : handleStart}
        >
          <Text style={styles.buttonText}>{isActive ? "Stop" : "Start"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleClear}>
          <Text style={styles.buttonText}>Clear</Text>
        </TouchableOpacity>
      </View>
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
  time: {
    fontSize: 38,
    marginBottom: 20,
  },
  earningsBox: {
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5, // For Android shadow
  },
  earnings: {
    fontSize: 52,
    color: "green",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20, // Match the horizontal padding to align with the earnings box
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#4a90e2",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 5,
    alignItems: "center",
    elevation: 2, // For Android shadow
  },
  buttonActive: {
    backgroundColor: "red",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
  },
});

export default ClockScreen;
