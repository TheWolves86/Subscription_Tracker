import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'

const ListHeading = ( { title, onActionPress }: { title: string, onActionPress?: () => void } ) => {
  return (
      <View className="list-head">
        <Text className="list-title">{title}</Text>

      <TouchableOpacity className='list-action' onPress={onActionPress}>
        <Text className='list-action-text'>See All</Text>
      </TouchableOpacity>
      </View>
  )
}

export default ListHeading