import { useEffect, useState } from 'react';
import apiService from '../services/api';

export const useUserProfile = (userId: number = 1) => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getUserProfile(userId);
      setUserProfile(response.user);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.updateUserProfile(userId, profileData);
      
      // Refresh profile data after update
      await fetchUserProfile();
      
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uploadProfilePicture = async (imageData: string, imageName?: string) => {
    try {
      setUploading(true);
      setError(null);
      const response = await apiService.uploadProfilePicture(userId, imageData, imageName);
      
      // Update local profile with new image URL
      if (response.success && userProfile) {
        setUserProfile({
          ...userProfile,
          profile_picture: response.image_url
        });
      }
      
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to upload profile picture');
      throw err;
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  return {
    userProfile,
    loading,
    error,
    uploading,
    fetchUserProfile,
    updateProfile,
    uploadProfilePicture,
  };
}; 