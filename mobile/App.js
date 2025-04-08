import { View, Text } from 'react-native';
import './src/global.css';
import { Provider } from 'react-redux';
import Store from './src/redux/Store';
import StackNavigation from './src/Navigation';
// import { fechAllProducts } from "./redux/Action/productAction";
// import {loadSeller, loadUser } from "./redux/Action/user"
// import { useSelector } from "react-redux";




import React from 'react'

function App() {

    // useEffect(() => {
    //   // Store.dispatch(fechAllProducts());
    //     // Store.dispatch(loadUser());
    //     // Store.dispatch(loadSeller());
    
    // }, []);

  return (
    <Provider store={Store}>
      <StackNavigation/>
    </Provider>
  )
}

export default App