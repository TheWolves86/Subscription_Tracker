import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import {Link} from "expo-router"

const signin = () => {
  return (
    <View>
      <Text>sign-up</Text>
      <Link href="/sign-up">Go to Sign Up</Link>
    </View>
  )
}

export default signin

const styles = StyleSheet.create({})