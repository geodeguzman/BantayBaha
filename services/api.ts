import axios from 'axios';

// Base URL for your API - try different formats
const BASE_URL = 'https://bantaybaha.site/api';

// Create axios instance with better error handling
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status);
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// API service functions
export const apiService = {
  // Water Level APIs
  getWaterLevels: async () => {
    try {
      // Try the main endpoint first
      const response = await api.get('/water-level.php');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching water levels:', error);
      
      // If 404, try alternative endpoints
      if (error.response?.status === 404) {
        try {
          console.log('Trying alternative endpoint...');
          const altResponse = await api.get('/water-levels-fix.php');
          return altResponse.data;
        } catch (altError: any) {
          console.error('Alternative endpoint also failed:', altError);
          throw new Error('API endpoints not found. Please upload the API files to your server.');
        }
      }
      
      throw error;
    }
  },

  getLatestWaterLevel: async () => {
    try {
      const response = await api.get('/water-level.php');
      return response.data.data.latest;
    } catch (error: any) {
      console.error('Error fetching latest water level:', error);
      
      if (error.response?.status === 404) {
        try {
          const altResponse = await api.get('/water-levels-fix.php');
          return altResponse.data.data.latest;
        } catch (altError: any) {
          console.error('Alternative endpoint also failed:', altError);
          throw new Error('API endpoints not found. Please upload the API files to your server.');
        }
      }
      
      throw error;
    }
  },

  // User APIs
  getUsers: async () => {
    try {
      const response = await api.get('/users.php');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Announcement APIs
  getAnnouncements: async () => {
    try {
      const response = await api.get('/announcements.php');
      return response.data;
    } catch (error) {
      console.error('Error fetching announcements:', error);
      throw error;
    }
  },

  // Resident Location APIs
  getResidentLocations: async () => {
    try {
      const response = await api.get('/resident-locations.php');
      return response.data;
    } catch (error) {
      console.error('Error fetching resident locations:', error);
      throw error;
    }
  },

  // Login API
  login: async (username: string, password: string) => {
    try {
      const response = await api.post('/login.php', {
        username,
        password
      });
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.response?.status === 401) {
        throw new Error('Invalid username or password');
      }
      throw new Error('Login failed. Please try again.');
    }
  },

  // User Profile APIs
  getUserProfile: async (userId: number = 1) => {
    try {
      const response = await api.get(`/user-profile.php?user_id=${userId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      throw new Error('Failed to fetch profile');
    }
  },

  updateUserProfile: async (userId: number, profileData: any) => {
    try {
      const response = await api.post('/user-profile.php', {
        user_id: userId,
        ...profileData
      });
      return response.data;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      throw new Error('Failed to update profile');
    }
  },

  uploadProfilePicture: async (userId: number, imageData: string, imageName?: string) => {
    try {
      const response = await api.post('/upload-profile-picture.php', {
        user_id: userId,
        image: imageData,
        image_name: imageName
      });
      return response.data;
    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      throw new Error('Failed to upload profile picture');
    }
  },
};

export default apiService; 