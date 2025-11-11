import React from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

interface IntroAnimationProps {
  onFinish: () => void;
}

export default function IntroAnimation({ onFinish }: IntroAnimationProps) {
  return (
    <View style={styles.container}>
      <LottieView
        source={require('../assets/kural-ai-intro.json')}
        autoPlay={true}
        loop={false}
        onAnimationFinish={onFinish}
        style={styles.animation}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: 400,
    height: 400,
  },
});
