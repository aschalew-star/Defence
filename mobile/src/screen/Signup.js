import React, { use, useState } from "react";
import { useNavigation } from "@react-navigation/native";

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
import Feather from '@expo/vector-icons/Feather';

function Signupscrren() {
  const insets = useSafeAreaInsets(); // Get top/bottom safe area values
  const navigation=useNavigation()



  const [email, setEmail] = useState("");
  const [name, setname] = useState("");
  const [password, setPassword] = useState("");
  const [open,setopen]=useState(false)

  //       setAvatar(reader.result);
  //     }
  //   };

  //   reader.readAsDataURL(e.target.files[0]);
  // };

  const handleSubmit = async (e) => {}
  //   e.preventDefault();

  //   axios
  //     .post("http://localhost:5000/user/signup", { name, email, password, avatar })
  //     .then((res) => {
  //       // toast.success("Register seccessfull");
  //       setname("");
  //       setEmail("");
  //       setPassword("");
  //       setAvatar(null);
  //       console.log(res.data.success);
  //       console.log("Register seccessfull");
          
      
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //       toast.success("Register Error");
  //       console.log(error.response.data.message);

  //     });
  // };
  

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
        <KeyboardAvoidingView> 
          <View
            className="flex justify-start ml-2  pt-7 mb-16
          "
          >
            <Text className=" text-blue-800 text-6xl font-bold"> MEP</Text>
          </View>

          <View className="flex justify-center items-center mt-3">
            <Text className=" text-blue-800 text-3xl font-bold">
              Signup to MEP
            </Text>
          </View>
          <View className="bg-white m-5 rounded-md shadow-slate-600">
            <View className="flex mt-11 mx-8 ">
            <View className="mb-7">
                <Text>Email</Text>
                <TextInput
                  className="border border-gray-300 rounded-md p-1 px-4"
                  value={name}
                  onChangeText={(text) => setname(text)}
                  placeholder="enter your Name"
                />
              </View>
              <View className="mb-7">
                <Text>Email</Text>
                <TextInput
                  className="border border-gray-300 rounded-md p-1 px-4"
                  value={email}
                  onChangeText={(text) => setEmail(text)}
                  placeholder="enter your Email"
                />
              </View>
              <View className="mb-16  relative">
                <Text>Password</Text>

                <TextInput
                  className="border border-gray-300 rounded-md p-1 px-4"
                  value={password}
                  secureTextEntry={!open} 
                  onChangeText={(text) => setPassword(text)}
                  placeholder="enter your password"
                />
                {open?
                <Feather name="eye" size={24} color="black" className="absolute top-7 right-3 " onPress={()=>setopen(!open)}/>:
                <Feather name="eye-off" size={24} color="black" className="absolute top-7 right-3 " onPress={()=>setopen(!open)} />
}
              </View>

              <Pressable
                onPress={handleSubmit}
                className="bg-blue-600 h-11 flex justify-center items-center mx-10 rounded-md mb-7" 
              >
                <Text
                  style={{
                    textAlign: "center",
                    color: "white",
                    fontSize: 18,
                    fontWeight: "bold",
                  }}
                >
                  Signup
                </Text>
              </Pressable>
              <View
                style={{
                  marginTop: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text>Keep me logged in</Text>

                <Text style={{ color: "#007FFF", fontWeight: "500" }}>
                  Forgot Password
                </Text>
              </View>
              <Pressable
                onPress={() => navigation.navigate("Login")}
                style={{ marginTop: 15 }}
              >
                <Text
                  style={{ textAlign: "center", color: "gray", fontSize: 16 }}
                >
                  Do you have an account? Login
                </Text>
              </Pressable>

              <View style={{ marginTop: 80 }} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

export default function Signup() {
  return (
    <SafeAreaProvider>
      <Signupscrren />
    </SafeAreaProvider>
  );
}
