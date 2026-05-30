import React from 'react';
import { View, Text } from 'react-native';

export default function MapWrapper({ style }: any) {
    return (
        <View style={[style, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#e0e0e0', padding: 20 }]}>
            <Text style={{ color: '#555', textAlign: 'center' }}>
                🗺️ Bản đồ không hỗ trợ trên nền tảng Web.{'\n\n'}
                Vui lòng nhập tọa độ (Latitude, Longitude) ở ô bên dưới.
            </Text>
        </View>
    );
}
