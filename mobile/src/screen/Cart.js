import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native"; 
import Icon from "react-native-vector-icons/MaterialIcons";
import { SafeAreaProvider } from "react-native-safe-area-context"; 
import { addTocart, removeFromCart } from "../redux/action/cart"; 
import { useNavigation } from "@react-navigation/native"; 

function Cartscreen() {
  const navigation = useNavigation(); 
  const dispatch = useDispatch();
  const { cart } = useSelector((state) => state.Cart);
  const [cartData, setCartData] = useState([]);

  const total = cart.reduce(
    (acc, item) => acc + item.originalPrice * item.qty,
    0
  );

  useEffect(() => {
    setCartData(cart);
  }, [cart]);

  return (
    <View className="flex-1 bg-gray-100">
      <ScrollView className="flex-1">
        <View className="pt-12 px-4">
          <Text className="text-3xl font-bold text-center mb-4">Cart</Text>

          {/* Cart Items */}
          {cartData.length === 0 ? (
            <View className="py-24 items-center justify-center">
              <Text className="text-2xl">No Product in the cart</Text>
            </View>
          ) : (
            cartData.map((item) => <CartCard key={item._id} item={item} />)
          )}
        </View>

        {/* Cart Summary */}
        <View className="bg-white shadow-lg border border-gray-200 p-4  rounded-lg w-[250px] h-[300px] mx-auto mb-8 mt-8">
          <Text className="text-2xl font-bold mb-2">Summary</Text>
          <Text className="text-base text-gray-600 mb-4">
            Total Price: {total} Birr
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Order")}
            className="bg-rose-500 rounded-lg py-2 shadow-lg"
          >
            <Text className="text-white font-medium text-center">
              Check out
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// ✅ Wrap screen in SafeAreaProvider
export default function Cart() {
  return (
    <SafeAreaProvider>
      <Cartscreen />
    </SafeAreaProvider>
  );
}

function CartCard({ item }) {
  const dispatch = useDispatch();

  const increment = () => {
    const items = { ...item, qty: item.qty + 1 };
    dispatch(addTocart(items));
  };

  const decrement = () => {
    if (item.qty === 1) {
      dispatch(removeFromCart(item));
    } else {
      const newItem = { ...item, qty: item.qty - 1 };
      dispatch(addTocart(newItem));
    }
  };

  return (
    <View className="flex flex-row justify-between items-center mt-4 w-full">
      <View className="flex flex-row gap-6 items-center">
        <Image
          source={{
            uri:
              Array.isArray(item.images) && item.images[0]?.url
                ? item.images[0].url
                : "https://via.placeholder.com/112x128.png?text=No+Image",
          }}
          style={{ height: 135, width: 130, borderRadius: 8 }}
          className="shadow-black shadow-lg"
        />

        <View className="">
          <Text className="font-normal text-md">
            {item.description ? item.description : "No description available"}
          </Text>
          <Text className="font-light text-xs">
            {item.name ? item.name : "No name available"}
          </Text>
          <Text className="font-thin text-xs">
            {item.shop && item.shop.name
              ? `Shop ${item.shop.name}`
              : "No shop information"}
          </Text>

          <View className="flex flex-row justify-between mt-2">
            <View className="w-16">
              <Text className="text-rose-800 font-thin text-xs">
                {item.originalPrice} Birr
              </Text>
              <Text className="text-rose-800 font-thin text-xs">
                {item.discount} rating
              </Text>
              <Text className="text-rose-800 font-thin text-xs">
              Sold: {item.sold_out ?? 0}

              </Text>
            </View>

            <View className="flex flex-row items-center mt-[-4]">
              <TouchableOpacity onPress={increment} className="mr-2">
                <Icon name="add" size={24} color="#000" />
              </TouchableOpacity>
              <Text className="ml-1 text-xs">{item.qty}</Text>
              <TouchableOpacity onPress={decrement} className="ml-2">
                <Icon name="remove" size={24} color="#000" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
