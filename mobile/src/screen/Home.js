import React, { useState, useEffect } from "react";
import { useSelector,useDispatch } from "react-redux";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import ProductCard from "../components/Productcard";
import {addToWishlist,removeFromwish} from "../redux/action/wishlist"

function Homescreen() {
  const [active, setactive] = useState("More to love");
  const [data, setdata] = useState([]);

  const { allProducts } = useSelector((state) => state.products);
  const insets = useSafeAreaInsets();

  const dispatch=useDispatch();




  useEffect(() => {
    if (!allProducts || allProducts.length === 0) return;

    let filteredProducts = [];

    if (active === "More to love") {
      filteredProducts = [...allProducts]
        .sort((a, b) => b.totalSell - a.totalSell)
        .slice(0, 20);
    } else if (active === "All Products") {
      filteredProducts = [...allProducts];
    } else {
      filteredProducts = allProducts.filter(
        (item) =>
          item.category?.toLowerCase().trim() === active.toLowerCase().trim()
      );
    }

    setdata(filteredProducts);
  }, [allProducts, active]);

  const handlecatagory = (item) => setactive(item);

  const catagory = [
    "More to love",
    "All Products",
    "Clothing",
    "Footerwear",
    "Jewelry",
    "Bags & Wallets",
    "Textiles",
  ];

  return (
    <SafeAreaView
      style={{ flex: 1, paddingTop: insets.top }}
      className="bg-white"
    >
      {/* Fixed Header */}
      <View className="px-4">
        <Text className="text-[32px] font-bold">MEP</Text>
      </View>

      {/* Search */}
      <View className="relative opacity-80 mt-2 mb-1">
        <TextInput
          className="border-[2px] border-black mx-8 h-11 pl-3 pt-2 rounded-[14px]"
          placeholder="Search..."
        />
        <Feather
          name="search"
          size={24}
          color="white"
          className="absolute top-1 border px-3 pt-2 h-11 rounded-r-[22px] bg-black right-8"
        />
      </View>

      {/* Categories */}
      <View className="h-14 mb-1">
      <FlatList
        data={catagory}
        horizontal
        keyExtractor={(item, index) => index.toString()}
        // contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 8, paddingBottom: 0 }}

        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8 ,height:10}}
        renderItem={({ item }) => {
          const isSelected = item === active;
          return (
            <TouchableOpacity
              className="mr-3 px-4 py-2  rounded-lg h-10"
              style={{ backgroundColor: isSelected ? "orange" : "white" }}
              onPress={() => handlecatagory(item)}
            >
              <Text className="text-[17px] opacity-60">{item}</Text>
            </TouchableOpacity>
          );
        }}
      />
      </View>

      {/* Scrollable Products */}
      <ScrollView
        contentContainerStyle={{ paddingBottom:20 ,marginTop:6}}
        style={{ flex: 1 }}
      >
        <View className="justify-center items-center mb-5 ">
          <Text className="text-[22px] font-medium">{active}</Text>
        </View>

        {data.length === 0 ? (
          <Text className="text-center text-gray-400">No Product</Text>
        ) : (
          <View className="flex-row flex-wrap justify-between px-4">
            {data.map((item) => (
              <View key={item._id} className="w-[48%] mb-4">
                <ProductCard item={item} />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export default function Home() {
  return (
    <SafeAreaProvider>
      <Homescreen />
    </SafeAreaProvider>
  );
}
