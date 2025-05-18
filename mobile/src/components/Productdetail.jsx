import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  StatusBar,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons"; // Cross icon
import IconAnt from "react-native-vector-icons/AntDesign"; // Star icons

const ProductDetail = ({ item, setPopup }) => {
  return (
    <Modal
      transparent={true}
      visible={true}
      animationType="fade"
      onRequestClose={() => setPopup(false)}
      className=""
    >
      <SafeAreaView className="flex-1 bg-black">
        <StatusBar backgroundColor="black" barStyle="light-content" />
        <View className="bg-white  flex-1 ">
          <View>
            <TouchableOpacity
              onPress={() => setPopup(false)}
              className="flex justify-end bg-black pl-3"
            >
              {/* <Icon name="close"  size={30} className="text-red-800"/> */}
              <Icon name="close" size={30} color="#B91C1C" /> // Tailwind's
              red-800
            </TouchableOpacity>
            <View className="flex flex-col">
              <View className="pl-14 w-full h-80  bg-black">
                <Image
                  className="w-full h-full"
                  source={{ uri: item.images[0]?.url }}
                  resizeMode="cover" // Cover to ensure it fills the width and height
                  style={{ aspectRatio: 1 }} // Maintain a proportional aspect ratio
                />
              </View>

              <View className="">
                <View className="bg-blue-400 pt-5 flex flex-row gap-6 px-6">
                  <Text className="text-white font-bold text-[25px]">
                    {item.originalPrice} Birr
                  </Text>
                  <Text className="text-white font-bold text-[25px]">
                    {item.discountPrice}% off
                  </Text>
                </View>
                <Text className="texxt-[22px] font-semibold px-4 mt-2">
                  {item.description}
                </Text>
                <View className="flex flex-row px-4 gap-1 mt-4">
                  <IconAnt name="star" />
                  <IconAnt name="star" />
                  <IconAnt name="star" />
                  <IconAnt name="star" />
                  <Text className="px-3 font-medium ">
                    Rating: {item.rating}%
                  </Text>
                  <Text className=" font-medium ">Sold: {item.sold_out}</Text>
                  <Text className=" font-medium ml-2">Stock: {item.stock}</Text>
                </View>
                <Text className="mt-2 mx-10">Shop Name: {item.shop.name}</Text>
                <View className="px-4 mt-4">
                  <View className="self-end flex flex-row items-center h-12 px-4 bg-blue-600 rounded-xl">
                    <Text className="text-white text-[14px]">Message</Text>
                  </View>
                </View>
                <View>
                  <View>
                    <Text className="mx-auto font-semibold text-[30px]">
                      Preview
                    </Text>
                  </View>
                  <View className="mt-3 mx-6 ">
                    <Text className="mb-1">
                      "Have a question? Chat with us!"
                    </Text>
                    <Text className="mb-1"> "Message our support team"</Text>
                    <Text className="mb-1">
                      "Click to send a quick message"
                    </Text>
                    <Text className="mb-1">
                      "We're here to help – send a message"
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default ProductDetail;
