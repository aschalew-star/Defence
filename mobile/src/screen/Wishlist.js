import React, { use, useState ,useEffect} from "react";
import { useNavigation } from "@react-navigation/native";
import { useDispatch,useSelector } from "react-redux";
import { ScrollView } from "react-native";

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
import ProductCard from "../components/Productcard";


function Wishlistscreen() {

  const { wish } = useSelector((state) => state.Wish);
  const [cartData, setCartData] = useState([]);

  useEffect(() => {
    if (wish && Array.isArray(wish)) {
        setCartData(wish);
  }}, [wish]);

  const dispatch = useDispatch();
  console.log(wish);
  //   const total = wish.reduce((acc, item) => acc + item.price * item.qty, 0);

  console.log(cartData);
  const flattenedData = cartData.flat(7); // Flattens two levels deep
   console.log("flattend",flattenedData);
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
       <ScrollView
        contentContainerStyle={{ paddingBottom:20 ,marginTop:6}}
        style={{ flex: 1 }}
      >
        <View className="justify-center items-center mb-5 ">
          <Text className="text-[22px] font-medium">Wishlist</Text>
        </View>

        {cartData.length === 0 ? (
          <Text className="text-center text-gray-400">No Product</Text>
        ) : (
          <View className="flex-row flex-wrap justify-between px-4">
            {cartData.map((item) => (
              <View key={item._id} className="w-[48%] mb-4">
                <ProductCard item={item} />
              </View>
            ))}
          </View>
        )} 
      </ScrollView>
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

