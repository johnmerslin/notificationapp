import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Linking } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Calendar, User, Image as ImageIcon, Video, ExternalLink, BookOpen, ClipboardList, Info, TriangleAlert as AlertTriangle, Mic, Play, Pause } from 'lucide-react-native';

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
  fullContent: string;
  dateTime: string;
  category: 'homework' | 'assignments' | 'school-info' | 'emergency';
}

// Mock data for detailed message view
const mockMessageDetails: Record<string, Message> = {
  '1': {
    id: '1',
    title: 'School Closure Notice',
    content: 'Due to heavy rainfall, school will remain closed tomorrow. All assignments will be shared online.',
    type: 'voice',
    timestamp: '2 hours ago',
    priority: 'high',
    sender: 'Principal Office',
    fullContent: 'Dear Parents and Students,\n\nDue to the heavy rainfall warning issued by the meteorological department, the school will remain closed tomorrow (March 15th, 2024).\n\nAll scheduled classes will be conducted online through our virtual learning platform. Teachers will share assignments and study materials via the school portal.\n\nPlease ensure your children are prepared for online classes and have access to their devices and study materials.\n\nFor any urgent queries, please contact the school office.\n\nStay safe and dry!\n\nBest regards,\nPrincipal\nAmalorpavam School',
    dateTime: 'March 14, 2024 at 2:30 PM',
    category: 'emergency',
    voiceUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    voiceDuration: '1:45',
  },
  '2': {
    id: '2',
    title: 'Mathematics Homework',
    content: 'Complete exercises 1-15 from Chapter 5. Submit by tomorrow morning.',
    type: 'voice',
    timestamp: '4 hours ago',
    priority: 'medium',
    sender: 'Math Teacher',
    fullContent: 'Dear Students,\n\nPlease complete the following mathematics homework for tomorrow:\n\nChapter 5: Algebraic Expressions\n• Exercise 5.1: Questions 1-15\n• Focus on simplifying expressions\n• Show all working steps clearly\n\nSubmission Details:\n• Submit by 9:00 AM tomorrow\n• Write answers in your homework notebook\n• Bring textbook for reference\n\nIf you have any doubts, please ask during tomorrow\'s class.\n\nBest regards,\nMrs. Sarah Johnson\nMathematics Teacher\nAmalorpavam School',
    dateTime: 'March 14, 2024 at 12:30 PM',
    category: 'homework',
    voiceUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    voiceDuration: '2:30',
  },
  '3': {
    id: '3',
    title: 'Science Project Assignment',
    content: 'Prepare a model on solar system. Submission deadline is next Friday.',
    type: 'image',
    timestamp: '1 day ago',
    priority: 'medium',
    imageUrl: 'https://images.pexels.com/photos/87009/earth-soil-creep-moon-87009.jpeg?auto=compress&cs=tinysrgb&w=800',
    sender: 'Science Teacher',
    fullContent: 'Dear Students,\n\nYour next science project assignment is to create a model of the solar system.\n\nProject Requirements:\n• Create a 3D model showing all planets\n• Include the sun and major moons\n• Use appropriate scale and colors\n• Add labels for each celestial body\n• Prepare a 5-minute presentation\n\nMaterials Suggested:\n• Styrofoam balls of different sizes\n• Acrylic paints\n• Wooden sticks or wire\n• Cardboard base\n• Reference materials\n\nSubmission: Next Friday, March 22nd\nPresentation: Following Monday\n\nThis project will count for 20% of your term grade.\n\nBest regards,\nDr. Michael Chen\nScience Department\nAmalorpavam School',
    dateTime: 'March 13, 2024 at 2:15 PM',
    category: 'assignments',
  },
  '4': {
    id: '4',
    title: 'Sports Day Event',
    content: 'Annual Sports Day will be held on Saturday. Please see the attached schedule and prepare accordingly.',
    type: 'image',
    timestamp: '2 days ago',
    priority: 'medium',
    imageUrl: 'https://images.pexels.com/photos/163444/sport-treadmill-tor-trainer-163444.jpeg?auto=compress&cs=tinysrgb&w=800',
    sender: 'Sports Department',
    fullContent: 'Dear Parents and Students,\n\nWe are excited to announce our Annual Sports Day event scheduled for Saturday, March 16th, 2024.\n\nEvent Details:\n• Time: 9:00 AM - 4:00 PM\n• Venue: School Ground\n• Dress Code: Sports uniform\n\nEvents include:\n- Track and Field (100m, 200m, 400m)\n- Basketball Tournament\n- Football Matches\n- Relay Races\n- Tug of War\n- Long Jump and High Jump\n\nPlease ensure your children bring:\n- Water bottles\n- Healthy snacks\n- Sunscreen\n- Sports shoes\n- Towel\n\nParents are welcome to attend and cheer for their children. Light refreshments will be available at the canteen.\n\nFor more information, please contact the Sports Department.\n\nLet\'s make this Sports Day memorable!\n\nBest regards,\nCoach Robert Martinez\nSports Department\nAmalorpavam School',
    dateTime: 'March 12, 2024 at 10:15 AM',
    category: 'school-info',
  },
  '5': {
    id: '5',
    title: 'English Literature Essay',
    content: 'Write a 500-word essay on "The importance of reading". Due date: Monday.',
    type: 'voice',
    timestamp: '3 days ago',
    priority: 'medium',
    sender: 'English Teacher',
    fullContent: 'Dear Students,\n\nYour English Literature homework for this week:\n\nEssay Topic: "The Importance of Reading in Modern Life"\n\nRequirements:\n• Word count: 500-600 words\n• Include introduction, body, and conclusion\n• Use at least 3 examples from literature\n• Proper grammar and spelling\n• Handwritten in neat handwriting\n\nStructure Guidelines:\n1. Introduction: Hook and thesis statement\n2. Body Paragraph 1: Cognitive benefits\n3. Body Paragraph 2: Emotional and social benefits\n4. Body Paragraph 3: Academic and career advantages\n5. Conclusion: Summarize and call to action\n\nDue Date: Monday, March 18th\nSubmission: Beginning of first period\n\nThis essay will be graded on content, organization, and language use.\n\nHappy writing!\n\nMs. Emily Watson\nEnglish Literature Teacher\nAmalorpavam School',
    dateTime: 'March 11, 2024 at 3:45 PM',
    category: 'homework',
    voiceUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    voiceDuration: '3:15',
  },
  '6': {
    id: '6',
    title: 'Parent-Teacher Meeting',
    content: 'Join us for the monthly parent-teacher meeting to discuss your child\'s progress.',
    type: 'video',
    timestamp: '3 days ago',
    priority: 'medium',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    sender: 'Class Teacher',
    fullContent: 'Dear Parents,\n\nYou are cordially invited to attend the monthly Parent-Teacher meeting scheduled for March 20th, 2024.\n\nMeeting Details:\n• Date: March 20, 2024\n• Time: 10:00 AM - 12:00 PM\n• Venue: School Auditorium\n• Format: In-person with virtual option\n\nAgenda:\n1. Student Progress Review (10:00-10:30)\n2. Upcoming Academic Activities (10:30-11:00)\n3. Extracurricular Programs (11:00-11:30)\n4. Q&A Session (11:30-12:00)\n\nWe will also be sharing a video presentation about our new teaching methodologies and student achievements from this semester.\n\nTopics to be covered:\n• Academic performance analysis\n• Behavioral development\n• Upcoming examinations\n• Summer program opportunities\n• New technology integration\n\nYour presence is highly appreciated as we discuss your child\'s academic journey and future plans.\n\nPlease confirm your attendance by replying to this message or calling the school office.\n\nLooking forward to meeting you!\n\nBest regards,\nMrs. Jennifer Adams\nClass Teacher\nAmalorpavam School',
    dateTime: 'March 11, 2024 at 3:45 PM',
    category: 'school-info',
  },
  '7': {
    id: '7',
    title: 'History Research Project',
    content: 'Research and present on any historical figure from the 18th century. Presentation next week.',
    type: 'text',
    timestamp: '4 days ago',
    priority: 'high',
    sender: 'History Teacher',
    fullContent: 'Dear Students,\n\nYour History Research Project assignment:\n\nTopic: Historical Figures of the 18th Century\n\nProject Requirements:\n• Choose any significant historical figure from 1700-1800\n• Research their life, achievements, and impact\n• Create a 10-minute presentation\n• Include visual aids (posters, slides, or props)\n• Prepare to answer questions from classmates\n\nSuggested Figures:\n- George Washington\n- Napoleon Bonaparte\n- Benjamin Franklin\n- Marie Antoinette\n- Captain James Cook\n- Wolfgang Amadeus Mozart\n\nResearch Guidelines:\n• Use at least 5 reliable sources\n• Include primary sources if possible\n• Cite all sources properly\n• Focus on historical significance\n\nPresentation Schedule:\n• Week of March 18-22\n• 10 minutes per student\n• Q&A session after each presentation\n\nGrading Criteria:\n• Research quality (30%)\n• Presentation skills (25%)\n• Visual aids (20%)\n• Content accuracy (25%)\n\nThis project counts as your major assignment for this quarter.\n\nGood luck with your research!\n\nMr. David Thompson\nHistory Teacher\nAmalorpavam School',
    dateTime: 'March 10, 2024 at 1:20 PM',
    category: 'assignments',
  },
  '8': {
    id: '8',
    title: 'Emergency Contact Update',
    content: 'Please update your emergency contact information in the school portal immediately.',
    type: 'voice',
    timestamp: '5 days ago',
    priority: 'high',
    sender: 'Administration',
    fullContent: 'Dear Parents and Guardians,\n\nIMPORTANT: Emergency Contact Information Update Required\n\nWe are updating our emergency contact database to ensure we can reach you quickly in case of any urgent situations involving your child.\n\nAction Required:\n• Log into the school portal (www.amalorpavamschool.edu/portal)\n• Navigate to "Student Information" section\n• Update emergency contact details\n• Verify all phone numbers are current\n• Add alternate emergency contacts\n\nInformation Needed:\n1. Primary emergency contact (usually parent/guardian)\n2. Secondary emergency contact (relative/friend)\n3. Medical emergency contact (if different)\n4. Work phone numbers\n5. Mobile phone numbers\n6. Email addresses\n\nDeadline: March 20th, 2024\n\nWhy This Matters:\n• Quick communication during emergencies\n• School closure notifications\n• Medical emergency situations\n• Natural disaster protocols\n• Student safety incidents\n\nIf you need help accessing the portal, please contact our IT support at (555) 123-4567 or visit the school office.\n\nYour cooperation in keeping this information current is essential for your child\'s safety and our ability to communicate effectively.\n\nThank you for your prompt attention to this matter.\n\nBest regards,\nMrs. Patricia Williams\nSchool Administrator\nAmalorpavam School',
    dateTime: 'March 9, 2024 at 9:00 AM',
    category: 'emergency',
    voiceUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    voiceDuration: '4:20',
  },
};

const categoryConfig = {
  homework: { icon: BookOpen, color: '#3B82F6', name: 'Home Work' },
  assignments: { icon: ClipboardList, color: '#8B5CF6', name: 'Assignment' },
  'school-info': { icon: Info, color: '#10B981', name: 'School Info' },
  emergency: { icon: AlertTriangle, color: '#EF4444', name: 'Emergency' },
};

export default function MessageDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const message = mockMessageDetails[id!];
  const [playingVoice, setPlayingVoice] = useState<boolean>(false);

  if (!message) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Message Not Found</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Message not found</Text>
        </View>
      </View>
    );
  }

  const handleVideoLink = () => {
    if (message.videoUrl) {
      Linking.openURL(message.videoUrl);
    }
  };

  const handleVoicePlay = () => {
    setPlayingVoice(!playingVoice);
    // In a real app, you would integrate with expo-av or react-native-sound
    // For demo purposes, we'll just simulate playing
    if (!playingVoice) {
      setTimeout(() => {
        setPlayingVoice(false);
      }, 5000);
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

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon size={20} color="#10B981" />;
      case 'video':
        return <Video size={20} color="#F59E0B" />;
      case 'voice':
        return <Mic size={20} color="#8B5CF6" />;
      default:
        return null;
    }
  };

  const categoryInfo = categoryConfig[message.category];
  const CategoryIcon = categoryInfo.icon;

  const renderVoiceMessage = () => {
    return (
      <View style={styles.voiceSection}>
        <View style={styles.voiceContainer}>
          <TouchableOpacity 
            style={[styles.voicePlayButton, playingVoice && styles.voicePlayButtonActive]}
            onPress={handleVoicePlay}
          >
            {playingVoice ? (
              <Pause size={24} color="#FFFFFF" />
            ) : (
              <Play size={24} color="#FFFFFF" />
            )}
          </TouchableOpacity>
          <View style={styles.voiceInfo}>
            <Text style={styles.voiceTitle}>Voice Message</Text>
            <View style={styles.voiceWaveform}>
              {[...Array(20)].map((_, index) => (
                <View 
                  key={index}
                  style={[
                    styles.voiceWave,
                    { 
                      height: Math.random() * 30 + 15,
                      backgroundColor: playingVoice ? '#8B5CF6' : '#D1D5DB'
                    }
                  ]} 
                />
              ))}
            </View>
            <Text style={styles.voiceDuration}>{message.voiceDuration}</Text>
          </View>
        </View>
        <View style={styles.voiceTranscript}>
          <Text style={styles.transcriptLabel}>Voice Message Transcript:</Text>
          <Text style={styles.transcriptText}>
            "{message.content}"
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Message Details</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.messageHeader}>
          <View style={styles.titleSection}>
            <View style={styles.categoryBadge}>
              <CategoryIcon size={16} color={categoryInfo.color} />
              <Text style={[styles.categoryText, { color: categoryInfo.color }]}>
                {categoryInfo.name}
              </Text>
            </View>
            <Text style={styles.title}>{message.title}</Text>
            <View style={styles.messageInfo}>
              <View style={styles.senderInfo}>
                <User size={16} color="#6B7280" />
                <Text style={styles.sender}>{message.sender}</Text>
              </View>
              <View style={styles.dateInfo}>
                <Calendar size={16} color="#6B7280" />
                <Text style={styles.dateTime}>{message.dateTime}</Text>
              </View>
            </View>
          </View>
          <View style={styles.prioritySection}>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(message.priority) }]}>
              <Text style={styles.priorityText}>{message.priority.toUpperCase()}</Text>
            </View>
            {getMessageIcon(message.type)}
          </View>
        </View>

        {message.type === 'voice' && renderVoiceMessage()}

        {message.imageUrl && (
          <View style={styles.mediaSection}>
            <Image source={{ uri: message.imageUrl }} style={styles.messageImage} />
          </View>
        )}

        {message.videoUrl && (
          <TouchableOpacity style={styles.videoSection} onPress={handleVideoLink}>
            <View style={styles.videoThumbnail}>
              <Video size={40} color="#FFFFFF" />
              <Text style={styles.videoText}>Watch Video</Text>
            </View>
            <View style={styles.videoLink}>
              <ExternalLink size={16} color="#3B82F6" />
              <Text style={styles.videoLinkText}>Open in Browser</Text>
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.contentSection}>
          <Text style={styles.contentTitle}>Message Content</Text>
          <Text style={styles.fullContent}>{message.fullContent}</Text>
        </View>
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
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  content: {
    flex: 1,
  },
  messageHeader: {
    backgroundColor: '#FFFFFF',
    margin: 24,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  titleSection: {
    flex: 1,
    marginRight: 16,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
    gap: 6,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 12,
    lineHeight: 30,
  },
  messageInfo: {
    gap: 8,
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sender: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateTime: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  prioritySection: {
    alignItems: 'flex-end',
    gap: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  voiceSection: {
    marginHorizontal: 24,
    marginBottom: 16,
  },
  voiceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  voicePlayButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  voicePlayButtonActive: {
    backgroundColor: '#7C3AED',
  },
  voiceInfo: {
    flex: 1,
  },
  voiceTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 8,
  },
  voiceWaveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: 8,
  },
  voiceWave: {
    width: 3,
    backgroundColor: '#D1D5DB',
    borderRadius: 1.5,
  },
  voiceDuration: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  voiceTranscript: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  transcriptLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  transcriptText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  mediaSection: {
    marginHorizontal: 24,
    marginBottom: 16,
  },
  messageImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  videoSection: {
    marginHorizontal: 24,
    marginBottom: 16,
  },
  videoThumbnail: {
    backgroundColor: '#1F2937',
    height: 200,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  videoText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginTop: 8,
  },
  videoLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  videoLinkText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#3B82F6',
  },
  contentSection: {
    backgroundColor: '#FFFFFF',
    margin: 24,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  contentTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 12,
  },
  fullContent: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 24,
  },
});