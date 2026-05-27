import React from 'react'
import { View, Text, ImageBackground, Pressable } from 'react-native'
import { BlurView } from 'expo-blur'

const HeroSection: React.FC = () => {
  return (
    <ImageBackground
      source={{ uri: 'https://picsum.photos/1200/800?blur=2' }}
      style={{ width: '100%', height: 220 }}
      imageStyle={{ borderRadius: 18 }}
      resizeMode="cover"
    >
      <BlurView intensity={70} style={{ flex: 1, padding: 16, justifyContent: 'flex-end', borderRadius: 18 }}>
        <View className="glass-card p-4 rounded-xl">
          <Text className="text-xl font-display text-text-charcoal">Namaste, Aryan</Text>
          <Text className="text-sm text-text-charcoal/80 mt-1">Your spiritual journey continues.</Text>

          <View className="mt-3 flex-row items-center justify-between">
            <Pressable className="bg-saffron-light px-4 py-2 rounded-full">
              <Text className="text-on-primary-fixed text-white font-medium">Donate</Text>
            </Pressable>
            <Text className="text-sm text-text-charcoal/70">Next: Oct 15, 2023</Text>
          </View>
        </View>
      </BlurView>
    </ImageBackground>
  )
}

export default HeroSection
