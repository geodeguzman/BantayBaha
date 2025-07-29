import { useEffect, useState } from 'react';
import apiService from '../services/api';

export const useWaterLevels = () => {
  const [waterLevels, setWaterLevels] = useState([]);
  const [latestWaterLevel, setLatestWaterLevel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWaterLevels = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getWaterLevels();
      setWaterLevels(response.data.water_levels);
      setLatestWaterLevel(response.data.latest);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch water levels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaterLevels();
  }, []);

  return {
    waterLevels,
    latestWaterLevel,
    loading,
    error,
    refetch: fetchWaterLevels,
  };
};

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getUsers();
      setUsers(response.data.users);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
  };
};

export const useAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getAnnouncements();
      setAnnouncements(response.data.announcements);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  return {
    announcements,
    loading,
    error,
    refetch: fetchAnnouncements,
  };
};

export const useResidentLocations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getResidentLocations();
      setLocations(response.data.locations);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch resident locations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  return {
    locations,
    loading,
    error,
    refetch: fetchLocations,
  };
}; 