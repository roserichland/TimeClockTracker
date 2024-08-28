//tax rate option and calculations (maybe start modularizing)
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";

const SettingsScreen = () => {
  const [hourlyWage, setHourlyWage] = useState(""); // Keep as string for TextInput
  const [dayStart, setDayStart] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const navigation = useNavigation();

  const handleSave = async () => {
    // Validate and convert hourlyWage
    const wage = parseFloat(hourlyWage);
    if (isNaN(wage) || wage <= 0) {
      Alert.alert("Error", "Please enter a valid dollar amount.");
      return;
    }

    try {
      await AsyncStorage.setItem("hourlyWage", JSON.stringify(wage)); // Save as number
      await AsyncStorage.setItem("dayStart", dayStart.toISOString());
      Alert.alert(
        "Settings Saved",
        `Hourly wage: $${wage.toFixed(2)}\nDay Start Time: ${formatTime(
          dayStart
        )}`
      );
      console.log(`Hourly wage saved: $${wage.toFixed(2)}`);

      // Navigate back to ClockScreen
      navigation.navigate("Clock");
    } catch (error) {
      Alert.alert("Error", "Failed to save settings.");
      console.error("Failed to save settings", error);
    }
  };

  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.wage}>
        {hourlyWage ? `Hourly Wage: $${hourlyWage}` : "No dollar amount set"}
      </Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Enter hourly wage"
        value={hourlyWage}
        onChangeText={setHourlyWage}
      />
      <Button
        title={`Day Start Time: ${formatTime(dayStart)}`}
        onPress={() => setShowPicker(true)}
      />
      {showPicker && (
        <DateTimePicker
          value={dayStart}
          mode="time"
          display="spinner"
          onChange={(event, selectedDate) => {
            setShowPicker(false);
            if (selectedDate) setDayStart(selectedDate);
          }}
        />
      )}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
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
  wage: {
    fontSize: 20,
    marginBottom: 20,
    color: "#333",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    width: "80%",
    marginBottom: 20,
    paddingHorizontal: 10,
    textAlign: "center",
  },
  saveButton: {
    backgroundColor: "#4a90e2",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
  },
});

export default SettingsScreen;
