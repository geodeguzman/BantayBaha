import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useUser } from '../components/UserContext';
import apiService from '../services/api';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useUser();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both username and password.');
      return;
    }

    setLoading(true);
    
    try {
      const response = await apiService.login(email, password);
      
      if (response.success) {
        setUser(response.user); // Save user info to context
        console.log('Login successful:', response.user);
        router.replace('/(tabs)/home');
      } else {
        Alert.alert('Login Failed', response.error || 'Invalid credentials');
      }
    } catch (error: any) {
      Alert.alert('Login Error', error.message || 'Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/Logo.png')} // Replace with your logo if available
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>BantayBaha</Text>
        </View>

        {/* Inputs */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email / Username / Number"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor="#808080"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#808080"
          />
          <TouchableOpacity 
            style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.forgotText}>Forgot Password</Text>
          </TouchableOpacity>
        </View>

        {/* Decorative Wave */}
        {/* <Image source={require('../assets/images/floodmap.png')} style={styles.wave} resizeMode="cover" /> */}
        {/* Help Icon */}
        {/* <TouchableOpacity style={styles.helpIcon}>
          <Image source={require('../assets/images/cautionicon.png')} style={{ width: 32, height: 32 }} />
        </TouchableOpacity> */} 
      </View>
    </KeyboardAvoidingView>
  );
}

function LoginButton({ text, icon }: { text: string; icon: any }) {
  return (
    <TouchableOpacity style={styles.socialButton}>
      <Text style={styles.socialButtonText}>{text}</Text>
      <Image source={icon} style={styles.socialIcon} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center', // Center vertically
    paddingHorizontal: 18,
    backgroundColor: '#fff',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 18,
  },
  logo: {
    width: 140,
    height: 110,
    marginBottom: 2,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6bb6e9',
    marginBottom: 10,
    fontFamily: 'Poppins',
  },
  inputContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'center', // Center inputs vertically if needed
    color: '#808080',
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
  loginButton: {
    width: '100%',
    height: 38,
    backgroundColor: '#4285f4',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loginButtonDisabled: {
    backgroundColor: '#ccc',
  },
  forgotText: {
    color: '#888',
    fontSize: 13,
    textDecorationLine: 'underline',
    marginBottom: 6,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 10,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#bbb',
  },
  orText: {
    marginHorizontal: 8,
    color: '#888',
    fontSize: 15,
  },
  socialContainer: {
    width: '100%',
    marginBottom: 10,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6bb6e9',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  socialButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  socialIcon: {
    width: 22,
    height: 22,
    marginLeft: 10,
  },
  wave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: 90,
    opacity: 0.95,
  },
  helpIcon: {
    position: 'absolute',
    bottom: 18,
    right: 18,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 2,
    elevation: 2,
  },
}); 