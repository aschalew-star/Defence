import React from 'react'
import CheckoutSteps from "../components/Paymentheader"
import { View,Text } from 'react-native'
import Checkout from "../components/Checkout"

function Order() {
  return (
    <View>
       < CheckoutSteps active={1}/>
       <Checkout/>
    </View>
  )
}

export default Order