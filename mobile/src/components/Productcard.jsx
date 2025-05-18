import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import IconAnt from 'react-native-vector-icons/AntDesign';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import IconEntypo from 'react-native-vector-icons/Entypo';
import ProductDetail from './Productdetail';
import { addTocart, removeFromCart } from '../redux/action/cart';
import { addToWishlist, removeFromwish } from '../redux/action/wishlist';

const ProductCard = ({ item }) => {
  const short =
    typeof item.description === 'string'
      ? item.description.slice(0, 23)
      : 'No description';

  const [popup, setPopup] = useState(false);
  const [active, setActive] = useState(false);
  const [wishs, setWish] = useState(false);

  const dispatch = useDispatch();
  const cart = useSelector((state) => state.Cart?.cart ?? []);
  const wish = useSelector((state) => state.Wish?.wish ?? []);

  const wishHandler = () => {
    const isItemExists = wish.find((i) => i._id === item._id);
    if (isItemExists) {
      dispatch(removeFromwish(item));
      setWish(false);
    } else {
      const data = { ...item, qty: 1 };
      dispatch(addToWishlist(data));
      setWish(true);
    }
  };

  const cartHandler = () => {
    const isItemExists = cart.find((i) => i._id === item._id);
    if (isItemExists) {
      dispatch(removeFromCart(item));
      setActive(false);
    } else {
      const data = { ...item, qty: 1 };
      dispatch(addTocart(data));
      setActive(true);
    }
  };

  return (
    <View className="w-1/2 p-2">
      {/* Product Image */}
      <View>
        <Image
          className="w-48 h-56 rounded-lg"
          source={{
            uri:
              Array.isArray(item.images) && item.images[0]?.url
                ? item.images[0].url
                : 'https://via.placeholder.com/192x224.png?text=No+Image',
          }}
        />
      </View>

      {/* Description */}
      <Text className="text-sm mt-1">{short}...</Text>

      {/* Info row */}
      <View className="flex flex-row items-center mt-1">
        <Icon name="message" size={16} className="mr-1" />
        <Text className="text-xs text-gray-500 mr-3">
          Sold: {item.sold_out ?? 0}
        </Text>
        <TouchableOpacity onPress={wishHandler}>
          <View className="flex flex-row items-center">
            <IconAnt name="star" size={12} />
            <IconAnt name="star" size={12} />
            <IconAnt name="star" size={12} />
            <IconAnt name="star" size={12} />
            <IconFontAwesome
              size={20}
              color={wishs ? 'red' : 'black'}
              name="heart"
              style={{ marginLeft: 6 }}
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Price & Actions */}
      <View className="flex flex-row items-center mt-2 gap-2">
        <Text>{item.originalPrice ?? 0} Birr</Text>
        <Text>-{item.discount ?? 0}%</Text>
        <TouchableOpacity onPress={() => setPopup(!popup)}>
          <IconEntypo name="eye" size={20} />
        </TouchableOpacity>
        <TouchableOpacity onPress={cartHandler}>
          <Icon
            name="shopping-cart"
            color={active ? 'red' : 'black'}
            size={20}
          />
        </TouchableOpacity>
      </View>

      {/* Popup for Product Detail */}
      {popup && <ProductDetail item={item} setPopup={setPopup} />}
    </View>
  );
};

export default ProductCard;
