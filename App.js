import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialIcons"; // Import the icon library

import StatisticsScreen from "./screens/StatisticsScreen";
import SettingsScreen from "./screens/SettingsScreen";
import ClockScreen from "./screens/ClockScreen";
import StatisticsHistoryScreen from "./screens/StatisticsHistoryScreen"; // Import the new screen

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;

            switch (route.name) {
              case "Clock":
                iconName = "alarm"; // Icon for ClockScreen
                break;
              case "Statistics":
                iconName = "bar-chart"; // Icon for StatisticsScreen
                break;
              case "History":
                iconName = "history"; // Icon for StatisticsHistoryScreen
                break;
              case "Settings":
                iconName = "settings"; // Icon for SettingsScreen
                break;
              default:
                iconName = "info"; // Default icon
                break;
            }

            return <Icon name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Clock" component={ClockScreen} />
        <Tab.Screen name="Statistics" component={StatisticsScreen} />
        <Tab.Screen name="History" component={StatisticsHistoryScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
