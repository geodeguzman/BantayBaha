import { Image as ExpoImage } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useUser } from '../../components/UserContext';
import { useUserProfile } from '../../hooks/useUserProfile';

export default function MeScreen() {
  const router = useRouter();
  const { user } = useUser();
  const userId = user?.id;
  const { userProfile, loading, error, uploading, updateProfile, uploadProfilePicture } = useUserProfile(userId);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editNumber, setEditNumber] = useState('');
  const [editAge, setEditAge] = useState('');
  const [saving, setSaving] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => router.replace('/login'),
        },
      ]
    );
  };

  const openEditModal = () => {
    setEditName(userProfile?.name || '');
    setEditEmail(userProfile?.email || '');
    setEditNumber(userProfile?.number || '');
    setEditAge(userProfile?.age ? String(userProfile.age) : '');
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile({
        name: editName,
        email: editEmail,
        number: editNumber,
        age: editAge,
        profile_picture: userProfile?.profile_picture, // preserve profile picture
      });
      setEditModalVisible(false);
      Alert.alert('Success', 'Profile updated!');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const pickImage = async (useCamera: boolean = false) => {
    try {
      setShowImagePicker(false);
      // Request camera and media library permissions
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!cameraPermission.granted || !mediaPermission.granted) {
        Alert.alert('Permission Required', 'Please allow camera and photo library access to upload a profile picture.');
        return;
      }
      let result;
      if (useCamera) {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
          base64: true,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
          base64: true,
        });
      }
      if (!result.canceled && result.assets[0]) {
        const imageData = `data:image/jpeg;base64,${result.assets[0].base64}`;
        try {
          await uploadProfilePicture(imageData, `profile_${Date.now()}.jpg`);
          Alert.alert('Success', 'Profile picture updated successfully!');
        } catch (error: any) {
          Alert.alert('Upload Failed', error.message || 'Failed to upload profile picture');
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'Choose Profile Picture',
      'Select an option',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: () => pickImage(true) },
        { text: 'Choose from Library', onPress: () => pickImage(false) },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={{ marginTop: 10, color: '#666' }}>Loading profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <Text style={{ color: 'red', textAlign: 'center' }}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => window.location.reload()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        {/* Fixed Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8, paddingTop: 20, zIndex: 10 }}>
          <ExpoImage
            source={require('../../assets/images/Logo.png')}
            style={styles.logoIcon}
            contentFit="cover"
          />
          <Text style={styles.title}>BantayBaha</Text>
        </View>
        
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"
        >
          <View style={styles.container}>
            <TouchableOpacity onPress={showImagePickerOptions} style={styles.avatarContainer}>
              {userProfile?.profile_picture && typeof userProfile.profile_picture === 'string' && userProfile.profile_picture.startsWith('http') ? (
                <ExpoImage
                  source={{ uri: userProfile.profile_picture }} 
                  style={styles.avatar}
                  contentFit="cover"
                />
              ) : (
                // Placeholder avatar if no profile picture
                <View style={[styles.avatar, { backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' }]}/>
              )}
              {uploading && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator color="#fff" size="small" />
                </View>
              )}
              <View style={styles.editAvatarButton}>
                <Text style={styles.editAvatarText}>📷</Text>
              </View>
            </TouchableOpacity>

            {/* Name and handle */}
            <Text style={styles.name}>{userProfile?.name || 'User Name'}</Text>
            <Text style={styles.handle}>@{userProfile?.username || 'username'}</Text>

            {/* Info fields */}
            <View style={styles.infoField}>
              <Text style={styles.infoFieldText}>Email: {userProfile?.email || 'No email'}</Text>
            </View>
            <View style={styles.infoField}>
              <Text style={styles.infoFieldText}>Mobile Number: {userProfile?.number || 'No number'}</Text>
            </View>
            <View style={styles.infoField}>
              <Text style={styles.infoFieldText}>Age: {userProfile?.age || 'No age'}</Text>
            </View>

            {/* Edit profile button */}
            <TouchableOpacity style={styles.editProfileBtn} onPress={openEditModal}>
              <Text style={styles.editProfileText}>Edit profile</Text>
              <ExpoImage
                source={require('../../assets/images/pencilicon.png')}
                style={styles.editIcon}
                contentFit="cover"
              />
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Info cards */}
            <View style={styles.card}>
              <TouchableOpacity style={{flex:1}} onPress={() => router.push('/report-damage')} activeOpacity={0.8}>
                <Text style={styles.cardTitle}>Report Flood Damages</Text>
                <Text style={styles.cardDesc}>Use this button to report any flood damage in your area. Your report helps local officials respond quickly.</Text>
              </TouchableOpacity>
              <ExpoImage
                source={require('../../assets/images/reporticon.png')}
                style={styles.cardIcon}
                contentFit="cover"
              />
            </View>
            <View style={styles.card}>
              <TouchableOpacity style={{flex:1}} onPress={() => router.push('/my-reports')} activeOpacity={0.8}>
                <Text style={styles.cardTitle}>My Reports</Text>
                <Text style={styles.cardDesc}>Shows your past flood damage reports. Track the status and details of each one.</Text>
              </TouchableOpacity>
              <ExpoImage
                source={require('../../assets/images/reportsicon.png')}
                style={styles.cardIcon}
                contentFit="cover"
              />
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Log Out Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

          {/* Edit Profile Modal */}
          <Modal
            visible={editModalVisible}
            animationType="slide"
            transparent
            onRequestClose={() => setEditModalVisible(false)}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.4)',
              }}
            >
              <View style={{
                width: '90%',
                backgroundColor: '#fff',
                borderRadius: 16,
                padding: 20,
                alignItems: 'center',
              }}>
                <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>Edit Profile</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Name"
                  value={editName}
                  onChangeText={setEditName}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={editEmail}
                  onChangeText={setEditEmail}
                  keyboardType="email-address"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Number"
                  value={editNumber}
                  onChangeText={setEditNumber}
                  keyboardType="phone-pad"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Age"
                  value={editAge}
                  onChangeText={setEditAge}
                  keyboardType="numeric"
                />
                <View style={{ flexDirection: 'row', marginTop: 16 }}>
                  <TouchableOpacity
                    style={[styles.saveBtn, { marginRight: 10 }]}
                    onPress={handleSaveProfile}
                    disabled={saving}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>{saving ? 'Saving...' : 'Save'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => setEditModalVisible(false)}
                    disabled={saving}
                  >
                    <Text style={{ color: '#1976d2', fontWeight: 'bold' }}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </Modal>
        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingTop: 20,
    paddingHorizontal: 18,
  },
  logoIcon: { width: 36, height: 36, marginRight: 10 },
  title: { color: '#23406e', fontSize: 28, fontWeight: 'bold', letterSpacing: 1, fontFamily: 'Poppins' },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginTop: 10,
    marginBottom: 10,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1976d2',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  editAvatarText: {
    fontSize: 18,
    color: '#fff',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
    textAlign: 'center',
  },
  handle: {
    fontSize: 13,
    color: '#888',
    marginBottom: 16,
    textAlign: 'center',
  },
  infoField: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  infoFieldText: {
    fontSize: 14,
    color: '#222',
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 4,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#bbb',
    backgroundColor: '#fff',
  },
  editProfileText: {
    fontSize: 13,
    color: '#222',
    marginRight: 6,
  },
  editIcon: {
    width: 18,
    height: 18,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#bbb',
    marginVertical: 14,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#bbb',
    padding: 14,
    marginBottom: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#222',
    marginBottom: 2,
  },
  cardDesc: {
    fontSize: 13,
    color: '#444',
  },
  cardIcon: {
    width: 38,
    height: 38,
    marginLeft: 12,
  },
  logoutButton: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#d32f2f',
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 20,
    marginTop: 10,
    marginBottom: 18,
  },
  logoutButtonText: {
    color: '#d32f2f',
    fontSize: 16,
    fontWeight: 'bold',
  },
  retryButton: {
    backgroundColor: '#1976d2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    height: 38,
    borderColor: '#888',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    marginBottom: 10,
    fontSize: 15,
    backgroundColor: '#fff',
  },
  saveBtn: {
    backgroundColor: '#1976d2',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  cancelBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#1976d2',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  scrollContent: { flexGrow: 1, alignItems: 'center', justifyContent: 'flex-start' },
});
