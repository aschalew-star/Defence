import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useSelector } from "react-redux";
// import axios from "axios";
import { useNavigation } from "@react-navigation/native";
// import { Toast } from 'react-native-toast-message';

const Payment = () => {
  const [orderData, setOrderData] = useState([]);
  const [open, setOpen] = useState(false);
  //   const { user } = useSelector((state) => state.user);
  const navigation = useNavigation();

  // useEffect(() => {
  //   const orderData = JSON.parse(localStorage.getItem("latestOrder"));
  //   setOrderData(orderData);
  // }, []);

  const order = {
    // cart: orderData?.cart,
    // shippingAddress: orderData?.shippingAddress,
    // user: user && user,
    // totalPrice: orderData?.totalPrice,
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    const tx_ref = "tx-" + Date.now();
    const return_url = `http://localhost:3000/Seccess/${tx_ref}`;

    // try {
    //   const response = await axios.post("http://localhost:5000/payment/init", {
    //     amount: order.totalPrice,
    //     currency: "ETB",
    //     first_name: user.name,
    //     last_name: "MEP",
    //     tx_ref,
    //     return_url,
    //   });

    //       if (response.data.status === "success") {
    //         window.location.href = response.data.data.checkout_url; // Redirect to Chapa UI
    //       } else {
    //         alert("Payment initiation failed!");
    //       }
    //     } catch (error) {
    //       console.error("Payment Error:", error);
    //       alert("An error occurred");
    //     }
  };

  const cashOnDeliveryHandler = async (e) => {
    e.preventDefault();

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    order.paymentInfo = {
      //   type: "Cash On Delivery",
    };

    // await axios
    //   .post("http://localhost:5000/order/create-order", order, config)
    //   .then((res) => {
    //     setOpen(false);
    //     localStorage.setItem("cartItems", JSON.stringify([]));
    //     localStorage.setItem("latestOrder", JSON.stringify([]));
    //     Toast.show({
    //       type: 'success',
    //       text1: 'Order successful!',
    //     });
    //     navigation.navigate("Home");

    //     // Reload page (or reset state in mobile)
    //   }).catch((err) => {
    //     console.log(err.message);
    //   });
  };

  return (
    <ScrollView>
      <View className="flex   mx-9 mt-10 gap-8">
      <View className="w-full   mt-8">
          <CartData orderData={orderData} />
        </View>
        <PaymentInfo
          // user={user}
          open={open}
          setOpen={setOpen}
          handlePayment={handlePayment}
          cashOnDeliveryHandler={cashOnDeliveryHandler}
        />
       
      </View>
    </ScrollView>
  );
};
// user,
const PaymentInfo = ({
  open,
  setOpen,
  handlePayment,
  cashOnDeliveryHandler,
}) => {
  const [select, setSelect] = useState(1);

  return (
    <View className="rounded-lg  px-0 pt-3 flex gap-2 justify-start">
      <View className="flex-row items-center  mb-4">
        <TouchableOpacity
          onPress={() => setSelect(1)}
          className="w-6 h-6 rounded-full border-2 border-red-600 justify-center items-center"
        >
          {select === 1 && (
            <View className="w-3 h-3 bg-red-600 rounded-full" />
          )}
        </TouchableOpacity>
        <Text className="text-base font-semibold text-gray-800 ml-5 flex text-[18px]">
          Pay with Chapa
        </Text>
      </View>

      <View className="flex-row items-center space-x-2 mb-4">
        <TouchableOpacity
          onPress={() => setSelect(3)}
          className="w-6 h-6 rounded-full border-2 border-red-600 justify-center items-center"
        >
          {select === 3 && (
            <View className="w-3 h-3 bg-red-600 rounded-full" />
          )}
        </TouchableOpacity>
        <Text className="text-base font-semibold text-gray-800 ml-5 justify-center  flex text-[18px]">
        Cash on Delivery
        </Text>
      </View>

   

      {select === 3 && (
        <View>
          <TouchableOpacity onPress={cashOnDeliveryHandler} className=" bg-red-500 px-4 py-2 rounded-lg mt-10 w-52  mx-auto ">
            <Text className=" text-white">Confirm with Delivery</Text>
          </TouchableOpacity>
        </View>
      )}

      {select === 1 && (
        <View>
          <TouchableOpacity onPress={handlePayment} className=" bg-red-500 px-4 py-2 rounded-lg w-52  mx-auto mt-10">
            <Text  className=" text-white">Confirm with Chapa</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const CartData = ({ orderData }) => {
  const shipping = orderData?.shipping?.toFixed(2);
  return (
    <View className="flex gap-1 bg-slate-200 p-3 mx-10  rounded-lg">
      <View className="flex flex-row justify-between px-2">
        <Text>Subtotal:</Text>
        <Text>${orderData?.subTotalPrice}</Text>
      </View>
      <View className="flex flex-row justify-between px-2">
        <Text>Shipping:</Text>
        <Text>${shipping}</Text>
      </View>
      <View className="flex flex-row justify-between px-2">
        <Text>Discount:</Text>
        <Text>
          {orderData?.discountPrice ? "$" + orderData.discountPrice : "-"}
        </Text>
      </View>
      <View className="flex flex-row justify-between px-2 mt-2">
      <Text className="text-[18px]">TotalPrice:</Text>

        <Text  className="text-[18px]">${orderData?.totalPrice}</Text>
      </View>
    </View>
  );
};

export default Payment;
