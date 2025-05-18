import React, { useState, useEffect } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet 
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Checkout = () => {
  const navigation = useNavigation();
  const { user } = useSelector((state) => state.user);
  const { cart } = useSelector((state) => state.Cart);

  const [country, setCountry] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [city, setCity] = useState("");
  const [userInfo, setUserInfo] = useState(false);

  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [discountPrice, setDiscountPrice] = useState(0);

  const subTotalPrice = cart.reduce(
    (acc, item) => acc + item.qty * item.originalPrice, 0
  );

  const shipping = subTotalPrice * 0.01361;
  const totalPrice = (subTotalPrice + shipping - discountPrice).toFixed(2);

  const paymentSubmit = async () => {
    if (!address1 || !address2 || !zipCode || !country || !city) {
      Alert.alert("Error", "Please enter your delivery address!");
      return;
    }

    const shippingAddress = { address1, address2, zipCode, country, city };
    const orderData = {
      cart,
      totalPrice,
      subTotalPrice,
      shipping,
      discountPrice,
      shippingAddress,
      user,
      phoneNumber,
    };

    try {
      await AsyncStorage.setItem("latestOrder", JSON.stringify(orderData));
      navigation.navigate("Payments");
    } catch (error) {
      console.error("Error saving order data:", error);
    }
  };

  return (
    <ScrollView>
      <View style={styles.formContainer}>
        <ShippingInfo
          phoneNumber={phoneNumber}
          setPhoneNumber={setPhoneNumber}
          user={user}
          country={country}
          setCountry={setCountry}
          city={city}
          setCity={setCity}
          address1={address1}
          setAddress1={setAddress1}
          address2={address2}
          setAddress2={setAddress2}
          zipCode={zipCode}
          setZipCode={setZipCode}
          userInfo={userInfo}
          setUserInfo={setUserInfo}
        />
        <CartData subTotalPrice={subTotalPrice} shipping={shipping} totalPrice={totalPrice} />
      </View>

      <TouchableOpacity style={styles.paymentButton} onPress={paymentSubmit} className="mt-4">
        <Text style={styles.paymentButtonText} className="pt-1">Go to Payment</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const ShippingInfo = ({
  user, phoneNumber, setPhoneNumber, country, setCountry, city, setCity, 
  address1, setAddress1, address2, setAddress2, zipCode, setZipCode, userInfo, setUserInfo
}) => {
  return (
    <View style={styles.shippingContainer}>
      <Text style={styles.heading}>Shipping Address</Text>
      <View style={styles.inputGroup}>
        <TextInput 
          style={styles.input} 
          placeholder="Full Name" 
          editable={false} 
          value={user?.name} 
        />
        <TextInput 
          style={styles.input} 
          placeholder="Email Address" 
          editable={false} 
          value={user?.email} 
        />
      </View>

      <View style={styles.inputGroup}>
        <TextInput 
          style={styles.input} 
          placeholder="Phone Number" 
          keyboardType="phone-pad" 
          value={phoneNumber} 
          onChangeText={setPhoneNumber} 
        />
        <TextInput 
          style={styles.input} 
          placeholder="Zip Code" 
          keyboardType="numeric" 
          value={zipCode} 
          onChangeText={setZipCode} 
        />
      </View>

      <View style={styles.inputGroup}>
        <TextInput 
          style={styles.input} 
          placeholder="Country" 
          value={country} 
          onChangeText={setCountry} 
        />
        <TextInput 
          style={styles.input} 
          placeholder="City" 
          value={city} 
          onChangeText={setCity} 
        />
      </View>

      <View style={styles.inputGroup}>
        <TextInput 
          style={styles.input} 
          placeholder="Address1" 
          value={address1} 
          onChangeText={setAddress1} 
        />
        <TextInput 
          style={styles.input} 
          placeholder="Address2" 
          value={address2} 
          onChangeText={setAddress2} 
        />
      </View>

      <TouchableOpacity onPress={() => setUserInfo(!userInfo)}>
        <Text style={styles.linkText}>Fill the fields from saved addresses</Text>
      </TouchableOpacity>

      {userInfo && user?.addresses?.map((item, index) => (
        <TouchableOpacity key={index} onPress={() => {
          setAddress1(item.address1);
          setAddress2(item.address2);
          setZipCode(item.zipCode);
          setCountry(item.country);
          setCity(item.city);
        }}>
          <Text>{item.addressType}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const CartData = ({ totalPrice, shipping, subTotalPrice }) => {
  return (
    <View style={styles.cartContainer}>
      <View style={styles.row}>
        <Text style={styles.summaryText}>Subtotal:</Text>
        <Text style={styles.summaryText}>{subTotalPrice} Birr</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.summaryText}>Shipping:</Text>
        <Text style={styles.summaryText}>{shipping.toFixed(2)} Birr</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.summaryText}>Total Price:</Text>
        <Text style={styles.summaryText}>{totalPrice} Birr</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop: 28,
    backgroundColor: "#f5f5f5"
  },
  formContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    borderRadius: 8
  },
  heading: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 10
  },
  inputGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginRight: 5
  },
  shippingContainer: {
    marginBottom: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: "#fff",
    borderRadius: 8
  },
  cartContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 20
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 5
  },
  summaryText: {
    fontSize: 16,
    fontWeight: "bold"
  },
  linkText: {
    color: "#f63b60",
    marginTop: 10,
    fontSize: 16
  },
  paymentButton: {
    backgroundColor: "#f63b60",
    borderRadius: 8,
    height: 35,
    width: 220,
    alignItems: "center",
    marginLeft: "auto",
    marginRight: "auto"
  },
  paymentButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold"
  }
});

export default Checkout;
