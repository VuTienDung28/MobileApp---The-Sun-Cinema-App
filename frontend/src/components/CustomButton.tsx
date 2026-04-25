import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline';
  iconName?: React.ComponentProps<typeof Ionicons>['name'];
  isLoading?: boolean;
}

const CustomButton: React.FC<Props> = ({
  title,
  onPress,
  variant = 'primary',
  iconName,
  isLoading = false
}) => {
  const isPrimary = variant === 'primary';
  return (
    <TouchableOpacity
      style={[
        styles.button,
        isPrimary ? styles.primaryButton : styles.outlineButton
      ]}
      onPress={onPress}
      disabled={!!isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color={isPrimary ? '#FFF' : '#FFCC00'} />
      ) : (
        <>
          {iconName && (
            <Ionicons
              name={iconName}
              size={20}
              color={isPrimary ? '#FFF' : '#8A7851'}
              style={styles.icon}
            />
          )}
          <Text style={[
            styles.text,
            isPrimary ? styles.primaryText : styles.outlineText
          ]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginVertical: 10,
  },
  primaryButton: {
    backgroundColor: '#FFCC00',
  },
  outlineButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#FFCC00',
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  primaryText: {
    color: '#FFF',
  },
  outlineText: {
    color: '#8A7851',
  },
  icon: {
    marginRight: 8,
  }
});

export default CustomButton;