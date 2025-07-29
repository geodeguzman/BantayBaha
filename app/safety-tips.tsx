import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useColorScheme } from '../hooks/useColorScheme';

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

export default function SafetyTipsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();

  const safetyTips = [
    {
      category: "Before a Flood",
      icon: "🏠",
      tips: [
        {
          title: "Know Your Risk",
          description: "Check if your area is prone to flooding and understand evacuation routes.",
          details: "Research your community's flood history and sign up for emergency alerts."
        },
        {
          title: "Prepare Emergency Kit",
          description: "Keep essential supplies ready including food, water, and medications.",
          details: "Include: 3-day supply of water (1 gallon per person per day), non-perishable food, first aid kit, flashlight, batteries, important documents, and cash."
        },
        {
          title: "Protect Your Home",
          description: "Install flood barriers and seal basement walls.",
          details: "Consider installing sump pumps, backflow valves, and elevating electrical systems above potential flood levels."
        },
        {
          title: "Insurance Coverage",
          description: "Ensure you have adequate flood insurance coverage.",
          details: "Standard homeowners insurance doesn't cover flood damage. Purchase separate flood insurance through the National Flood Insurance Program."
        }
      ]
    },
    {
      category: "During a Flood",
      icon: "🌊",
      tips: [
        {
          title: "Stay Informed",
          description: "Monitor weather reports and emergency broadcasts.",
          details: "Listen to local radio, TV, or NOAA Weather Radio for updates. Follow instructions from local officials."
        },
        {
          title: "Evacuate When Ordered",
          description: "Leave immediately when evacuation orders are issued.",
          details: "Don't wait until the last minute. Move to higher ground and avoid walking or driving through floodwaters."
        },
        {
          title: "Avoid Floodwaters",
          description: "Never walk, swim, or drive through floodwaters.",
          details: "Just 6 inches of moving water can knock you down, and 1 foot can sweep your vehicle away."
        },
        {
          title: "Turn Off Utilities",
          description: "Shut off electricity, gas, and water if instructed.",
          details: "This prevents fires, explosions, and electrocution during flooding."
        }
      ]
    },
    {
      category: "After a Flood",
      icon: "🔧",
      tips: [
        {
          title: "Wait for All Clear",
          description: "Don't return home until authorities say it's safe.",
          details: "Floodwaters can remain dangerous even after they begin to recede."
        },
        {
          title: "Document Damage",
          description: "Take photos and videos of all damage for insurance claims.",
          details: "Document everything before beginning cleanup. Contact your insurance company immediately."
        },
        {
          title: "Clean Safely",
          description: "Wear protective gear and use proper cleaning methods.",
          details: "Wear gloves, masks, and boots. Use bleach solutions to disinfect. Discard contaminated items."
        },
        {
          title: "Check for Hazards",
          description: "Inspect for structural damage and electrical hazards.",
          details: "Look for foundation cracks, gas leaks, and electrical damage. Have professionals inspect before re-entering."
        }
      ]
    },
    {
      category: "Emergency Contacts",
      icon: "📞",
      tips: [
        {
          title: "Local Emergency Services",
          description: "Save important emergency numbers in your phone.",
          details: "Police: 911, Fire Department: 911, Local Emergency Management: Check your city's website"
        },
        {
          title: "Family Communication Plan",
          description: "Establish how family members will contact each other.",
          details: "Designate an out-of-town contact person. Text messages often work when calls don't."
        },
        {
          title: "Insurance Information",
          description: "Keep insurance policy numbers and agent contact info handy.",
          details: "Store copies of important documents in a waterproof container or cloud storage."
        },
        {
          title: "Medical Information",
          description: "Keep medical records and prescription information accessible.",
          details: "Include allergies, medications, and emergency contacts for each family member."
        }
      ]
    },
    {
      category: "Water Safety",
      icon: "💧",
      tips: [
        {
          title: "Boil Water Orders",
          description: "Follow boil water advisories after flooding.",
          details: "Boil water for at least 1 minute or use bottled water until authorities confirm water is safe."
        },
        {
          title: "Avoid Contaminated Water",
          description: "Don't use floodwater for drinking, cooking, or cleaning.",
          details: "Floodwater can contain sewage, chemicals, and other contaminants."
        },
        {
          title: "Well Water Safety",
          description: "Test well water after flooding before using.",
          details: "Have your well tested by a professional before resuming use."
        },
        {
          title: "Water Treatment",
          description: "Use proper water treatment methods if needed.",
          details: "Consider installing water filters and treatment systems for long-term protection."
        }
      ]
    }
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f7f7f7' }}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#23406e" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Flood Safety Tips</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {safetyTips.map((category, categoryIndex) => (
          <View key={categoryIndex} style={styles.categoryContainer}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={styles.categoryTitle}>{category.category}</Text>
            </View>
            
            {category.tips.map((tip, tipIndex) => (
              <View key={tipIndex} style={styles.tipContainer}>
                <View style={styles.tipHeader}>
                  <Text style={styles.tipTitle}>{tip.title}</Text>
                </View>
                <Text style={styles.tipDescription}>{tip.description}</Text>
                <View style={styles.detailsContainer}>
                  <Text style={styles.detailsLabel}>Details:</Text>
                  <Text style={styles.tipDetails}>{tip.details}</Text>
                </View>
              </View>
            ))}
          </View>
        ))}
        
        {/* Emergency Action Card */}
        <View style={styles.emergencyCard}>
          <Text style={styles.emergencyTitle}>🚨 Emergency Actions</Text>
          <Text style={styles.emergencyText}>
            If you're in immediate danger, call 911 immediately. 
            Don't wait for official warnings if you see rapidly rising water.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#23406e',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  categoryContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  tipContainer: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tipHeader: {
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#23406e',
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
    lineHeight: 20,
  },
  detailsContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  detailsLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 4,
  },
  tipDetails: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  emergencyCard: {
    backgroundColor: '#fff3cd',
    borderWidth: 1,
    borderColor: '#ffeaa7',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  emergencyText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
}); 