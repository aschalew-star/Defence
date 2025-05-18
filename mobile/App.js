import { View, Text } from 'react-native';
import './src/global.css';
import { Provider } from 'react-redux';
import Store from './src/redux/Store';
import StackNavigation from './src/Navigation';
import { fechAllProducts } from "./src/redux/action/Product";
import {loadSeller, loadUser } from "./src/redux/action/Users"
import Toast from "react-native-toast-message";
// import { useSelector } from "react-redux";
import React, { useEffect } from 'react'; 
import { loadCartFromStorage } from './src/redux/action/cart';
import { loadWishFromStorage } from './src/redux/action/wishlist';




function App() {

    useEffect(() => {
      Store.dispatch(loadWishFromStorage());
      Store.dispatch(fechAllProducts());
      Store.dispatch(loadCartFromStorage());

        Store.dispatch(loadUser());
        Store.dispatch(loadSeller());
    
    }, []);

  return (
    <Provider store={Store}>
      <StackNavigation/>
      <Toast />
    </Provider>
  )
}

export default App