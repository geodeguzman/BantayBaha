import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

const alerts = [
  {
    id: 1,
    icon: require('../../assets/images/floodicon.png'), // placeholder, replace with your icon
    title: 'FLOOD WARNING',
    time: '1m',
    message: 'Floodwaters have risen to dangerous levels. If you are in a flood-affected area, please evacuate immediately for your safety.'
  },
  {
    id: 2,
    icon: require('../../assets/images/cautionicon.png'), // placeholder, replace with your icon
    title: 'ANNOUNCEMENT',
    time: '10m',
    message: 'An evacuation center has been set up at the court. Please head there immediately for safety. Follow all instructions and stay safe...'
  }
];

export default function AlertsScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8, paddingTop: 20, zIndex: 10 }}>
        <Image source={require('../../assets/images/Logo.png')} style={{ width: 36, height: 36, marginRight: 10 }} />
        <Text style={{ color: '#23406e', fontSize: 28, fontWeight: 'bold', letterSpacing: 1, fontFamily: 'Poppins' }}>BantayBaha</Text>
      </View>
      <ScrollView style={styles.container} contentContainerStyle={{paddingTop: 32, paddingBottom: 24}}>
        {alerts.map(alert => (
          <View key={alert.id} style={styles.alertBox}>
            <Image source={alert.icon} style={styles.icon} />
            <View style={{flex:1}}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>{alert.title}</Text>
                <Text style={styles.time}> · {alert.time}</Text>
              </View>
              <Text style={styles.message}>{alert.message}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 16 },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d3d3d3',
    padding: 14,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  icon: { width: 36, height: 36, marginRight: 12, marginTop: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  title: { color: '#d32f2f', fontWeight: 'bold', fontSize: 15, marginRight: 4 },
  time: { color: '#888', fontSize: 13 },
  message: { color: '#222', fontSize: 14, marginTop: 2 },
}); 