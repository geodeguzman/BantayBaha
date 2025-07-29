import React, { useState } from 'react';
import { ActivityIndicator, Dimensions, Image, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { UrlTile } from 'react-native-maps';
import { useWaterLevels } from '../../hooks/useApiData';

export default function MapScreen() {
  const [mapType, setMapType] = useState<'street' | 'satellite'>('satellite');
  const { waterLevels, latestWaterLevel, loading, error } = useWaterLevels();

  const getTileUrl = () => {
    if (mapType === 'satellite') {
      return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    } else {
      // CartoDB Positron tiles, up to z=20
      return 'https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: 20, marginBottom: 8, zIndex: 10 }}>
        <Image source={require('../../assets/images/Logo.png')} style={styles.logoIcon} />
        <Text style={styles.title}>BantayBaha</Text>
      </View>
      <View style={styles.mapBox}>
        {loading ? (
          <ActivityIndicator size="large" color="#1976d2" />
        ) : (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: 13.861528,
              longitude: 120.668361,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            showsUserLocation={true}
            showsMyLocationButton={true}
            showsCompass={true}
            showsScale={true}
            maxZoomLevel={19}
          >
            <UrlTile
              urlTemplate={getTileUrl()}
              maximumZ={19}
              flipY={false}
            />
          </MapView>
        )}
        
        {/* Water Level Display */}
        {latestWaterLevel && (
          <View style={styles.waterLevelDisplay}>
            <Text style={styles.waterLevelTitle}>Current Water Level</Text>
            <Text style={styles.waterLevelValue}>
              {(latestWaterLevel as any)?.water_level || 'N/A'} cm
            </Text>
            <Text style={styles.waterLevelFeet}>
              ({(latestWaterLevel as any)?.water_level_feet || 'N/A'} ft)
            </Text>
            <Text style={styles.waterLevelThreshold}>
              Threshold: {(latestWaterLevel as any)?.threshold || 'N/A'} cm
            </Text>
            <Text style={styles.waterLevelTime}>
              {new Date((latestWaterLevel as any)?.created_at || Date.now()).toLocaleString()}
            </Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.mapTypeButton}
          onPress={() => setMapType(mapType === 'street' ? 'satellite' : 'street')}
        >
          <Text style={styles.mapTypeText}>
            {mapType === 'street' ? '🌍 Satellite' : '🗺️ Street'}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.legendBox}>
        <Text style={styles.legendTitle}>Legend</Text>
        <View style={styles.legendRow}><View style={[styles.legendColor, {backgroundColor: '#4caf50'}]} /><Text style={styles.legendText}>Green – Safe</Text></View>
        <View style={styles.legendRow}><View style={[styles.legendColor, {backgroundColor: '#ff9800'}]} /><Text style={styles.legendText}>Orange – Caution</Text></View>
        <View style={styles.legendRow}><View style={[styles.legendColor, {backgroundColor: '#f44336'}]} /><Text style={styles.legendText}>Red – Danger! Evacuate immediately!</Text></View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerBox: { alignItems: 'center', marginTop: 20, marginBottom: 8 },
  logoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  logoIcon: { width: 36, height: 36, marginRight: 10 },
  title: { color: '#23406e', fontSize: 28, fontWeight: 'bold', letterSpacing: 1, fontFamily: 'Poppins' },
  mapBox: { flex: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 0 },
  map: { 
    width: Dimensions.get('window').width - 32, 
    height: '100%', 
    borderRadius: Platform.OS === 'ios' ? 16 : 8, 
    overflow: 'hidden' 
  },
  waterLevelDisplay: {
    position: 'absolute',
    top: 100, // Adjust as needed
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    zIndex: 10,
  },
  waterLevelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#23406e',
    marginBottom: 5,
  },
  waterLevelValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 5,
  },
  waterLevelFeet: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  waterLevelThreshold: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  waterLevelTime: {
    fontSize: 14,
    color: '#666',
  },
  mapTypeButton: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: '#1976d2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    zIndex: 10,
  },
  mapTypeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  legendBox: { padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' },
  legendTitle: { color: '#1976d2', fontWeight: 'bold', marginBottom: 8, fontSize: 16 },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  legendColor: { width: 18, height: 18, borderRadius: 4, marginRight: 8, borderWidth: 1, borderColor: '#ccc' },
  legendText: { fontSize: 15, color: '#23406e' },
}); 