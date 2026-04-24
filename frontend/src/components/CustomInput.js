import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CustomInput = ({ 
  iconName, 
  placeholder, 
  value, 
  onChangeText, 
  secureTextEntry, 
  isPassword,
  onTogglePassword,
  ...props
}) => {
  return (
    <View style={styles.container}>
      {iconName && (
        <Ionicons name={iconName} size={20} color="#8A7851" style={styles.icon} />
      )}
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#BDBDBD"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!!secureTextEntry}
        {...props}
      />
      {isPassword && (
        <TouchableOpacity onPress={onTogglePassword} style={styles.eyeIcon}>
          <Ionicons 
            name={secureTextEntry ? 'eye-off' : 'eye'} 
            size={20} 
            color="#8A7851" 
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5ED',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#333',
    fontSize: 16,
  },
  eyeIcon: {
    marginLeft: 10,
  }
});

export default CustomInput;
