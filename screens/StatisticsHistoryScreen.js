import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Button,
  Alert,
  TextInput,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect } from "@react-navigation/native";

const StatisticsHistoryScreen = () => {
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newEntryDate, setNewEntryDate] = useState(new Date());
  const [newEntryEarnings, setNewEntryEarnings] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const entryKeys = keys.filter((key) => key.startsWith("clockEntry_"));

      const entries = await Promise.all(
        entryKeys.map(async (key) => {
          const entry = await AsyncStorage.getItem(key);
          return JSON.parse(entry);
        })
      );

      const sortedEntries = entries.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

      setEntries(sortedEntries);
    } catch (error) {
      console.error("Error fetching entries:", error);
    }
  };

  const handleEntryPress = (entry) => {
    setSelectedEntry(entry);
    setNewEntryDate(new Date(entry.timestamp));
    setNewEntryEarnings(entry.totalEarnings.toFixed(2));
    setIsEditing(true);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setSelectedEntry(null);
    setModalVisible(false);
    setIsEditing(false);
    setNewEntryEarnings("");
    setShowDatePicker(false);
    setShowTimePicker(false);
  };

  const handleDelete = async () => {
    if (selectedEntry) {
      Alert.alert(
        "Confirm Deletion",
        "Are you sure you want to delete this entry?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                await AsyncStorage.removeItem(
                  `clockEntry_${selectedEntry.timestamp}`
                );
                fetchData(); // Fetch updated entries and refresh state
                handleCloseModal();
              } catch (error) {
                console.error("Error deleting entry:", error);
              }
            },
          },
        ],
        { cancelable: true }
      );
    }
  };

  const handleDeleteAllEntries = () => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete all entries?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            try {
              const keys = await AsyncStorage.getAllKeys();
              const entryKeys = keys.filter((key) =>
                key.startsWith("clockEntry_")
              );
              await AsyncStorage.multiRemove(entryKeys);
              setEntries([]); // Clear all entries
            } catch (error) {
              console.error("Error deleting all entries:", error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleAddOrEditEntry = async () => {
    const earningsValue = parseFloat(newEntryEarnings);
    if (!newEntryDate || isNaN(earningsValue) || earningsValue < 0) {
      Alert.alert("Invalid Input", "Please enter valid date and earnings.");
      return;
    }

    const formattedDate = newEntryDate.toISOString();
    try {
      const key = `clockEntry_${
        selectedEntry ? selectedEntry.timestamp : formattedDate
      }`;
      await AsyncStorage.setItem(
        key,
        JSON.stringify({
          timestamp: formattedDate,
          totalHours: selectedEntry ? selectedEntry.totalHours : 0, // For new entries
          totalEarnings: earningsValue,
        })
      );

      fetchData(); // Fetch updated entries and refresh state
      handleCloseModal();
    } catch (error) {
      console.error("Error adding or editing entry:", error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
        {entries.map((entry) => (
          <TouchableOpacity
            key={entry.timestamp} // Ensure each entry has a unique key prop
            onPress={() => handleEntryPress(entry)}
            style={styles.entry}
          >
            <Text style={styles.entryText}>
              Date: {new Date(entry.timestamp).toDateString()}
            </Text>
            <Text style={styles.entryText}>
              Total Earnings: ${entry.totalEarnings.toFixed(2)}
            </Text>
          </TouchableOpacity>
        ))}
        <View style={styles.buttonContainer}>
          <Button
            title="Add Entry"
            onPress={() => {
              setIsEditing(false);
              setNewEntryDate(new Date()); // Set date to current date for new entries
              setModalVisible(true);
            }}
          />
          <Button title="Delete All Entries" onPress={handleDeleteAllEntries} />
        </View>
      </ScrollView>

      {/* Modal for Editing or Adding an Entry */}
      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isEditing ? "Edit Entry" : "Add New Entry"}
            </Text>
            <Text>Date: {newEntryDate.toDateString()}</Text>
            <Text>Time: {newEntryDate.toTimeString().slice(0, 5)}</Text>
            <Button
              title="Select Date"
              onPress={() => setShowDatePicker(true)}
            />
            <Button
              title="Select Time"
              onPress={() => setShowTimePicker(true)}
            />
            {showDatePicker && (
              <DateTimePicker
                value={newEntryDate}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (date) {
                    const updatedDate = new Date(newEntryDate);
                    updatedDate.setFullYear(date.getFullYear());
                    updatedDate.setMonth(date.getMonth());
                    updatedDate.setDate(date.getDate());
                    setNewEntryDate(updatedDate);
                  }
                }}
              />
            )}
            {showTimePicker && (
              <DateTimePicker
                value={newEntryDate}
                mode="time"
                display="default"
                onChange={(event, time) => {
                  setShowTimePicker(false);
                  if (time) {
                    const updatedDate = new Date(newEntryDate);
                    updatedDate.setHours(time.getHours());
                    updatedDate.setMinutes(time.getMinutes());
                    setNewEntryDate(updatedDate);
                  }
                }}
              />
            )}
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Enter total earnings"
              value={newEntryEarnings}
              onChangeText={setNewEntryEarnings}
            />
            <View style={styles.buttonContainer}>
              <Button
                title={isEditing ? "Save Changes" : "Add Entry"}
                onPress={handleAddOrEditEntry}
              />
              <Button title="Cancel" onPress={handleCloseModal} />
              {isEditing && (
                <Button
                  title="Delete Entry"
                  onPress={handleDelete}
                  color="red"
                />
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  entry: {
    padding: 16,
    marginBottom: 10,
    backgroundColor: "#f1f1f1",
    borderRadius: 8,
  },
  entryText: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 10,
  },
  input: {
    width: "100%",
    padding: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
  },
});

export default StatisticsHistoryScreen;
