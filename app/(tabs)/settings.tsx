import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
const SafeAreaView = styled(RNSafeAreaView);

const settings = () => {
  return (
    <SafeAreaView className="flex-1 bg-background p-3">
      <View>
        <Text>settings</Text>
      </View>
    </SafeAreaView>
  )
}

export default settings

const styles = StyleSheet.create({})