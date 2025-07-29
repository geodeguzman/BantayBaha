import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, Easing, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import Svg, { Path } from 'react-native-svg';
import WaterLevelThermometer from '../../components/WaterLevelThermometer';

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

function AnimatedWave({ scrollY }: { scrollY: Animated.Value }) {
  const waveAnim = useRef(new Animated.Value(0)).current;
  const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

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

  // Horizontal translation for seamless wave movement
  const translateX = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -windowWidth],
  });

  // Water height is fixed to half the screen, but moves up as you scroll
  const topOffset = scrollY.interpolate({
    inputRange: [0, windowHeight * 0.5],
    outputRange: [0, -windowHeight * 0.5],
    extrapolate: 'clamp',
  });

  // Dimming overlay opacity increases as you scroll
  const overlayOpacity = scrollY.interpolate({
    inputRange: [0, windowHeight * 0.35],
    outputRange: [0, 0.5],
    extrapolate: 'clamp',
  });

  return (
    <>
      <Animated.View style={[StyleSheet.absoluteFill, { height: windowHeight * 0.5, width: '100%', top: 0, transform: [{ translateY: topOffset }], overflow: 'hidden', zIndex: 0 }]}> 
        <Animated.View style={{ width: windowWidth * 2, height: '100%', flexDirection: 'row', transform: [{ translateX }] }}>
          {/* Repeat the SVG pattern twice for seamless looping */}
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
      </Animated.View>
      {/* Dimming Overlay */}
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { height: windowHeight * 0.5, top: 0, transform: [{ translateY: topOffset }], backgroundColor: '#000', opacity: overlayOpacity, zIndex: 1 }]} 
      />
    </>
  );
}

export default function HomeScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const colorScheme = useColorScheme();
  const [waterLevels, setWaterLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updateCount, setUpdateCount] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  // Weather state
  const [weatherForecast, setWeatherForecast] = useState<any[]>([]);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  // Fetch latest water level data - simple approach using highest waterLevel_id
  const fetchWaterLevels = async (isRefresh = false, isAutoRefresh = false) => {
    console.log('Fetching latest water level...', { isRefresh, isAutoRefresh });
    try {
      // Only show loading states for manual refresh, not auto-refresh
      if (isRefresh && !isAutoRefresh) {
        setRefreshing(true);
      } else if (!isAutoRefresh) {
        setLoading(true);
      }
      setError(null);
      
      // Use the new simple API that gets the latest reading
      const res = await fetch('https://bantaybaha.site/api/latest-water-level.php');
      console.log('API Response status:', res.status);
      const json = await res.json();
      console.log('API Response:', json);
      
      if (json.success && json.data) {
        const latestData = json.data;
        
        // Create a simple array with just the latest reading for the chart
        const transformedData = [{
          water_level_meters: latestData.water_level_meters,
          timestamp: latestData.timestamp,
          water_level_feet: latestData.water_level_feet,
          threshold: latestData.threshold,
          sensor_id: 'real'
        }];
        
        console.log('Latest Reading:', latestData);
        console.log('Water Level ID:', latestData.id);
        console.log('Water Level (meters):', latestData.water_level_meters);
        console.log('Water Level (feet):', latestData.water_level_feet);
        console.log('Threshold:', latestData.threshold);
        console.log('Timestamp:', latestData.timestamp);
        
        // Debug feet calculation
        const meters = parseFloat(latestData.water_level_meters);
        const feet = meters * 3.28084;
        const feetInt = Math.floor(feet);
        const inches = Math.round((feet - feetInt) * 12);
        console.log('Feet calculation debug:', {
          meters,
          feet,
          feetInt,
          inches,
          display: `${feetInt}'${inches.toString().padStart(2, '0')}`
        });
        
        // Smooth update - only show notification for new data, not every refresh
        const currentId = waterLevels.length > 0 ? waterLevels[0]?.id : null;
        const isNewData = !currentId || latestData.id > currentId;
        
        // Smooth fade animation for data updates
        if (isNewData) {
          Animated.sequence([
            Animated.timing(fadeAnim, {
              toValue: 0.7,
              duration: 150,
              useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start();
        }
        
        setWaterLevels(transformedData);
        setUpdateCount(prev => prev + 1);
        setLastUpdateTime(new Date());
        
        // Only show notification for actual new data
        if (isNewData && !isAutoRefresh) {
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 3000);
        }
      } else {
        console.log('API response invalid:', json);
        if (!isAutoRefresh) {
          setError('Failed to load water levels');
        }
      }
    } catch (e) {
      console.error('Fetch error:', e);
      if (!isAutoRefresh) {
        setError('Failed to load water levels');
      }
    } finally {
      if (isRefresh && !isAutoRefresh) {
        setRefreshing(false);
      } else if (!isAutoRefresh) {
        setLoading(false);
      }
    }
  };

  // Fetch today's weather (OpenWeatherMap)
  const fetchWeatherForecast = async () => {
    setLoadingWeather(true);
    setWeatherError(null);
    try {
      const lat = 13.8327;
      const lon = 120.7420;
      const apiKey = '59b4e517d44686632beb50d052622679';
      
      // Use the free OpenWeatherMap API 2.5 forecast endpoint
      const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
      
      console.log('Weather API Response Status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Weather API Error:', errorText);
        throw new Error(`Weather API error: ${res.status}`);
      }
      
      const json = await res.json();
      console.log('Weather API Response:', json);
      
      if (json && json.list && Array.isArray(json.list)) {
        // Convert forecast data to daily format
        const dailyData: Array<{
          dt: number;
          temp: {
            day: number;
            min: number;
            max: number;
          };
          weather: Array<{
            main: string;
            description: string;
          }>;
          humidity: number;
          wind_speed: number;
        }> = [];
        const processedDays = new Set();
        
        json.list.forEach((item: any) => {
          const date = new Date(item.dt * 1000);
          const dayKey = date.toDateString();
          
          if (!processedDays.has(dayKey)) {
            processedDays.add(dayKey);
            dailyData.push({
              dt: item.dt,
              temp: {
                day: item.main.temp,
                min: item.main.temp_min,
                max: item.main.temp_max
              },
              weather: item.weather,
              humidity: item.main.humidity,
              wind_speed: item.wind.speed
            });
          }
        });
        
        setWeatherForecast(dailyData.slice(0, 7)); // 7 days
      } else {
        console.error('Invalid weather data structure:', json);
        setWeatherError('Failed to load forecast - invalid data');
      }
    } catch (e) {
      console.error('Weather fetch error:', e);
      setWeatherError('Failed to load forecast - network error');
    } finally {
      setLoadingWeather(false);
    }
  };

  useEffect(() => {
    fetchWaterLevels();
    // Fetch latest reading every 30 seconds to ensure we catch new data quickly
    const interval = setInterval(() => fetchWaterLevels(false, true), 30000); // every 30 seconds, auto-refresh
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchWeatherForecast();
  }, []);

  // Prepare chart data - simple approach with latest reading
  const chartData = {
    labels: waterLevels.length > 0 ? ['Latest'] : [],
    datasets: [
      { data: waterLevels.length > 0 ? [parseFloat(waterLevels[0].water_level_feet)] : [0] }
    ]
  };

  // Latest water level for thermometer - use current data from API
  const latestLevelMeters = waterLevels.length > 0 ? 
    parseFloat(waterLevels[waterLevels.length - 1].water_level_meters) : 0;
  
  // Get threshold level for safety status
  const getThresholdLevel = () => {
    if (waterLevels.length === 0) return 'normal';
    const latest = waterLevels[waterLevels.length - 1];
    const threshold = latest?.threshold;
    
    if (threshold === 'danger' || threshold === 'DANGER') return 'danger';
    if (threshold === 'warning' || threshold === 'WARNING') return 'warning';
    return 'normal';
  };

  // Check if data is fresh (within last 1 minute for 30-second updates)
  const isDataFresh = () => {
    if (waterLevels.length === 0) {
      console.log('No water levels data available');
      return false;
    }
    const latestTimestamp = new Date(waterLevels[waterLevels.length - 1].timestamp);
    const now = new Date();
    const diffInMinutes = (now.getTime() - latestTimestamp.getTime()) / (1000 * 60);
    console.log('Data freshness check:', {
      latestTimestamp: latestTimestamp.toISOString(),
      now: now.toISOString(),
      diffInMinutes: diffInMinutes,
      isFresh: diffInMinutes <= 1
    });
    return diffInMinutes <= 1; // 1 minute for 30-second update frequency
  };

  // Get time since last update
  const getTimeSinceLastUpdate = () => {
    if (waterLevels.length === 0) return 'No data';
    const latestTimestamp = new Date(waterLevels[waterLevels.length - 1].timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - latestTimestamp.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  };

  // Calculate water level trend like admin dashboard
  const calculateTrend = () => {
    if (waterLevels.length < 2) return { trend: 'stable', rate: 0 };
    
    const recent = waterLevels.slice(-3); // Last 3 readings
    const older = waterLevels.slice(-6, -3); // 3 readings before that
    
    if (recent.length < 3 || older.length < 3) {
      return { trend: 'stable', rate: 0 };
    }
    
    const recentAvg = recent.reduce((sum: number, item: any) => sum + parseFloat(item.water_level_meters), 0) / recent.length;
    const olderAvg = older.reduce((sum: number, item: any) => sum + parseFloat(item.water_level_meters), 0) / older.length;
    
    const change = recentAvg - olderAvg;
    
    // Calculate rate of change per minute (assuming readings are hourly)
    const timeDiffHours = 3; // 3 hours between older and recent averages
    const ratePerMinute = change / (timeDiffHours * 60);
    
    if (Math.abs(change) < 0.01) return { trend: 'stable', rate: 0 };
    return { 
      trend: change > 0 ? 'rising' : 'falling',
      rate: Math.abs(ratePerMinute)
    };
  };

  const router = useRouter();

  return (
    <View style={{flex:1, backgroundColor:'#f7f7f7'}}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      {/* Real-time notification banner */}
      {showNotification && lastUpdateTime && (
        <Animated.View 
          style={{
            position: 'absolute',
            top: 60,
            left: 16,
            right: 16,
            backgroundColor: '#4caf50',
            padding: 8,
            borderRadius: 8,
            zIndex: 1000,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>
            🔄 Real-time data updated at {lastUpdateTime.toLocaleTimeString()}
          </Text>
        </Animated.View>
      )}
      
      {/* Header at the very top */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, paddingTop: 20, paddingHorizontal: 16, zIndex: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image source={require('../../assets/images/Logo.png')} style={styles.logoIcon} />
          <Text style={styles.title}>BantayBaha</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {/* Real-time indicator */}
         
    
          
          <TouchableOpacity 
            onPress={() => fetchWaterLevels(true)}
            style={{ 
              padding: 8, 
              backgroundColor: refreshing ? '#ccc' : '#1976d2',
              borderRadius: 8
            }}
            disabled={refreshing}
          >
            <Text style={{ fontSize: 16, color: '#fff', fontWeight: 'bold' }}>
              {refreshing ? 'Loading...' : 'Refresh'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Animated SVG Water - covers top half */}
      <AnimatedWave scrollY={scrollY} />
      {/* Content */}
      <Animated.ScrollView
        style={{flex:1}}
        contentContainerStyle={{paddingBottom:32}}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchWaterLevels(true)}
            colors={['#1976d2']}
            tintColor="#1976d2"
          />
        }
      >
        {/* Top half: level, info, gauge */}
        <Animated.View style={{ 
          minHeight: Dimensions.get('window').height * 0.5, 
          justifyContent: 'flex-start', 
          paddingTop: 20, 
          zIndex: 2,
          opacity: fadeAnim
        }}>
          {/* Legend for water level graph (moved here) */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
            <View style={styles.legendRowHome}>
              <View style={[styles.legendColorHome, { backgroundColor: '#4caf50' }]} />
              <Text style={{ color: '#23406e', fontSize: 13, marginRight: 12 }}>Safe</Text>
              <View style={[styles.legendColorHome, { backgroundColor: '#FFD600' }]} />
              <Text style={{ color: '#23406e', fontSize: 13, marginRight: 12 }}>Caution</Text>
              <View style={[styles.legendColorHome, { backgroundColor: '#f44336' }]} />
              <Text style={{ color: '#23406e', fontSize: 13 }}>Danger</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={{flex:1, paddingRight:8}}>
              <Text style={styles.levelBig}>
                {waterLevels.length > 0 && (() => {
                  const meters = parseFloat(waterLevels[waterLevels.length - 1].water_level_meters);
                  const feet = meters * 3.28084;
                  const feetInt = Math.floor(feet);
                  const inches = Math.round((feet - feetInt) * 12);
                  return `${feetInt}'${inches.toString().padStart(2, '0')}"`;
                })()}
              </Text>
              <Text style={styles.levelSmall}>
                ({waterLevels.length > 0 && waterLevels[waterLevels.length - 1]?.water_level_meters ? 
                  parseFloat(waterLevels[waterLevels.length - 1].water_level_meters).toFixed(3) : 
                  '0.000'} Meters)
              </Text>
                              <Text style={styles.infoText}>This is the latest water level reading. The graph and gauge update every 30 seconds with real-time data from the database.</Text>
            </View>
            <WaterLevelThermometer levelMeters={latestLevelMeters} />
          </View>
        </Animated.View>
        
        {/* Safety Status Section */}
        <View style={styles.safetyStatusContainer}>
          <View style={styles.backgroundPattern} />
          <View style={styles.gradientOverlay} />
          <View style={styles.dotPattern} />
          <View style={styles.safetyHeader}>
            <Text style={styles.safetyTitle}>Current Status</Text>
            <View style={[styles.statusIndicator, getThresholdLevel() === 'danger' ? styles.statusDanger : getThresholdLevel() === 'warning' ? styles.statusCaution : styles.statusSafe]}>
              <Text style={styles.statusText}>
                {getThresholdLevel() === 'danger' ? 'DANGER' : getThresholdLevel() === 'warning' ? 'CAUTION' : 'SAFE'}
              </Text>
            </View>
          </View>
          
          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🌊</Text>
              <Text style={styles.statValue}>
                {waterLevels.length > 0 && waterLevels[waterLevels.length - 1]?.water_level_meters ? 
                  parseFloat(waterLevels[waterLevels.length - 1].water_level_meters).toFixed(2) : 
                  '0.00'}m
              </Text>
              <Text style={styles.statLabel}>Current Level</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📈</Text>
              <Text style={styles.statValue}>
                {calculateTrend().trend === 'rising' ? '↗️' : calculateTrend().trend === 'falling' ? '↘️' : '→'}
              </Text>
              <Text style={styles.statLabel}>{calculateTrend().trend}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>⏰</Text>
              <Text style={styles.statValue}>
                {getTimeSinceLastUpdate()}
              </Text>
              <Text style={styles.statLabel}>Last Update</Text>
            </View>
          </View>
        </View>

        {/* Safety Tips Section */}
        <View style={styles.safetyTipsContainer}>
          <View style={styles.backgroundPattern} />
          <View style={styles.gradientOverlay} />
          <View style={styles.dotPattern} />
          <TouchableOpacity 
            style={styles.safetyTipsButton}
            onPress={() => router.push('/safety-tips')}
          >
            <View style={styles.safetyTipsContent}>
              <Text style={styles.safetyTipsIcon}>🛡️</Text>
              <View style={styles.safetyTipsTextContainer}>
                <Text style={styles.safetyTipsMainTitle}>Stay Safe & Prepared</Text>
                <Text style={styles.safetyTipsSubtitle}>Essential flood safety tips and emergency procedures</Text>
              </View>
              <Text style={styles.safetyTipsArrow}>→</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.waterLevelLabel}>WATER LEVEL</Text>
        <View style={styles.chartSection}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={styles.chartTitle}>24 Hour Water Level Chart</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {refreshing && (
                <View style={{ marginRight: 8, flexDirection: 'row', alignItems: 'center' }}>
                  <ActivityIndicator size="small" color="#1976d2" />
                  <Text style={{ color: '#1976d2', fontSize: 12, marginLeft: 4 }}>Updating...</Text>
                </View>
              )}
              <View style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                paddingHorizontal: 8, 
                paddingVertical: 4, 
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#1565c0'
              }}>
                <Text style={{ fontSize: 10, color: '#666' }}>
                  Real Data • {updateCount} updates
                </Text>
              </View>
            </View>
          </View>
          {waterLevels.length > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
              <Text style={{ color: '#666', fontSize: 12, textAlign: 'center' }}>
                Last updated: {getTimeSinceLastUpdate()}
              </Text>
              <View style={{ 
                marginLeft: 8, 
                width: 8, 
                height: 8, 
                borderRadius: 4, 
                backgroundColor: waterLevels.length > 0 ? (isDataFresh() ? '#4caf50' : '#ff9800') : '#f44336' 
              }} />
            </View>
          )}
          {loading ? (
            <ActivityIndicator size="small" color="#1976d2" style={{marginVertical: 12}} />
          ) : error ? (
            <Text style={{color: 'red', textAlign: 'center'}}>{error}</Text>
          ) : waterLevels.length > 0 ? (
            <BarChart
              data={chartData}
              width={Dimensions.get('window').width - 48}
              height={180}
              yAxisLabel=""
              yAxisSuffix=" ft"
              fromZero
              chartConfig={{
                backgroundColor: '#1565c0',
                backgroundGradientFrom: '#1565c0',
                backgroundGradientTo: '#0d47a1',
                decimalPlaces: 1,
                color: (opacity = 1) => `#ffffff`,
                labelColor: (opacity = 1) => `#ffffff`,
                style: { borderRadius: 16 },
                propsForBackgroundLines: { stroke: '#ffffff', strokeDasharray: '' }
              }}
              style={{ marginVertical: 8, borderRadius: 16 }}
            />
          ) : (
            <Text style={{color: 'red', textAlign: 'center'}}>No chart data available</Text>
          )}
        </View>
        {/* Weather Section as a card - 7 day forecast */}
        <View style={{ alignItems: 'center', marginTop: 24, marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Text style={{ color: '#23406e', fontSize: 22, fontWeight: 'bold', letterSpacing: 1, fontFamily: 'Poppins' }}>BantayUlan</Text>
          </View>
          <View style={styles.weatherCard}>
            <View style={styles.backgroundPattern} />
            <View style={styles.gradientOverlay} />
            <View style={styles.dotPattern} />
            <Text style={styles.weatherCardTitle}>7-Day Forecast</Text>
            {loadingWeather ? (
              <View style={styles.weatherLoadingContainer}>
                <ActivityIndicator size="small" color="#1976d2" />
                <Text style={styles.weatherLoadingText}>Loading weather data...</Text>
              </View>
            ) : weatherError ? (
              <View style={styles.weatherErrorContainer}>
                <Text style={styles.weatherErrorText}>{weatherError}</Text>
                <TouchableOpacity 
                  style={styles.weatherRetryButton}
                  onPress={fetchWeatherForecast}
                >
                  <Text style={styles.weatherRetryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : weatherForecast.length > 0 ? (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.weatherScrollContainer}
              >
                {weatherForecast.map((day, idx) => {
                  const date = new Date(day.dt * 1000);
                  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                  const isToday = idx === 0;
                  
                  // Enhanced weather icon mapping
                  const getWeatherIcon = (weatherMain: string, weatherDesc: string) => {
                    switch (weatherMain.toLowerCase()) {
                      case 'rain':
                        return '🌧️';
                      case 'clouds':
                        return weatherDesc.toLowerCase().includes('scattered') ? '⛅' : '☁️';
                      case 'clear':
                        return '☀️';
                      case 'thunderstorm':
                        return '⛈️';
                      case 'snow':
                        return '❄️';
                      case 'mist':
                      case 'fog':
                        return '🌫️';
                      default:
                        return '🌡️';
                    }
                  };
                  
                  const icon = getWeatherIcon(day.weather[0].main, day.weather[0].description);
                  
                  return (
                    <View key={idx} style={[styles.forecastDayCard, isToday && styles.todayCard]}>
                      <Text style={[styles.forecastDayLabel, isToday && styles.todayLabel]}>{dayName}</Text>
                      <Text style={styles.forecastIcon}>{icon}</Text>
                      <Text style={styles.forecastTemp}>
                        {Math.round(day.temp.max)}° / {Math.round(day.temp.min)}°
                      </Text>
                      {isToday && <View style={styles.todayIndicator} />}
                    </View>
                  );
                })}
              </ScrollView>
            ) : (
              <View style={styles.weatherEmptyContainer}>
                <Text style={styles.weatherEmptyText}>No weather data available</Text>
              </View>
            )}
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerBox: { alignItems: 'center', marginTop: 48, marginBottom: 8, color: 'blue' },
  logoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  logoIcon: { width: 36, height: 36, marginRight: 10 },
  title: { color: '#23406e', fontSize: 28, fontWeight: 'bold', letterSpacing: 1, fontFamily: 'Poppins' },
  row: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 16, marginBottom: 8, paddingHorizontal: 12 },
  levelBig: { color: '#23406e', fontSize: 36, fontWeight: 'bold', marginBottom: 0 },
  levelSmall: { color: '#23406e', fontSize: 16, marginBottom: 2 },
  rising: { color: '#23406e', fontWeight: 'bold', marginBottom: 8 },
  infoText: { color: '#23406e', fontSize: 13, marginBottom: 8 },
  waterLevelLabel: { color: '#23406e', textAlign: 'center', marginTop: 4, fontWeight: 'bold', letterSpacing: 1 },
  chartSection: { marginTop: 32, alignItems: 'center' },
  chartTitle: { color: '#23406e', fontWeight: 'bold', marginBottom: 8 },
  weatherSection: { backgroundColor: '#fff', borderRadius: 16, margin: 16, padding: 16, marginTop: 32, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  weatherTitle: { color: '#1976d2', fontWeight: 'bold', textAlign: 'center', marginBottom: 12 },
  weatherMainRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  weatherIconMain: { width: 56, height: 56, marginRight: 12 },
  weatherMainTemp: { fontSize: 32, color: '#1976d2', fontWeight: 'bold', marginRight: 16 },
  weatherDesc: { fontSize: 16, color: '#1976d2', fontWeight: 'bold', marginLeft: 8 },
  sunTimes: { alignItems: 'center' },
  sunIcon: { fontSize: 18 },
  sunText: { fontSize: 12, color: '#888' },
  weatherList: { marginTop: 8 },
  weatherRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#e3e3e3', paddingVertical: 8 },
  weatherLabel: { fontSize: 16, color: '#1976d2', flex: 1 },
  weatherTemp: { fontSize: 20, color: '#1976d2', fontWeight: 'bold', flex: 1, textAlign: 'center' },
  weatherIcon: { width: 28, height: 28, flex: 1 },
  forecastDay: { alignItems: 'center', marginHorizontal: 8, backgroundColor: '#f0f4fa', borderRadius: 8, padding: 8, minWidth: 56 },
  forecastDayLabel: { 
    fontSize: 14, 
    color: '#ffffff', 
    fontWeight: 'bold', 
    marginBottom: 2 
  },
  forecastIcon: { 
    fontSize: 24, 
    marginBottom: 2 
  },
  forecastTemp: { 
    fontSize: 13, 
    color: '#ffffff' 
  },
  legendRowHome: { flexDirection: 'row', alignItems: 'center' },
  legendColorHome: { width: 16, height: 16, borderRadius: 4, marginRight: 4, borderWidth: 1, borderColor: '#bbb' },
  weatherCard: {
    backgroundColor: '#00008b',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#1565c0',
  },
  weatherCardTitle: {
    color: '#00008b',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  weatherLoadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  weatherLoadingText: {
    color: '#00008b',
    fontSize: 14,
    marginTop: 10,
  },
  weatherErrorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  weatherErrorText: {
    color: '#ff6b6b',
    textAlign: 'center',
    marginBottom: 10,
  },
  weatherRetryButton: {
    backgroundColor: '#00008b',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  weatherRetryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  weatherScrollContainer: {
    alignItems: 'center',
  },
  forecastDayCard: {
    alignItems: 'center',
    marginHorizontal: 8,
    backgroundColor: '#000080',
    borderRadius: 8,
    padding: 8,
    minWidth: 100,
  },
  todayCard: {
    backgroundColor: '#000060',
    borderWidth: 2,
    borderColor: '#00008b',
  },
  todayLabel: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  todayIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ffffff',
    marginTop: 8,
  },
  weatherEmptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  weatherEmptyText: {
    color: '#00008b',
    fontSize: 16,
  },
  // New styles for safety status and tips
  safetyStatusContainer: {
    backgroundColor: '#00008b',
    borderRadius: 16,
    margin: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#1565c0',
  },
  safetyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  safetyTitle: {
    color: '#00008b',
    fontWeight: 'bold',
    fontSize: 20,
  },
  statusIndicator: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusSafe: {
    backgroundColor: '#e8f5e9',
    borderWidth: 1,
    borderColor: '#4caf50',
  },
  statusCaution: {
    backgroundColor: '#ffde21',
    borderWidth: 1,
    borderColor: '#ffee58',
  },
  statusDanger: {
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: '#f44336',
  },
  statusText: {
    color: '#00008b',
    fontWeight: 'bold',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  statCard: {
    alignItems: 'center',
    width: '30%', // Adjust as needed
  },
  statIcon: {
    fontSize: 36,
    marginBottom: 5,
  },
  statValue: {
    color: '#00008b',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#000080',
    fontSize: 12,
  },
  safetyTipsContainer: {
    backgroundColor: '#00008b',
    borderRadius: 16,
    margin: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#1565c0',
  },
  safetyTipsButton: {
    backgroundColor: '#1565c0',
    borderRadius: 12,
    padding: 15,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  safetyTipsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  safetyTipsIcon: {
    fontSize: 36,
    marginRight: 15,
  },
  safetyTipsTextContainer: {
    flex: 1,
  },
  safetyTipsMainTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  safetyTipsSubtitle: {
    color: '#e3f2fd',
    fontSize: 13,
  },
  safetyTipsArrow: {
    fontSize: 24,
    color: '#e3f2fd',
  },
  // Remove unused styles - quickInfoContainer, emergencyContainer, etc.
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 16,
    zIndex: -1,
  },
  waterPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 16,
    zIndex: -1,
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#e3f2fd',
    borderRadius: 16,
    zIndex: -1,
    opacity: 0.8,
  },
  dotPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    zIndex: -1,
  },
}); 