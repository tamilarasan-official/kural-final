import React from 'react';
import { TouchableOpacity, StyleSheet, GestureResponderEvent } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

type Props = {
  onPress?: (e: GestureResponderEvent) => void;
  accessibilityLabel?: string;
};

export default function HeaderBack({ onPress, accessibilityLabel = 'Back' }: Props) {
  return (
    <TouchableOpacity
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={styles.btn}
      activeOpacity={0.7}
    >
      <Icon name="arrow-back" size={24} color="#1976D2" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
