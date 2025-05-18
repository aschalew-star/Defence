import React, { useState, useEffect } from "react";
import { loadCartFromStorage } from "../redux/action/cart";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import WebViewScreen from "../screen/Chapa";

const Payment = () => {
  const [orderData, setOrderData] = useState([]);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Added loading state
  const { user } = useSelector((state) => state.user);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem("latestOrder");
        if (jsonValue) {
          setOrderData(JSON.parse(jsonValue));
        }
      } catch (error) {
        console.error("Error retrieving order data:", error);
      }
    };

    fetchOrderData();
  }, []);

  const order = {
    cart: orderData?.cart,
    shippingAddress: orderData?.shippingAddress,
    user: user,
    totalPrice: orderData?.totalPrice,
  };

  const handlePayment = async () => {
    const tx_ref = "tx-" + Date.now();
    const return_url = `https://297c-213-55-102-49.ngrok-free.app/SuccessScreen/${tx_ref}`;

//     const return_url = `https://297c-213-55-102-49.ngrok-free.app
// /SuccessScreen/${tx_ref}`;

    setIsLoading(true); // Set loading to true while processing payment

    //  https://297c-213-55-102-49.ngrok-free.app -> http://localhost:5000
    console.log("Response from payment initiation:");
    try {
      const response = await axios.post("http://localhost:5000/payment/init", {
        amount: order.totalPrice,
        currency: "ETB",
        first_name: user.name,
        last_name: "MEP",
        tx_ref,
        return_url,
      });
      console.log("Response from payment initiation:", response);

      if (response.data.status === "success") {
        navigation.navigate("WebViewScreen", {
          url: response.data.data.checkout_url,
        });
      } else {
        Toast.show({ type: "error", text1: "Payment initiation failed!" });
      }
    } catch (error) {
      console.error("Payment Error:", error);
      Toast.show({ type: "error", text1: "An error occurred during payment." });
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  const cashOnDeliveryHandler = async () => {
    try {
      order.paymentInfo = { type: "Cash On Delivery" };
      setIsLoading(true); // Set loading to true while creating order

      const response = await axios.post(
        "http://localhost:5000/order/create-order",
        order,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success === true) {
        setOpen(false);
        await AsyncStorage.setItem("cartItems", JSON.stringify([]));
        await AsyncStorage.setItem("latestOrder", JSON.stringify([]));
        dispatch(loadCartFromStorage());

        Toast.show({
          type: "success",
          text1: "Order successful!",
        });

        navigation.navigate("Main");
      }
    } catch (err) {
      console.error(err.message);
      Toast.show({ type: "error", text1: "Order creation failed." });
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  return (
    <ScrollView>
      <View className="flex mx-9 mt-10 gap-8">
        <View className="w-full mt-8">
          <CartData orderData={orderData} />
        </View>

        <PaymentInfo
          open={open}
          setOpen={setOpen}
          handlePayment={handlePayment}
          cashOnDeliveryHandler={cashOnDeliveryHandler}
          isLoading={isLoading} // Pass loading state to PaymentInfo
        />
      </View>
    </ScrollView>
  );
};

const PaymentInfo = ({
  open,
  setOpen,
  handlePayment,
  cashOnDeliveryHandler,
  isLoading,
}) => {
  const [select, setSelect] = useState(1);

  return (
    <View className="rounded-lg px-0 pt-3 flex gap-2 justify-start">
      <View className="flex-row items-center mb-4">
        <TouchableOpacity
          onPress={() => setSelect(1)}
          className="w-6 h-6 rounded-full border-2 border-red-600 justify-center items-center"
        >
          {select === 1 && <View className="w-3 h-3 bg-red-600 rounded-full" />}
        </TouchableOpacity>
        <Text className="text-[18px] font-semibold text-gray-800 ml-5">
          Pay with Chapa
        </Text>
      </View>

      <View className="flex-row items-center mb-4">
        <TouchableOpacity
          onPress={() => setSelect(3)}
          className="w-6 h-6 rounded-full border-2 border-red-600 justify-center items-center"
        >
          {select === 3 && <View className="w-3 h-3 bg-red-600 rounded-full" />}
        </TouchableOpacity>
        <Text className="text-[18px] font-semibold text-gray-800 ml-5">
          Cash on Delivery
        </Text>
      </View>

      {select === 3 && (
        <TouchableOpacity
          onPress={cashOnDeliveryHandler}
          className="bg-red-500 px-4 py-2 rounded-lg mt-10 w-52 mx-auto"
        >
          <Text className="text-white text-center">Confirm with Delivery</Text>
        </TouchableOpacity>
      )}

      {select === 1 && (
        <TouchableOpacity
          onPress={handlePayment}
          className="bg-red-500 px-4 py-2 rounded-lg mt-10 w-52 mx-auto"
          disabled={isLoading} // Disable button when loading
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text className="text-white text-center">Confirm with Chapa</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const CartData = ({ orderData }) => {
  const shipping = orderData?.shipping?.toFixed(2);
  return (
    <View className="flex gap-1 bg-slate-200 p-3 mx-10 rounded-lg">
      <View className="flex flex-row justify-between px-2">
        <Text>Subtotal:</Text>
        <Text>{orderData?.subTotalPrice} Birr</Text>
      </View>
      <View className="flex flex-row justify-between px-2">
        <Text>Shipping:</Text>
        <Text>{shipping} Birr</Text>
      </View>
      <View className="flex flex-row justify-between px-2">
        <Text>Discount:</Text>
        <Text>
          {orderData?.discountPrice ? orderData.discountPrice + "Birr" : "-"}
        </Text>
      </View>
      <View className="flex flex-row justify-between px-2 mt-2">
        <Text className="text-[18px] font-semibold">Total Price:</Text>
        <Text className="text-[18px] font-semibold">
          {orderData?.totalPrice} Birr
        </Text>
      </View>
    </View>
  );
};

export default Payment;
