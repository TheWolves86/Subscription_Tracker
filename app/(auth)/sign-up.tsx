import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import {Link} from "expo-router"

const signup = () => {
  return (
    <View>
      <Text>sign-up</Text>
      <Link href="/sign-in">Go to Sign In</Link>
    </View>
  )
}

export default signup

const styles = StyleSheet.create({})