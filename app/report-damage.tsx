import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, Easing, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useUser } from '../components/UserContext';

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

function AnimatedWave() {
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 3500,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();
  }, [waveAnim]);

  const translateX = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -windowWidth],
  });

  return (
    <View style={styles.waveContainer}>
      <Animated.View style={[styles.waveInner, { transform: [{ translateX }] }]}>
        <Svg height="100%" width={windowWidth} viewBox={`0 0 ${windowWidth} 320`}>
          <Path
            d={`M0 160 Q ${windowWidth / 2} 220, ${windowWidth} 160 T ${windowWidth} 160 V320 H0 Z`}
            fill="#2196f3"
            opacity={0.7}
          />
          <Path
            d={`M0 180 Q ${windowWidth / 2} 240, ${windowWidth} 180 T ${windowWidth} 180 V320 H0 Z`}
            fill="#1976d2"
            opacity={0.5}
          />
        </Svg>
        <Svg height="100%" width={windowWidth} viewBox={`0 0 ${windowWidth} 320`}>
          <Path
            d={`M0 160 Q ${windowWidth / 2} 220, ${windowWidth} 160 T ${windowWidth} 160 V320 H0 Z`}
            fill="#2196f3"
            opacity={0.7}
          />
          <Path
            d={`M0 180 Q ${windowWidth / 2} 240, ${windowWidth} 180 T ${windowWidth} 180 V320 H0 Z`}
            fill="#1976d2"
            opacity={0.5}
          />
        </Svg>
      </Animated.View>
    </View>
  );
}

export default function ReportDamageScreen() {
  const [description, setDescription] = useState('');
  const [damageCost, setDamageCost] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const { user } = useUser();

  const pickImages = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled) {
      const uris = result.assets.map((asset) => asset.uri);
      if (images.length + uris.length > 4) {
        Alert.alert('Limit Exceeded', 'You can only upload up to 4 images.');
        return;
      }
      setImages((prev) => [...prev, ...uris]);
    }
  };

  const removeImage = (uri: string) => {
    setImages((prev) => prev.filter((img) => img !== uri));
  };

  const handleSubmit = async () => {
    if (!description.trim() || !damageCost.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }

    Alert.alert('Submit Report', 'Are you sure you want to submit this damage report?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Submit',
        style: 'default',
        onPress: async () => {
          try {
            setUploading(true);
            
            // Convert images to base64
            const base64Images = [];
            for (const imageUri of images) {
              try {
                const response = await fetch(imageUri);
                const blob = await response.blob();
                const reader = new FileReader();
                const base64 = await new Promise((resolve) => {
                  reader.onload = () => resolve(reader.result);
                  reader.readAsDataURL(blob);
                });
                base64Images.push(base64);
              } catch (error) {
                console.error('Error converting image to base64:', error);
              }
            }

            // Prepare the data to send
            const reportData = {
              user_id: user?.id, // Use actual logged-in user's ID
              description: description.trim(),
              damage_cost: damageCost.trim(),
              images: base64Images
            };

            // Send to API
            const apiResponse = await fetch('https://bantaybaha.site/api/report-flood.php', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(reportData),
            });

            console.log('API Response Status:', apiResponse.status);
            const responseText = await apiResponse.text();
            console.log('API Response Text:', responseText);

            let result;
            try {
              result = JSON.parse(responseText);
            } catch (parseError) {
              console.error('JSON Parse Error:', parseError);
              console.error('Response Text:', responseText);
              Alert.alert('Error', 'Server returned invalid response. Please try again.');
              return;
            }

            if (result.success) {
              Alert.alert(
                'Successfully Reported!',
                'Your flood damage report has been submitted successfully.',
                [
                  {
                    text: 'Go back to home',
                    onPress: () => router.replace('/(tabs)/home'),
                  },
                ]
              );
            } else {
              Alert.alert('Error', result.message || 'Failed to submit report. Please try again.');
            }
          } catch (error) {
            console.error('Error submitting report:', error);
            Alert.alert('Error', 'Network error. Please check your connection and try again.');
          } finally {
            setUploading(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 }}>
            <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, marginRight: 8 }}>
              <Ionicons name="arrow-back" size={24} color="#1976d2" />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#23406e' }}>Back</Text>
          </View>
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>Report Flood Damages</Text>

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Describe the damage..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />
            <Text style={styles.label}>Upload Images</Text>
            <View style={styles.imageRow}>
              {images.map((uri) => (
                <View key={uri} style={styles.imagePreviewBox}>
                  <Image source={{ uri }} style={styles.imagePreview} />
                  <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeImage(uri)}>
                    <Ionicons name="close-circle" size={20} color="#d32f2f" />
                  </TouchableOpacity>
                </View>
              ))}
              {images.length < 4 && (
                <TouchableOpacity style={styles.addImageBtn} onPress={pickImages}>
                  <Ionicons name="add" size={28} color="#1976d2" />
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.label}>Estimated Damage Cost</Text>
            <View style={styles.pesoRow}>
              <Text style={styles.pesoSign}>₱</Text>
              <TextInput
                style={styles.costInput}
                placeholder="0.00"
                value={damageCost}
                onChangeText={setDamageCost}
                keyboardType="numeric"
              />
            </View>
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={uploading}>
              <Text style={styles.submitBtnText}>{uploading ? 'Submitting...' : 'Submit Report'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
        <AnimatedWave />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 10,
    backgroundColor: '#fff',
    flexGrow: 1,
    paddingBottom: 120,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#23406e',
    letterSpacing: 1,
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    color: '#1976d2',
    fontWeight: 'bold',
    marginBottom: 6,
    marginTop: 18,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    minHeight: 80,
    backgroundColor: '#f7f7f7',
    textAlignVertical: 'top',
  },
  imageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  imagePreviewBox: {
    position: 'relative',
    marginRight: 10,
    marginBottom: 10,
  },
  imagePreview: {
    width: 64,
    height: 64,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbb',
  },
  removeImageBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  addImageBtn: {
    width: 64,
    height: 64,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1976d2',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
  },
  pesoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 24,
  },
  pesoSign: {
    fontSize: 22,
    color: '#1976d2',
    marginRight: 6,
    fontWeight: 'bold',
  },
  costInput: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  submitBtn: {
    backgroundColor: '#1976d2',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  waveContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: windowHeight * 0.3,
    zIndex: -1,
  },
  waveInner: {
    width: windowWidth * 2,
    height: '100%',
    flexDirection: 'row',
  },
});

export const options = {
  headerShown: false,
  presentation: 'modal',
};
