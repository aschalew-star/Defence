import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
// import fechAllProducts from "../redux/action/Product";
import {
  View,
  Text,
  Button,
  ScrollView,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
} from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";

function Homescreen() {
  const [active, setactive] = useState("");
  const [data, setdata] = useState([]);

  // const { allProducts, isLoading, error } = useSelector(
  //   (state) => state.products
  // );

  // useEffect(() => {
  //   if (allProducts.length > 0) {
  //     const pro = [...allProducts].sort((a, b) => b.totalSell - a.totalSell);
  //     setdata(pro);
  //   }
  // }, [allProducts]);

  // if (isLoading) {
  //   return <div className="py-16 text-center text-[50px]">Loading ...</div>;
  // }


  // if (error) {
  //   return <div className="py-16 text-center text-[50px]">{error}</div>;
  // }


  const handlecatagory = (item) => {
    setactive(item);
  };

  const insets = useSafeAreaInsets(); // Get top/bottom safe area values
  const catagory = [
    "All Products",
    "Clothing",
    "Footwear",
    "Jewelry",
    "Bags & Wallets",
    "Textiles",
  ];

  return (
    <View
      className="m-3"
      style={{
        flex: 1,
        backgroundColor: "",
        marginTop: insets.top, // Prevents status bar overlap
        marginBottom: insets.bottom, // Prevents bottom home indicator overlap
      }}
    >
      <View>
        <View>
          <Text className="text-[32px] font-bold">MEP</Text>
        </View>
        <View className="relative opacity-80">
          <TextInput
            className="  border-[2px] border-black mx-8 h-11 pl-3 pt-2 mt-1 rounded-[14px]"
            placeholder="Search..."
          />
          <Feather
            name="search"
            size={24}
            color="white"
            className="absolute top-1 border px-3 pt-2 h-11 rounded-r-[22px] bg-black right-8"
          />
        </View>
        <FlatList
          data={catagory}
          horizontal
          keyExtractor={(item, index) => index.toString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle=""
          renderItem={({ item }) => {
            const select = item === active;
 
            return (
              <TouchableOpacity
                className="mx-3 mt-4 p-2 rounded-lg"
                style={{ backgroundColor: select ? "orange" : "white" }}
                onPress={() => handlecatagory(item)}
              >
                <Text className="text-[17px] opacity-60">{item}</Text>
              </TouchableOpacity>
            );
          }}
        />
        <View  className="mt-9">
          <View className="flex justify-center" >
            <Text className="text-center text-[22px] font-medium">More To Love</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
export default function Home() {
  return (
    <SafeAreaProvider>
      <Homescreen />
    </SafeAreaProvider>
  );
}
