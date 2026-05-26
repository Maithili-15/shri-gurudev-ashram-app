import React from 'react'
import { View, Text, Pressable, ImageBackground } from 'react-native'

type Props = {
  title: string
  dateRange: string
  image: string
  status?: string
}

const TripCard: React.FC<Props> = ({ title, dateRange, image, status }) => {
  return (
    <Pressable className="mb-4 rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(91,70,54,0.05)] bg-white">
      <ImageBackground source={{ uri: image }} style={{ width: '100%', height: 180 }} imageStyle={{ resizeMode: 'cover' }}>
        {status ? (
          <View className="absolute top-3 right-3 bg-white/90 px-3 py-1 rounded-full">
            <Text className="text-xs text-primary">{status}</Text>
          </View>
        ) : null}
      </ImageBackground>
      <View className="p-4">
        <Text className="text-lg font-display text-text-charcoal mb-1">{title}</Text>
        <View className="flex-row items-center gap-3 text-secondary">
          <Text className="text-sm text-text-charcoal/70">{dateRange}</Text>
        </View>
      </View>
    </Pressable>
  )
}

export default TripCard
