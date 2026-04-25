import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useAlertStore from '../store/useAlertStore';
const CustomAlert = () => {
  const { isVisible, title, message, type, buttons, hideAlert } = useAlertStore();
  if (!isVisible) return null;
  const getIcon = () => {
    switch (type) {
      case 'success': return { name: 'checkmark-circle', color: '#4CAF50' };
      case 'error': return { name: 'close-circle', color: '#F44336' };
      case 'warning': return { name: 'warning', color: '#FF9800' };
      default: return { name: 'information-circle', color: '#2196F3' };
    }
  };
  const iconInfo = getIcon();
  return (
    <Modal transparent visible={isVisible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.alertBox}>
          <Ionicons name={iconInfo.name} size={60} color={iconInfo.color} style={styles.icon} />
          
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <View style={styles.buttonContainer}>
            {buttons.map((btn, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  btn.style === 'cancel' ? styles.cancelButton : styles.confirmButton,
                  buttons.length === 2 && styles.halfButton
                ]}
                onPress={() => {
                  hideAlert();
                  if (btn.onPress) btn.onPress();
                }}
              >
                <Text style={[
                  styles.buttonText,
                  btn.style === 'cancel' && styles.cancelButtonText
                ]}>
                  {btn.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertBox: {
    backgroundColor: '#FFF',
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  icon: {
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  halfButton: {
    flex: 0.48,
  },
  confirmButton: {
    backgroundColor: '#FFCC00',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  cancelButtonText: {
    color: '#666',
  }
});
export default CustomAlert;