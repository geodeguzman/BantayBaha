import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, Easing, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

interface Report {
  id: number;
  description: string;
  estimated_damage_cost: string;
  created_at: string;
  images: string[];
}

export default function MyReportsScreen() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentReportImages, setCurrentReportImages] = useState<string[]>([]);
  const [imageLoading, setImageLoading] = useState(false);
  const router = useRouter();
  const { user } = useUser();

  // Preload adjacent images
  const preloadImages = (images: string[], currentIndex: number) => {
    const preloadIndexes = [
      currentIndex - 1,
      currentIndex + 1,
      currentIndex - 2,
      currentIndex + 2
    ].filter(index => index >= 0 && index < images.length);
    
    preloadIndexes.forEach(index => {
      ExpoImage.prefetch(images[index]);
    });
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?.id) {
        setError('Please log in to view your reports');
        setLoading(false);
        return;
      }
      
      // Replace with your actual API endpoint
      const response = await fetch('https://bantaybaha.site/api/my-reports.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id, // Use actual logged-in user's ID
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        if (data.reports && data.reports.length > 0) {
          // Process images for each report
          const processedReports = data.reports.map((report: any) => {
            let images = [];
            if (report.images) {
              // If images is a string, split by comma
              if (typeof report.images === 'string') {
                images = report.images.split(',').filter((img: string) => img.trim() !== '');
              } else if (Array.isArray(report.images)) {
                images = report.images;
              }
            }
            console.log('Report images:', images); // Debug log
            return { ...report, images };
          });
          setReports(processedReports);
        } else {
          setReports([]);
          setError('You have no reports');
        }
      } else {
        setError('Failed to load reports');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCost = (cost: string) => {
    return `₱${parseFloat(cost).toLocaleString()}`;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, marginRight: 8 }}>
            <Ionicons name="arrow-back" size={24} color="#1976d2" />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#23406e' }}>Back</Text>
        </View>
        
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>My Reports</Text>
          
          {loading ? (
            <View style={styles.centerContainer}>
              <Text style={styles.loadingText}>Loading your reports...</Text>
            </View>
          ) : error ? (
            <View style={styles.centerContainer}>
              <Text style={styles.errorText}>{error}</Text>
              {error !== 'You have no reports' && (
                <TouchableOpacity style={styles.retryButton} onPress={fetchReports}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : reports.length === 0 ? (
            <View style={styles.centerContainer}>
              <Ionicons name="document-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No reports yet</Text>
              <Text style={styles.emptySubtext}>Your flood damage reports will appear here</Text>
            </View>
          ) : (
            reports.map((report) => (
              <View key={report.id} style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <Text style={styles.reportDate}>{formatDate(report.created_at)}</Text>
                  <Text style={styles.reportCost}>Cost: {formatCost(report.estimated_damage_cost)}</Text>
                </View>
                
                <Text style={styles.reportDescription}>{report.description}</Text>
                
                {report.images && report.images.length > 0 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
                    {report.images.map((imageUrl, index) => (
                      <TouchableOpacity 
                        key={index} 
                        onPress={() => {
                          setSelectedImage(imageUrl);
                          setCurrentReportImages(report.images);
                          setCurrentImageIndex(index);
                          setImageViewerVisible(true);
                          // Preload adjacent images
                          preloadImages(report.images, index);
                        }}
                      >
                        <ExpoImage 
                          source={{ uri: imageUrl }} 
                          style={styles.reportImage}
                          contentFit="cover"
                        />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            ))
          )}
        </ScrollView>
        <AnimatedWave />
      </View>
      
      {/* Image Viewer Modal */}
      <Modal
        visible={imageViewerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageViewerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setImageViewerVisible(false)}
          >
            <Ionicons name="close" size={30} color="#fff" />
          </TouchableOpacity>
          
          {/* Navigation Arrows */}
          {currentImageIndex > 0 && (
            <TouchableOpacity 
              style={[styles.navButton, styles.leftNavButton]}
              onPress={() => {
                const newIndex = currentImageIndex - 1;
                setCurrentImageIndex(newIndex);
                setSelectedImage(currentReportImages[newIndex]);
                setImageLoading(true);
                // Preload adjacent images
                preloadImages(currentReportImages, newIndex);
              }}
            >
              <Ionicons name="chevron-back" size={30} color="#fff" />
            </TouchableOpacity>
          )}
          
          {currentImageIndex < currentReportImages.length - 1 && (
            <TouchableOpacity 
              style={[styles.navButton, styles.rightNavButton]}
              onPress={() => {
                const newIndex = currentImageIndex + 1;
                setCurrentImageIndex(newIndex);
                setSelectedImage(currentReportImages[newIndex]);
                setImageLoading(true);
                // Preload adjacent images
                preloadImages(currentReportImages, newIndex);
              }}
            >
              <Ionicons name="chevron-forward" size={30} color="#fff" />
            </TouchableOpacity>
          )}
          
          {/* Image Counter */}
          <View style={styles.imageCounter}>
            <Text style={styles.counterText}>
              {currentImageIndex + 1} / {currentReportImages.length}
            </Text>
          </View>
          
          {selectedImage && (
            <View style={styles.imageContainer}>
              {imageLoading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color="#fff" />
                </View>
              )}
              <ExpoImage 
                source={{ uri: selectedImage }} 
                style={styles.fullScreenImage}
                contentFit="contain"
                onLoadStart={() => setImageLoading(true)}
                onLoadEnd={() => setImageLoading(false)}
                transition={200}
              />
            </View>
          )}
        </View>
      </Modal>
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
    marginBottom: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    fontWeight: 'bold',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  reportCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportDate: {
    fontSize: 14,
    color: '#666',
  },
  reportCost: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  reportDescription: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 12,
  },
  imagesContainer: {
    marginTop: 8,
  },
  reportImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#eee',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -20 }],
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    padding: 10,
  },
  leftNavButton: {
    left: 20,
  },
  rightNavButton: {
    right: 20,
  },
  imageCounter: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  counterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 1,
  },
});

export const options = {
  headerShown: false,
  presentation: 'modal',
}; 