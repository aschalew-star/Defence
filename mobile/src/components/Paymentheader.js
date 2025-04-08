import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import {
    SafeAreaProvider,
    useSafeAreaInsets,
  } from "react-native-safe-area-context";

const CheckoutSteps = ({ active }) => {
      const insets = useSafeAreaInsets(); // Get top/bottom safe area values
    
  return (
    <View style={[ { marginTop: insets.top }]} className="pt-2 flex w-4/5  ">
        <View><Text className="text-[34px] font-bold text-blue-800 mb-4 ml-6">
            MEP
            </Text></View>
      <View style={styles.stepsContainer} >
        {/* Step 1: Shipping */}
        <View style={styles.stepWrapper} className="justify-center mx-auto pl-9">
          <TouchableOpacity style={[styles.step, { backgroundColor: "#f63b60" }]}>
            <Text style={styles.activeText}>1. Shipping</Text>
          </TouchableOpacity>

          {/* Line Connector */}
          <View
            style={[styles.line, { backgroundColor: active > 1 ? "#f63b60" : "#FDE1E6" }]}
          />
        </View>

        {/* Step 2: Payment */}
        <View style={styles.stepWrapper}>
          <TouchableOpacity
            style={[
              styles.step,
              { backgroundColor: active > 1 ? "#f63b60" : "#FDE1E6" },
            ]}
          >
            <Text
              style={[
                styles.text,
                { color: active > 1 ? "#fff" : "#f63b60" },
              ]}
            >
              2. Payment
            </Text>
          </TouchableOpacity>

          {/* Line Connector */}
          <View
            style={[styles.line, { backgroundColor: active > 2 ? "#f63b60" : "#FDE1E6" }]}
          />
        </View>

        {/* Step 3: Success */}
        <TouchableOpacity
          style={[
            styles.step,
            { backgroundColor: active > 2 ? "#f63b60" : "#FDE1E6" },
          ]}
        >
          <Text
            style={[
              styles.text,
              { color: active > 2 ? "#fff" : "#f63b60" },
            ]}
          >
            3. Success
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
 
  stepsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  stepWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  step: {
    paddingHorizontal: 10,
    height: 32,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  activeText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  text: {
    fontSize: 16,
    fontWeight: "400",
  },
  line: {
    width: 15,
    height: 4,
  },
});

export default CheckoutSteps;
