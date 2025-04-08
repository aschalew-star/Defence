import React, { use, useState } from "react";
import { useNavigation } from "@react-navigation/native";

import {
  View,
  Text,
  Button,
  SafeAreaView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
} from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";


function Wishlistscreen() {
  const insets = useSafeAreaInsets(); // Get top/bottom safe area values
  return (
    <View
      className="m-2"
      style={{
        flex: 1,
        backgroundColor: "",
        marginTop: insets.top, // Prevents status bar overlap
        marginBottom: insets.bottom, // Prevents bottom home indicator overlap
      }}
    >
      <View>
        <Text>wishlist</Text>
      </View>
    </View>
  );
}
export default function Wishlist() {
  return (
    <SafeAreaProvider>
      <Wishlistscreen />
    </SafeAreaProvider>
  );
}

