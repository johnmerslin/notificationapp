import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Image as ImageIcon, Video, FileText, Calendar, User, BookOpen, ClipboardList, Info, TriangleAlert as AlertTriangle, Mic, Play, Pause } from 'lucide-react-native';

interface Message {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'voice';
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
  imageUrl?: string;
  videoUrl?: string;
  voiceUrl?: string;
  voiceDuration?: string;
  sender: string;
  isRead: boolean;
  category: 'homework' | 'assignments' | 'school-info' | 'emergency';
}

type MessageCategory = 'all' | 'homework' | 'assignments' | 'school-info' | 'emergency';

const mockMessages: Message[] = [
  {
    id: '1',
    title: 'School Closure Notice',
    content: 'Due to heavy rainfall, school will remain closed tomorrow. All assignments will be shared online.',
    type: 'voice',
    timestamp: '2 hours ago',
    priority: 'high',
    sender: 'Principal Office',
    isRead: false,
    category: 'emergency',
    voiceUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    voiceDuration: '1:45',
  },
  {
    id: '2',
    title: 'Mathematics Homework',
    content: 'Complete exercises 1-15 from Chapter 5. Submit by tomorrow morning.',
    type: 'voice',
    timestamp: '4 hours ago',
    priority: 'medium',
    sender: 'Math Teacher',
    isRead: false,
    category: 'homework',
    voiceUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    voiceDuration: '2:30',
  },
  {
    id: '3',
    title: 'Science Project Assignment',
    content: 'Prepare a model on solar system. Submission deadline is next Friday.',
    type: 'image',
    timestamp: '1 day ago',
    priority: 'medium',
    imageUrl: 'https://images.pexels.com/photos/87009/earth-soil-creep-moon-87009.jpeg?auto=compress&cs=tinysrgb&w=800',
    sender: 'Science Teacher',
    isRead: true,
    category: 'assignments',
  },
  {
    id: '4',
    title: 'Sports Day Event',
    content: 'Annual Sports Day will be held on Saturday. Please see the attached schedule and prepare accordingly.',
    type: 'image',
    timestamp: '2 days ago',
    priority: 'medium',
    imageUrl: 'https://images.pexels.com/photos/163444/sport-treadmill-tor-trainer-163444.jpeg?auto=compress&cs=tinysrgb&w=800',
    sender: 'Sports Department',
    isRead: true,
    category: 'school-info',
  },
  {
    id: '5',
    title: 'English Literature Essay',
    content: 'Write a 500-word essay on "The importance of reading". Due date: Monday.',
    type: 'voice',
    timestamp: '3 days ago',
    priority: 'medium',
    sender: 'English Teacher',
    isRead: true,
    category: 'homework',
    voiceUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    voiceDuration: '3:15',
  },
  {
    id: '6',
    title: 'Parent-Teacher Meeting',
    content: 'Join us for the monthly parent-teacher meeting to discuss your child\'s progress.',
    type: 'video',
    timestamp: '3 days ago',
    priority: 'medium',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    sender: 'Class Teacher',
    isRead: true,
    category: 'school-info',
  },
  {
    id: '7',
    title: 'History Research Project',
    content: 'Research and present on any historical figure from the 18th century. Presentation next week.',
    type: 'text',
    timestamp: '4 days ago',
    priority: 'high',
    sender: 'History Teacher',
    isRead: true,
    category: 'assignments',
  },
  {
    id: '8',
    title: 'Emergency Contact Update',
    content: 'Please update your emergency contact information in the school portal immediately.',
    type: 'voice',
    timestamp: '5 days ago',
    priority: 'high',
    sender: 'Administration',
    isRead: true,
    category: 'emergency',
    voiceUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    voiceDuration: '4:20',
  },
];

const categories = [
  { id: 'all', name: 'All Messages', icon: FileText, color: '#6B7280' },
  { id: 'homework', name: 'Home Works', icon: BookOpen, color: '#3B82F6' },
  { id: 'assignments', name: 'Assignments', icon: ClipboardList, color: '#8B5CF6' },
  { id: 'school-info', name: 'School Info', icon: Info, color: '#10B981' },
  { id: 'emergency', name: 'Emergency', icon: AlertTriangle, color: '#EF4444' },
];

export default function MessagesScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<MessageCategory>('all');
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const { user } = useAuth();

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const filteredMessages = selectedCategory === 'all' 
    ? mockMessages 
    : mockMessages.filter(message => message.category === selectedCategory);

  const unreadCount = mockMessages.filter(message => !message.isRead).length;

  const getCategoryCount = (categoryId: string) => {
    if (categoryId === 'all') return mockMessages.length;
    return mockMessages.filter(message => message.category === categoryId).length;
  };

  const handleVoicePlay = (messageId: string) => {
    if (playingVoice === messageId) {
      setPlayingVoice(null);
    } else {
      setPlayingVoice(messageId);
      // In a real app, you would integrate with expo-av or react-native-sound
      // For demo purposes, we'll just simulate playing
      setTimeout(() => {
        setPlayingVoice(null);
      }, 3000);
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon size={16} color="#10B981" />;
      case 'video':
        return <Video size={16} color="#F59E0B" />;
      case 'voice':
        return <Mic size={16} color="#8B5CF6" />;
      default:
        return <FileText size={16} color="#6B7280" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const handleMessagePress = (message: Message) => {
    router.push(`/message/${message.id}`);
  };

  const renderVoiceMessage = (message: Message) => {
    const isPlaying = playingVoice === message.id;
    
    return (
      <View style={styles.voiceContainer}>
        <TouchableOpacity 
          style={[styles.voicePlayButton, isPlaying && styles.voicePlayButtonActive]}
          onPress={() => handleVoicePlay(message.id)}
        >
          {isPlaying ? (
            <Pause size={20} color="#FFFFFF" />
          ) : (
            <Play size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>
        <View style={styles.voiceInfo}>
          <View style={styles.voiceWaveform}>
            {[...Array(12)].map((_, index) => (
              <View 
                key={index}
                style={[
                  styles.voiceWave,
                  { 
                    height: Math.random() * 20 + 10,
                    backgroundColor: isPlaying ? '#8B5CF6' : '#D1D5DB'
                  }
                ]} 
              />
            ))}
          </View>
          <Text style={styles.voiceDuration}>{message.voiceDuration}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.schoolBranding}>
          <Image 
            source={require('@/assets/images/top-logo-left.png')} 
            style={styles.schoolLogo}
            resizeMode="contain"
          />
          <View style={styles.schoolInfo}>
            <Text style={styles.schoolName}>Amalorpavam School</Text>
            <Text style={styles.schoolSubtitle}>Higher Secondary School</Text>
          </View>
        </View>
        
        <View style={styles.headerContent}>
          <View style={styles.userSection}>
            <Text style={styles.greeting}>Good morning!</Text>
            <Text style={styles.userName}>{user?.name || 'Parent'}</Text>
          </View>
          <View style={styles.notificationBadge}>
            <Bell size={24} color="#1E40AF" />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.categoriesContainer}>
        <Text style={styles.categoriesTitle}>Message Categories</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScrollContent}
        >
          {categories.map((category) => {
            const IconComponent = category.icon;
            const isSelected = selectedCategory === category.id;
            const count = getCategoryCount(category.id);
            
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  isSelected && { backgroundColor: category.color, borderColor: category.color }
                ]}
                onPress={() => setSelectedCategory(category.id as MessageCategory)}
              >
                <View style={styles.categoryHeader}>
                  <IconComponent 
                    size={20} 
                    color={isSelected ? '#FFFFFF' : category.color} 
                  />
                  <View style={[
                    styles.categoryCount,
                    { backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : `${category.color}20` }
                  ]}>
                    <Text style={[
                      styles.categoryCountText,
                      { color: isSelected ? '#FFFFFF' : category.color }
                    ]}>
                      {count}
                    </Text>
                  </View>
                </View>
                <Text style={[
                  styles.categoryName,
                  { color: isSelected ? '#FFFFFF' : '#1F2937' }
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.messagesHeader}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'all' ? 'All Messages' : categories.find(c => c.id === selectedCategory)?.name}
          </Text>
          <Text style={styles.messageCount}>
            {filteredMessages.length} message{filteredMessages.length !== 1 ? 's' : ''}
          </Text>
        </View>
        
        {filteredMessages.length === 0 ? (
          <View style={styles.emptyState}>
            <FileText size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No Messages</Text>
            <Text style={styles.emptyText}>
              No messages found in this category
            </Text>
          </View>
        ) : (
          filteredMessages.map((message) => (
            <TouchableOpacity
              key={message.id}
              style={[
                styles.messageCard,
                !message.isRead && styles.unreadMessage
              ]}
              onPress={() => handleMessagePress(message)}
            >
              <View style={styles.messageHeader}>
                <View style={styles.messageTitle}>
                  <Text style={[styles.title, !message.isRead && styles.unreadText]}>
                    {message.title}
                  </Text>
                  <View style={styles.messageInfo}>
                    {getMessageIcon(message.type)}
                    <Text style={styles.sender}>{message.sender}</Text>
                  </View>
                </View>
                <View style={styles.messageTime}>
                  <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(message.priority) }]} />
                  <Text style={styles.timestamp}>{message.timestamp}</Text>
                </View>
              </View>

              <Text style={styles.messageContent} numberOfLines={2}>
                {message.content}
              </Text>

              {message.type === 'voice' && renderVoiceMessage(message)}

              {message.imageUrl && (
                <Image source={{ uri: message.imageUrl }} style={styles.messageImage} />
              )}

              {message.videoUrl && (
                <View style={styles.videoThumbnail}>
                  <Video size={32} color="#FFFFFF" />
                  <Text style={styles.videoText}>Watch Video</Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  schoolBranding: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  schoolLogo: {
    width: 50,
    height: 50,
    marginRight: 12,
  },
  schoolInfo: {
    flex: 1,
  },
  schoolName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1E40AF',
    marginBottom: 2,
  },
  schoolSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userSection: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  userName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginTop: 2,
  },
  notificationBadge: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  categoriesContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoriesTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  categoriesScrollContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    minWidth: 110,
    alignItems: 'center',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  categoryCount: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  categoryCountText: {
    fontSize: 11,
    fontFamily: 'Inter-Bold',
  },
  categoryName: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    lineHeight: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  messagesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  messageCount: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  messageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  unreadMessage: {
    borderColor: '#1E40AF',
    borderWidth: 2,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  messageTitle: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
    lineHeight: 20,
  },
  unreadText: {
    color: '#1E40AF',
  },
  messageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sender: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  messageTime: {
    alignItems: 'flex-end',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  messageContent: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  voiceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  voicePlayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  voicePlayButtonActive: {
    backgroundColor: '#7C3AED',
  },
  voiceInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  voiceWaveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flex: 1,
    marginRight: 12,
  },
  voiceWave: {
    width: 3,
    backgroundColor: '#D1D5DB',
    borderRadius: 1.5,
  },
  voiceDuration: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  messageImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginTop: 8,
  },
  videoThumbnail: {
    backgroundColor: '#1F2937',
    height: 120,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginTop: 8,
  },
});