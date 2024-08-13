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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

const StatisticsHistoryScreen = ({ navigation }) => {
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);

  // Fetch data whenever the screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const entries = await Promise.all(
        keys
          .filter((key) => key.startsWith("dailyTotals_"))
          .map(async (key) => {
            const entry = await AsyncStorage.getItem(key);
            return {
              date: key.replace("dailyTotals_", ""),
              totalEarnings: JSON.parse(entry)?.totalEarnings || 0,
            };
          })
      );

      const sortedEntries = entries.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setEntries(sortedEntries);
    } catch (error) {
      console.error("Error fetching entries:", error);
    }
  };

  const handleEntryPress = (entry) => {
    setSelectedEntry(entry);
  };

  const handleCloseModal = () => {
    setSelectedEntry(null);
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
                  `dailyTotals_${selectedEntry.date}`
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
              const entriesKeys = keys.filter((key) =>
                key.startsWith("dailyTotals_")
              );
              await AsyncStorage.multiRemove(entriesKeys);
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

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
        {entries.map((entry) => (
          <TouchableOpacity
            key={entry.date}
            onPress={() => handleEntryPress(entry)}
            style={styles.entry}
          >
            <Text style={styles.entryText}>
              Date: {new Date(entry.date).toDateString()}
            </Text>
            <Text style={styles.entryText}>
              Total Earnings: ${entry.totalEarnings.toFixed(2)}
            </Text>
          </TouchableOpacity>
        ))}
        <View style={styles.buttonContainer}>
          <Button title="Delete All Entries" onPress={handleDeleteAllEntries} />
        </View>
      </ScrollView>

      {selectedEntry && (
        <Modal
          transparent={true}
          visible={!!selectedEntry}
          onRequestClose={handleCloseModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>
                Date: {new Date(selectedEntry.date).toDateString()}
              </Text>
              <Text style={styles.modalText}>
                Total Earnings: ${selectedEntry.totalEarnings.toFixed(2)}
              </Text>
              <View style={styles.buttonContainer}>
                <Button title="Delete" onPress={handleDelete} />
                <Button title="Close" onPress={handleCloseModal} />
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  entry: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
  },
  entryText: {
    fontSize: 18,
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
  modalText: {
    fontSize: 18,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
  },
});

export default StatisticsHistoryScreen;
