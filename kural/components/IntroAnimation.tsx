import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';

interface IntroAnimationProps {
  onFinish: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function IntroAnimation({ onFinish }: IntroAnimationProps) {
  return (
    <View style={styles.container}>
      <LottieView
        source={require('../assets/kural-ai-intro.json')}
        autoPlay={true}
        loop={false}
        onAnimationFinish={onFinish}
        style={styles.animation}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
});
