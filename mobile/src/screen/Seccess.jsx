import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import Toast from "react-native-toast-message";

const SuccessScreen = ({ route }) => {
  const [loading, setLoading] = useState(true);
  const tx_ref = route?.params?.tx_ref || ""; // ✅ Get tx_ref from route params
  const navigation = useNavigation();
  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    const verifyPaymentAndPlaceOrder = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem("latestOrder");
        const orderData = jsonValue ? JSON.parse(jsonValue) : null;

        if (!tx_ref || !orderData) {
          Toast.show({ type: "error", text1: "Missing payment reference or order data" });
          navigation.navigate("Main");
          return;
        }

        const verifyRes = await axios.post("http://localhost:5000/payment/verify", {
          tx_ref,
        });

        if (verifyRes.data.status === "success") {
          const finalOrder = {
            ...orderData,
            user: user || null,
            paymentInfo: {
              type: "Chapa",
              status: "success",
              id: verifyRes.data.ref_id,
            },
          };

          const orderRes = await axios.post(
            "http://localhost:5000/order/create-order",
            finalOrder,
            {
              headers: { "Content-Type": "application/json" },
            }
          );

          if (orderRes.data.success === true) {
            await AsyncStorage.removeItem("cartItems");
            await AsyncStorage.removeItem("latestOrder");

            Toast.show({ type: "success", text1: "Order completed successfully!" });
            navigation.navigate("Main");
          } else {
            Toast.show({ type: "error", text1: "Order creation failed." });
          }
        } else {
          Toast.show({ type: "error", text1: "Payment verification failed." });
        }
      } catch (error) {
        console.error("Verification Error:", error);
        Toast.show({ type: "error", text1: "Something went wrong. Try again." });
      } finally {
        setLoading(false);
      }
    };

    if (tx_ref) {
      verifyPaymentAndPlaceOrder();
    }
  }, [tx_ref]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#f87171" />
        <Text className="mt-4 text-lg font-semibold text-gray-700">Verifying Payment...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-2xl font-semibold text-green-600 text-center px-6">
        🎉 Great! Your payment was successful!
      </Text>
    </View>
  );
};

export default SuccessScreen;
