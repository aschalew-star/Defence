import React from "react";
import { WebView } from "react-native-webview";
import { useNavigation } from "@react-navigation/native";

const WebViewScreen = ({ route }) => {
  const { url } = route.params;
  const navigation = useNavigation();

  const handleNavigationStateChange = (navState) => {
    const currentUrl = navState.url;

    if (currentUrl.includes("/SuccessScreen")) {
      const tx_ref = currentUrl.split("/SuccessScreen/")[1];
      navigation.replace("SuccessScreen", { tx_ref });
    }
    
  };

  return <WebView source={{ uri: url }} onNavigationStateChange={handleNavigationStateChange} />;
};

export default WebViewScreen;
