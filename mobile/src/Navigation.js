import { NavigationContainer } from "@react-navigation/native";
import { View, Text, Button } from "react-native";
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Ionicons from "@expo/vector-icons/Ionicons";
import Login from "./screen/Login";
import Signup from "./screen/Signup";
import Home from "./screen/Home";
import Cart from "./screen/Cart";
import Fontisto from "@expo/vector-icons/Fontisto";
import Octicons from "@expo/vector-icons/Octicons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Wishlist from "./screen/Wishlist";
import Order from "./screen/Order";
import Payments from "./screen/Payments";
import WebViewScreen from "./screen/Chapa";
import SuccessScreen from "./screen/Seccess";
const StackNavigation = () => {
  const stack = createNativeStackNavigator();
  const Tab = createBottomTabNavigator();
  function BottomTabs() {
    return (
      <Tab.Navigator>
        <Tab.Screen
          name="Home"
          component={Home}
          options={{
            tabBarLabel: "Home",
            tabBarLabelStyle: { color: "#008E97" },
            headerShown: false,
            tabBarIcon: ({ focused }) =>
              focused ? (
                <FontAwesome5 name="home" size={24} color="green" />
              ) : (
                <Ionicons name="home-outline" size={24} color="black" />
              ),
          }}
        />
        <Tab.Screen
          name="Cart"
          component={Cart}
          options={{
            tabBarLabel: "Cart",
            tabBarLabelStyle: { color: "#008E97" },
            headerShown: false,
            tabBarIcon: ({ focused }) =>
              focused ? (
                <Ionicons name="cart" size={24} color="green" />
              ) : (
                <Ionicons name="cart-outline" size={24} color="black" />
              ),
          }}
        />
        <Tab.Screen
          name="wishlist"
          component={Wishlist}
          options={{
            tabBarLabel: "wishlist",
            tabBarLabelStyle: { color: "#008E97" },
            headerShown: false,
            tabBarIcon: ({ focused }) =>
              focused ? (
                <Fontisto name="heart" size={24} color="green" />
              ) : (
                <FontAwesome6 name="heart" size={24} color="black" />
              ),
          }}
        />
        <Tab.Screen
          name="account"
          component={Login}
          options={{
            tabBarLabel: "account",
            tabBarLabelStyle: { color: "#008E97" },
            headerShown: false,
            tabBarIcon: ({ focused }) =>
              focused ? (
                <Octicons name="person-fill" size={24} color="green" />
              ) : (
                <Octicons name="person" size={24} color="black" />
              ),
          }}
        />
      </Tab.Navigator>
    );
  }

  return (
    <NavigationContainer>
      <stack.Navigator>
        <stack.Screen
          name="Main"
          component={BottomTabs}
          options={{ headerShown: false }}
        />

        <stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
        <stack.Screen
          name="Payments"
          component={Payments}
          options={{ headerShown: false }}
        />
        <stack.Screen
          name="Order"
          component={Order}
          options={{ headerShown: false }}
        />

        <stack.Screen
          name="Signup"
          component={Signup}
          options={{ headerShown: false }}
        />
        <stack.Screen name="WebViewScreen" component={WebViewScreen} />
        <stack.Screen name="SuccessScreen" component={SuccessScreen} />

      </stack.Navigator>
    </NavigationContainer>
  );
};
export default StackNavigation;
