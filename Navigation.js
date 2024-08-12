import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import StatisticsScreen from "./screens/StatisticsScreen";
import SettingsScreen from "./screens/SettingsScreen";
import ClockScreen from "./screens/ClockScreen";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === "Statistics") {
              iconName = "ios-stats";
              return <Ionicons name={iconName} size={size} color={color} />;
            } else if (route.name === "Settings") {
              iconName = "settings";
              return (
                <MaterialIcons name={iconName} size={size} color={color} />
              );
            } else if (route.name === "Clock") {
              iconName = "clock";
              return <Ionicons name={iconName} size={size} color={color} />;
            }
          },
        })}
        tabBarOptions={{
          activeTintColor: "tomato",
          inactiveTintColor: "gray",
        }}
      >
        <Tab.Screen name="Statistics" component={StatisticsScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
        <Tab.Screen name="Clock" component={ClockScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
