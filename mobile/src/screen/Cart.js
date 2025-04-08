import React, { use, useState } from "react";
import { useNavigation } from "@react-navigation/native";
// import { useSelector, useDispatch } from "react-redux";


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


function Cartscreen() {
  // const { cart } = useSelector((state) => state.Cart);
  // const [cartData, setCartData] = useState([]);

  // const total = cart.reduce((acc, item) => acc + item.
  // originalPrice * item.qty, 0);

  // useEffect(() => {
  //   const data = cart;
  //   setCartData(data);
  // }, [cart]);

  // const dispatch = useDispatch();

  // console.log(cartData);

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
        <Text>Cart</Text>
      </View>
    </View>
  );
}
export default function Cart
() {
  return (
    <SafeAreaProvider>
      <Cartscreen />
    </SafeAreaProvider>
  );
}

