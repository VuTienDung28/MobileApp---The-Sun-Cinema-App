import React from 'react';
import MapView, { Marker } from 'react-native-maps';

export default function MapWrapper({ region, onPress, latitude, longitude, style }: any) {
    return (
        <MapView style={style} region={region} onPress={onPress}>
            {latitude && longitude && <Marker coordinate={{ latitude, longitude }} />}
        </MapView>
    );
}
