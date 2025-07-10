import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { GraduationCap, Calendar, Hash, User } from 'lucide-react-native';

export default function StudentRegistrationScreen() {
  const [formData, setFormData] = useState({
    name: '',
    registrationNumber: '',
    dateOfBirth: '',
    class: '',
    section: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { registerStudent } = useAuth();

  const handleRegisterStudent = async () => {
    if (!formData.name || !formData.registrationNumber || !formData.dateOfBirth) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      registerStudent(formData);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'Failed to register student. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('@/assets/images/top-logo-left.png')} 
              style={styles.schoolLogo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.schoolBranding}>
            <Text style={styles.schoolName}>Amalorpavam School</Text>
            <Text style={styles.schoolSubtitle}>Higher Secondary School</Text>
          </View>
          <View style={styles.iconContainer}>
            <GraduationCap size={32} color="#8B5CF6" />
          </View>
          <Text style={styles.title}>Register Student</Text>
          <Text style={styles.subtitle}>
            Add your student's information to receive notifications
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Student Name *</Text>
            <View style={styles.inputContainer}>
              <User size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({...formData, name: text})}
                placeholder="Enter student's full name"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Registration Number *</Text>
            <View style={styles.inputContainer}>
              <Hash size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.registrationNumber}
                onChangeText={(text) => setFormData({...formData, registrationNumber: text})}
                placeholder="Enter registration number"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date of Birth *</Text>
            <View style={styles.inputContainer}>
              <Calendar size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.dateOfBirth}
                onChangeText={(text) => setFormData({...formData, dateOfBirth: text})}
                placeholder="DD/MM/YYYY"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Class</Text>
              <TextInput
                style={styles.input}
                value={formData.class}
                onChangeText={(text) => setFormData({...formData, class: text})}
                placeholder="e.g., 10"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Section</Text>
              <TextInput
                style={styles.input}
                value={formData.section}
                onChangeText={(text) => setFormData({...formData, section: text})}
                placeholder="e.g., A"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegisterStudent}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Registering...' : 'Register Student'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 16,
  },
  schoolLogo: {
    width: 60,
    height: 60,
  },
  schoolBranding: {
    alignItems: 'center',
    marginBottom: 24,
  },
  schoolName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1E40AF',
    marginBottom: 4,
    textAlign: 'center',
  },
  schoolSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  button: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  skipText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
});