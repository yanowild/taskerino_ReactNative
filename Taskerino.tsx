import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Modal,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path, Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRevenueCat } from './src/hooks/useRevenueCat';
import PaywallModal from './src/components/PaywallModal';
import CustomPaywall from './src/components/CustomPaywall';
import CustomerCenterModal from './src/components/CustomerCenterModal';

const greetings = {
  morning: ["Good morning, superstar! ☀️", "Rise and shine! Ready to conquer?", "A fresh day, a fresh start!"],
  afternoon: ["Hey there, go-getter!", "Afternoon vibes! Let's do this!", "You're doing great today!"],
  evening: ["Evening champion! 🌙", "Winding down? I'm here for you!", "Let's wrap up strong!"]
};

const celebrations = [
  { emoji: "🎉", text: "Woohoo!" }, { emoji: "⭐", text: "Superstar!" }, { emoji: "🚀", text: "Crushing it!" },
  { emoji: "💪", text: "So strong!" }, { emoji: "🌟", text: "Brilliant!" }, { emoji: "🎊", text: "Amazing!" },
  { emoji: "✨", text: "Fantastic!" }, { emoji: "🏆", text: "Champion!" }, { emoji: "💫", text: "Incredible!" }, { emoji: "🥳", text: "Party time!" }
];

const confettiColors = ['#8FB996', '#A8D5BA', '#C4B7D6', '#9DC4D8', '#E8D5A3', '#B5D4C8'];

const tips = [
  {
    id: 1,
    emoji: "🌱",
    title: "Start Small",
    description: "It's totally okay to add just one task at a time. Small steps lead to big wins! You don't need to plan your entire life today."
  },
  {
    id: 2,
    emoji: "🎯",
    title: "Pick Your Top 3",
    description: "Feeling overwhelmed? Choose just 3 tasks that matter most today. Everything else can wait, and that's perfectly fine."
  },
  {
    id: 3,
    emoji: "🧘",
    title: "It's Okay to Rest",
    description: "Some days are for crushing goals, some are for recharging. Both are important. Be kind to yourself."
  },
  {
    id: 4,
    emoji: "📅",
    title: "Tomorrow Exists",
    description: "Didn't finish today? No worries! Tasks can move to tomorrow. Progress isn't linear, and that's normal."
  },
  {
    id: 5,
    emoji: "🎉",
    title: "Celebrate Small Wins",
    description: "Made your bed? That counts! Sent one email? Amazing! Every completed task is worth celebrating, no matter how small."
  },
  {
    id: 6,
    emoji: "🌙",
    title: "Evening Brain Dump",
    description: "Before bed, jot down tomorrow's thoughts. It helps clear your mind and you'll wake up with a gentle plan ready."
  },
  {
    id: 7,
    emoji: "⏰",
    title: "Time Estimates Are Tricky",
    description: "Tasks often take longer than expected, and that's okay! Be flexible with yourself and adjust as you go."
  },
  {
    id: 8,
    emoji: "🔄",
    title: "Weekly Reset",
    description: "Once a week, review and declutter your tasks. It's a fresh start, not a judgment of what you didn't do."
  },
  {
    id: 9,
    emoji: "💚",
    title: "You're Doing Great",
    description: "The fact that you're here, trying to organize your life? That's already an accomplishment. Be proud of yourself!"
  },
  {
    id: 10,
    emoji: "🌈",
    title: "Perfect Doesn't Exist",
    description: "Your task list doesn't need to be perfect. Done is better than perfect. Progress over perfection, always."
  },
  {
    id: 11,
    emoji: "🎈",
    title: "Break It Down",
    description: "Big task feeling scary? Break it into tiny pieces. Instead of 'Clean house', try 'Pick up 5 things' first."
  },
  {
    id: 12,
    emoji: "☕",
    title: "Energy Over Time",
    description: "Do important tasks when you have the most energy. Low energy? That's the time for easy, mindless tasks."
  }
];

const badges = [
  { id: 1, emoji: "🌱", title: "Seedling", description: "Created your first task", detailedDescription: "Welcome to Taskerino! This badge celebrates your very first task. Every journey starts with a single step!", requirement: 1, type: "tasks" },
  { id: 2, emoji: "🌿", title: "Growing", description: "Created 10 tasks", detailedDescription: "You're building momentum! 10 tasks created shows you're taking action and organizing your life.", requirement: 10, type: "tasks" },
  { id: 3, emoji: "🌳", title: "Flourishing", description: "Created 50 tasks", detailedDescription: "Amazing progress! 50 tasks means you're fully embracing task management. Keep flourishing!", requirement: 50, type: "tasks" },
  { id: 4, emoji: "🔥", title: "On Fire", description: "Used the app 3 days in a row", detailedDescription: "Consistency is key! You've used Taskerino for 3 consecutive days. That's how habits are built!", requirement: 3, type: "streak" },
  { id: 5, emoji: "⚡", title: "Lightning", description: "Used the app 7 days in a row", detailedDescription: "One full week of dedication! You're making this a real habit. Your streak is electrifying!", requirement: 7, type: "streak" },
  { id: 6, emoji: "💫", title: "Cosmic", description: "Used the app 30 days in a row", detailedDescription: "Out of this world! A full month of daily use. You've reached cosmic levels of commitment!", requirement: 30, type: "streak" },
  { id: 7, emoji: "✨", title: "First Win", description: "Completed your first task", detailedDescription: "You did it! Completing your first task is a special moment. Here's to many more victories!", requirement: 1, type: "completed" },
  { id: 8, emoji: "⭐", title: "Star Player", description: "Completed 25 tasks", detailedDescription: "Look at you go! 25 completed tasks proves you're not just creating tasks, you're crushing them!", requirement: 25, type: "completed" },
  { id: 9, emoji: "🏆", title: "Champion", description: "Completed 100 tasks", detailedDescription: "Legendary status achieved! 100 completed tasks makes you a true productivity champion!", requirement: 100, type: "completed" },
];

const themeColors = {
  sage: { primary: '#8FB996', secondary: '#6A9B72', accent: '#A8D5BA' },
  ocean: { primary: '#6B9DC4', secondary: '#4A7BA7', accent: '#8DB4D8' },
  lavender: { primary: '#B89FD9', secondary: '#9378BA', accent: '#C4B7D6' },
  coral: { primary: '#E8967D', secondary: '#D17159', accent: '#F0B39E' },
  rose: { primary: '#E89FB5', secondary: '#D17A95', accent: '#F0BAC8' },
  midnight: { primary: '#6B7B9D', secondary: '#4A5A7A', accent: '#8A9AB8' },
};

const colors = {
  bgCream: '#F7F6F3',
  bgPeach: '#E8E4DD',
  bgDark: '#1A1A1A',
  bgDarkCard: '#2A2A2A',
  sage: '#8FB996',
  sageDark: '#6A9B72',
  mint: '#A8D5BA',
  mintDark: '#7EC492',
  lavender: '#C4B7D6',
  textDark: '#4A4F4B',
  textMuted: '#8A8F8B',
  textLight: '#E8E8E8',
  textLightMuted: '#A8A8A8',
  white: '#FFFFFF',
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32'
};

type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';

interface Task {
  id: number;
  text: string;
  completed: boolean; // For backwards compatibility (completion on original date)
  date: string; // YYYY-MM-DD format
  repeat?: RepeatType;
  customDays?: number[]; // 0-6 (Sunday-Saturday) for custom repeat
  completedDates?: string[]; // Array of dates where this task was completed (YYYY-MM-DD)
}

interface Goal {
  id: number;
  text: string;
  completed: boolean;
}

function Mascot({ size = 90 }: { size?: number }) {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -8, duration: 1500, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, [bounceAnim]);

  const s = size / 90;

  return (
    <Animated.View style={[{ width: size, height: size }, { transform: [{ translateY: bounceAnim }] }]}>
        {/* eslint-disable-next-line react-native/no-inline-styles */}
      <View style={{
        width: '100%', height: '100%', borderRadius: size / 2, backgroundColor: colors.sage
      }}>
        {/* Left eye white */}
          {/* eslint-disable-next-line react-native/no-inline-styles */}
        <View style={{ position: 'absolute', width: 20 * s, height: 24 * s, backgroundColor: '#fff', borderRadius: (20 * s) / 2, top: 28 * s, left: 22 * s }} />
        {/* Right eye white */}
          {/* eslint-disable-next-line react-native/no-inline-styles */}
        <View style={{ position: 'absolute', width: 20 * s, height: 24 * s, backgroundColor: '#fff', borderRadius: (20 * s) / 2, top: 28 * s, right: 22 * s }} />
        {/* Left pupil */}
          {/* eslint-disable-next-line react-native/no-inline-styles */}
        <View style={{ position: 'absolute', width: 8 * s, height: 10 * s, backgroundColor: '#4A4F4B', borderRadius: (8 * s) / 2, top: 34 * s, left: 28 * s }} />
        {/* Right pupil */}
          {/* eslint-disable-next-line react-native/no-inline-styles */}
        <View style={{ position: 'absolute', width: 8 * s, height: 10 * s, backgroundColor: '#4A4F4B', borderRadius: (8 * s) / 2, top: 34 * s, right: 28 * s }} />
        {/* Left cheek */}
          {/* eslint-disable-next-line react-native/no-inline-styles */}
        <View style={{ position: 'absolute', width: 14 * s, height: 8 * s, backgroundColor: 'rgba(200,220,200,0.5)', borderRadius: (14 * s) / 2, top: 52 * s, left: 10 * s }} />
        {/* Right cheek */}
          {/* eslint-disable-next-line react-native/no-inline-styles */}
        <View style={{ position: 'absolute', width: 14 * s, height: 8 * s, backgroundColor: 'rgba(200,220,200,0.5)', borderRadius: (14 * s) / 2, top: 52 * s, right: 10 * s }} />
        {/* Smile */}
          {/* eslint-disable-next-line react-native/no-inline-styles */}
        <View style={{
          position: 'absolute', width: 24 * s, height: 12 * s, borderColor: '#4A4F4B', borderWidth: 3 * s,
          borderTopWidth: 0, borderBottomLeftRadius: 24 * s, borderBottomRightRadius: 24 * s, bottom: 20 * s, left: '50%', marginLeft: -12 * s
        }} />
      </View>
    </Animated.View>
  );
}

function CheckIcon() {
  return (
    <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M5 13l4 4L19 7" />
    </Svg>
  );
}

function CloseIcon() {
  return (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2.5" strokeLinecap="round">
      <Path d="M18 6L6 18M6 6l12 12" />
    </Svg>
  );
}

function PlusIcon() {
  return (
    <Svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round">
      <Path d="M12 5v14M5 12h14" />
    </Svg>
  );
}

function CalendarIcon({ color = colors.textMuted }: { color?: string }) {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
    </Svg>
  );
}

function ProfileIcon({ color = colors.textMuted }: { color?: string }) {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" fill="none" />
    </Svg>
  );
}

function SettingsIcon({ color = colors.textMuted }: { color?: string }) {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" fill="none" />
      <Path d="M12 1v6m0 6v6M1 12h6m6 0h6M4.2 4.2l4.2 4.2m5.6 5.6l4.2 4.2M4.2 19.8l4.2-4.2m5.6-5.6l4.2-4.2" />
    </Svg>
  );
}

function LightbulbIcon({ color = colors.textMuted }: { color?: string }) {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M9 21h6M12 3a6 6 0 0 0-6 6c0 3.5 2 5 3 7h6c1-2 3-3.5 3-7a6 6 0 0 0-6-6z" />
    </Svg>
  );
}

function GoalsIcon({ color = colors.textMuted }: { color?: string }) {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="12" cy="12" r="10" />
      <Circle cx="12" cy="12" r="6" />
      <Circle cx="12" cy="12" r="2" />
    </Svg>
  );
}

function RepeatIcon({ color = colors.textMuted, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M17 1l4 4-4 4" />
      <Path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <Path d="M7 23l-4-4 4-4" />
      <Path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </Svg>
  );
}
/* eslint-disable react-native/no-inline-styles */
function TaskItem({ task, onToggle, onDelete, onEditRepeat, cardBg, text, textMuted, theme }: { task: Task; onToggle: (id: number) => void; onDelete: (id: number) => void; onEditRepeat: (task: Task) => void; cardBg: string; text: string; textMuted: string; theme: { primary: string; secondary: string; accent: string } }) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [opacityAnim, slideAnim]);

  return (
    <Animated.View style={[
      styles.taskItem,
      { backgroundColor: cardBg, opacity: task.completed ? 0.8 : opacityAnim, transform: [{ translateY: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }
    ]}>
      <TouchableOpacity onPress={() => onToggle(task.id)} style={[
        styles.checkbox,
        { borderColor: task.completed ? colors.mint : colors.bgPeach, backgroundColor: task.completed ? colors.mint : 'transparent' }
      ]}>
        {task.completed && <CheckIcon />}
      </TouchableOpacity>
      <View style={styles.taskTextContainer}>
        <Text style={[
          styles.taskText,
          { color: task.completed ? textMuted : text, textDecorationLine: task.completed ? 'line-through' : 'none' }
        ]} numberOfLines={3}>
          {task.text}
        </Text>
        {task.repeat && task.repeat !== 'none' && (
          <TouchableOpacity
            style={[styles.repeatIndicator, { backgroundColor: theme.primary + '20' }]}
            onPress={() => onEditRepeat(task)}
            activeOpacity={0.7}
          >
            <RepeatIcon color={theme.primary} size={14} />
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity onPress={() => onDelete(task.id)} style={styles.deleteButton}>
        <CloseIcon />
      </TouchableOpacity>
    </Animated.View>
  );
}

function ConfettiPiece({ delay, x, color }: { delay: number; x: number; color: string }) {
  const fallAnim = useRef(new Animated.Value(-20)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fallAnim, { toValue: 800, duration: 1500, useNativeDriver: true }),
        Animated.timing(rotateAnim, { toValue: 720, duration: 1500, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ]).start();
    }, delay);
  }, [delay, fallAnim, opacityAnim, rotateAnim]);

  return (
    <Animated.View style={{
      position: 'absolute',
      left: `${x}%`,
      width: 12,
      height: 12,
      backgroundColor: color,
      borderRadius: 2,
      transform: [
        { translateY: fallAnim },
        { rotate: rotateAnim.interpolate({ inputRange: [0, 720], outputRange: ['0deg', '720deg'] }) }
      ],
      opacity: opacityAnim
    }} />
  );
}

// Helper to get date string in YYYY-MM-DD format (local timezone)
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatLongDate = (dateStr: string): string => {
  if (!dateStr) return 'Select a date';
  const date = new Date(dateStr + 'T00:00:00');
  if (isNaN(date.getTime())) return 'Invalid date';
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  };
  return date.toLocaleDateString('en-US', options);
};

export default function Taskerino() {
  const insets = useSafeAreaInsets();

  // RevenueCat subscription hook
  const { isPro, subscriptionStatus } = useRevenueCat();

  // Theme state
  const [darkMode, setDarkMode] = useState(false);
  const [themeColor, setThemeColor] = useState<'sage' | 'ocean' | 'lavender' | 'coral' | 'rose' | 'midnight'>('sage');

  // Get current theme colors
  const theme = themeColors[themeColor];
  const bg = darkMode ? colors.bgDark : colors.bgCream;
  const cardBg = darkMode ? colors.bgDarkCard : colors.white;
  const text = darkMode ? colors.textLight : colors.textDark;
  const textMuted = darkMode ? colors.textLightMuted : colors.textMuted;

  // Other state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState('');
  const [greeting, setGreeting] = useState('');
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; color: string; delay: number }>>([]);
  const [celebration, setCelebration] = useState<{ emoji: string; text: string } | null>(null);
  const [currentTab, setCurrentTab] = useState<'tasks' | 'goals' | 'calendar' | 'profile' | 'tips' | 'settings'>('tasks');
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()));
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [_lastLoginDate, setLastLoginDate] = useState<string>('');
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [selectedBadge, setSelectedBadge] = useState<(typeof badges[0] & { unlocked: boolean; progress: number }) | null>(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [calendarViewMode, setCalendarViewMode] = useState<'month' | 'year'>('month');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalInput, setGoalInput] = useState('');
  const [showAchievements, setShowAchievements] = useState(true);
  const [language, setLanguage] = useState<'en' | 'fr' | 'es'>('en');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const [tipsEnabled, setTipsEnabled] = useState(true);
  const [goalsEnabled, setGoalsEnabled] = useState(false);
  const [profileEnabled, setProfileEnabled] = useState(true);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showRepeatModal, setShowRepeatModal] = useState(false);
  const [repeatType, setRepeatType] = useState<RepeatType>('none');
  const [showPaywall, setShowPaywall] = useState(false);
  const [showCustomPaywall, setShowCustomPaywall] = useState(false);
  const [showCustomerCenter, setShowCustomerCenter] = useState(false);
  const [customDays, setCustomDays] = useState<number[]>([]);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [totalCompletedCount, setTotalCompletedCount] = useState<number>(0);
  const celebrationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadTasks();
    loadStreakData();
    loadGoals();
    loadSettings();
    loadTotalCompletedCount();
    const hour = new Date().getHours();
    const time = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    setGreeting(greetings[time][Math.floor(Math.random() * greetings[time].length)]);
  }, []);

  const loadStreakData = async () => {
    try {
      const lastLogin = await AsyncStorage.getItem('taskerino-last-login');
      const streak = await AsyncStorage.getItem('taskerino-streak');
      const today = formatDate(new Date());

      if (lastLogin) {
        const lastDate = new Date(lastLogin + 'T00:00:00');
        const todayDate = new Date(today + 'T00:00:00');
        const diffTime = todayDate.getTime() - lastDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
          // Same day, keep streak
          setCurrentStreak(parseInt(streak || '0', 10));
        } else if (diffDays === 1) {
          // Next day, increment streak
          const newStreak = parseInt(streak || '0', 10) + 1;
          setCurrentStreak(newStreak);
          await AsyncStorage.setItem('taskerino-streak', newStreak.toString());
        } else {
          // Streak broken, reset
          setCurrentStreak(1);
          await AsyncStorage.setItem('taskerino-streak', '1');
        }
      } else {
        // First time
        setCurrentStreak(1);
        await AsyncStorage.setItem('taskerino-streak', '1');
      }

      setLastLoginDate(today);
      await AsyncStorage.setItem('taskerino-last-login', today);
    } catch (error) {
      console.error('Failed to load streak data:', error);
    }
  };

  const loadTasks = async () => {
    try {
      const saved = await AsyncStorage.getItem('taskerino-tasks');
      if (saved) setTasks(JSON.parse(saved));
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  const saveTasks = useCallback(async () => {
    try {
      await AsyncStorage.setItem('taskerino-tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error('Failed to save tasks:', error);
    }
  }, [tasks]);

  useEffect(() => {
    saveTasks();
  }, [saveTasks, tasks]);

  const loadGoals = async () => {
    try {
      const saved = await AsyncStorage.getItem('taskerino-goals');
      if (saved) setGoals(JSON.parse(saved));
    } catch (error) {
      console.error('Failed to load goals:', error);
    }
  };

  const saveGoals = useCallback(async () => {
    try {
      await AsyncStorage.setItem('taskerino-goals', JSON.stringify(goals));
    } catch (error) {
      console.error('Failed to save goals:', error);
    }
  }, [goals]);

  useEffect(() => {
    saveGoals();
  }, [goals, saveGoals]);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem('taskerino-settings');
      if (saved) {
        const settings = JSON.parse(saved);
        setDarkMode(settings.darkMode ?? false);
        setThemeColor(settings.themeColor ?? 'sage');
        setLanguage(settings.language ?? 'en');
        setNotificationsEnabled(settings.notificationsEnabled ?? false);
        setTipsEnabled(settings.tipsEnabled ?? true);
        setGoalsEnabled(settings.goalsEnabled ?? false);
        setProfileEnabled(settings.profileEnabled ?? true);
        setSoundsEnabled(settings.soundsEnabled ?? true);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async (newSettings: { darkMode?: boolean; themeColor?: string; language?: string; notificationsEnabled?: boolean; tipsEnabled?: boolean; goalsEnabled?: boolean; profileEnabled?: boolean; soundsEnabled?: boolean }) => {
    try {
      const saved = await AsyncStorage.getItem('taskerino-settings');
      const current = saved ? JSON.parse(saved) : {};
      const updated = { ...current, ...newSettings };
      await AsyncStorage.setItem('taskerino-settings', JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const loadTotalCompletedCount = async () => {
    try {
      const saved = await AsyncStorage.getItem('taskerino-total-completed');
      if (saved) {
        setTotalCompletedCount(parseInt(saved, 10));
      }
    } catch (error) {
      console.error('Failed to load total completed count:', error);
    }
  };

  const incrementTotalCompletedCount = async () => {
    try {
      const newCount = totalCompletedCount + 1;
      setTotalCompletedCount(newCount);
      await AsyncStorage.setItem('taskerino-total-completed', newCount.toString());
    } catch (error) {
      console.error('Failed to save total completed count:', error);
    }
  };

  const addGoal = () => {
    if (!goalInput.trim()) {
      Alert.alert('Oops!', 'Please enter a goal first 😊');
      return;
    }
    setGoals([{ id: Date.now(), text: goalInput.trim(), completed: false }, ...goals]);
    setGoalInput('');
  };

  const toggleGoal = (id: number) => {
    setGoals(goals.map(g => {
      if (g.id === id) {
        if (!g.completed) {
          // Clear any existing celebration timeout
          if (celebrationTimeoutRef.current) {
            clearTimeout(celebrationTimeoutRef.current);
          }

          // Clear previous confetti and celebration immediately
          setConfetti([]);
          setCelebration(null);

          // Small delay to ensure state is cleared before showing new celebration
          setTimeout(() => {
            setConfetti(Array.from({ length: 30 }, (_, i) => ({
              id: i,
              x: Math.random() * 100,
              color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
              delay: i * 30
            })));
            setCelebration(celebrations[Math.floor(Math.random() * celebrations.length)]);
          }, 10);

          // Store the new timeout reference
          celebrationTimeoutRef.current = setTimeout(() => {
            setConfetti([]);
            setCelebration(null);
            celebrationTimeoutRef.current = null;
          }, 2000);
        }
        return { ...g, completed: !g.completed };
      }
      return g;
    }));
  };

  const deleteGoal = (id: number) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const addTask = () => {
    if (!input.trim()) {
      Alert.alert('Oops!', 'Please enter a task first 😊');
      return;
    }
    const newTask: Task = {
      id: Date.now(),
      text: input.trim(),
      completed: false,
      date: selectedDate,
      repeat: repeatType,
      customDays: repeatType === 'custom' ? customDays : undefined
    };
    setTasks([newTask, ...tasks]);
    setInput('');
    setRepeatType('none');
    setCustomDays([]);
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const isCurrentlyCompleted = isTaskCompletedOnDate(t, selectedDate);

        // Show confetti if marking as complete
        if (!isCurrentlyCompleted) {
          // Increment total completed count
          incrementTotalCompletedCount();

          // Clear any existing celebration timeout
          if (celebrationTimeoutRef.current) {
            clearTimeout(celebrationTimeoutRef.current);
          }

          // Clear previous confetti and celebration immediately
          setConfetti([]);
          setCelebration(null);

          // Small delay to ensure state is cleared before showing new celebration
          setTimeout(() => {
            setConfetti(Array.from({ length: 30 }, (_, i) => ({
              id: i,
              x: Math.random() * 100,
              color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
              delay: i * 30
            })));
            setCelebration(celebrations[Math.floor(Math.random() * celebrations.length)]);
          }, 10);

          // Store the new timeout reference
          celebrationTimeoutRef.current = setTimeout(() => {
            setConfetti([]);
            setCelebration(null);
            celebrationTimeoutRef.current = null;
          }, 2000);
        }

        // If toggling on the original date
        if (t.date === selectedDate) {
          return { ...t, completed: !t.completed };
        }

        // If toggling on a repeated date
        const completedDates = t.completedDates || [];
        if (isCurrentlyCompleted) {
          // Remove this date from completed dates
          return { ...t, completedDates: completedDates.filter(d => d !== selectedDate) };
        } else {
          // Add this date to completed dates
          return { ...t, completedDates: [...completedDates, selectedDate] };
        }
      }
      return t;
    }));
  };

  const deleteTask = (id: number) => setTasks(tasks.filter(t => t.id !== id));

  const handleEditRepeat = (task: Task) => {
    setEditingTaskId(task.id);
    const currentRepeat = task.repeat || 'none';
    setRepeatType(currentRepeat);

    // If no custom days set and we're starting fresh, auto-select current day
    if (currentRepeat === 'none' || !task.customDays || task.customDays.length === 0) {
      const currentDay = new Date(selectedDate + 'T00:00:00').getDay();
      setCustomDays([currentDay]);
    } else {
      setCustomDays(task.customDays);
    }
    setShowRepeatModal(true);
  };

  // Check if a task should appear on a given date based on repeat settings
  const shouldShowTaskOnDate = (task: Task, date: string): boolean => {
    // Always show on the original date
    if (task.date === date) return true;

    // Don't show if no repeat or repeat is 'none'
    if (!task.repeat || task.repeat === 'none') return false;

    const taskDate = new Date(task.date + 'T00:00:00');
    const checkDate = new Date(date + 'T00:00:00');

    // Don't show tasks before their creation date
    if (checkDate < taskDate) return false;

    switch (task.repeat) {
      case 'daily':
        return true;

      case 'weekly': {
        // Same day of week
        return taskDate.getDay() === checkDate.getDay();
      }

      case 'monthly': {
        // Same day of month
        return taskDate.getDate() === checkDate.getDate();
      }

      case 'custom': {
        // Check if current day is in the custom days list
        if (!task.customDays || task.customDays.length === 0) return false;
        return task.customDays.includes(checkDate.getDay());
      }

      default:
        return false;
    }
  };

  // Check if a task is completed on a specific date
  const isTaskCompletedOnDate = (task: Task, date: string): boolean => {
    // Check if completed on original date
    if (task.date === date && task.completed) return true;

    // Check if completed on this specific repeated date
    if (task.completedDates && task.completedDates.includes(date)) return true;

    return false;
  };

  // Filter tasks by selected date and add the completion state for this specific date
  const tasksForDate = tasks
    .filter(t => shouldShowTaskOnDate(t, selectedDate))
    .map(t => ({
      ...t,
      completed: isTaskCompletedOnDate(t, selectedDate) // Override completed with date-specific state
    }));
  const todo = tasksForDate.filter(t => !t.completed);
  const done = tasksForDate.filter(t => t.completed);

  // Generate calendar dates based on view mode
  const generateCalendarDates = () => {
    if (calendarViewMode === 'year') {
      // Year view: Show all 12 months of the selected year in a grid
      const months: Array<{ month: number; label: string; taskCount: number; hasUnfinished: boolean }> = [];

      for (let month = 0; month < 12; month++) {
        let monthTaskCount = 0;
        let monthHasUnfinished = false;

        const daysInMonth = new Date(selectedYear, month + 1, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
          const dayDate = new Date(selectedYear, month, day);
          const dayStr = formatDate(dayDate);
          const dayTasks = tasks.filter(t => shouldShowTaskOnDate(t, dayStr));
          monthTaskCount += dayTasks.length;
          if (dayTasks.some(t => !isTaskCompletedOnDate(t, dayStr))) monthHasUnfinished = true;
        }

        const monthName = new Date(selectedYear, month, 1).toLocaleDateString('en-US', { month: 'long' });
        months.push({ month, label: monthName, taskCount: monthTaskCount, hasUnfinished: monthHasUnfinished });
      }

      return months;
    } else if (calendarViewMode === 'month') {
      // Month view: Show calendar grid for the selected month (Monday-Sunday)
      const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
      const firstDay = new Date(selectedYear, selectedMonth, 1).getDay(); // 0 = Sunday
      const firstDayMonday = firstDay === 0 ? 6 : firstDay - 1; // Convert to Monday = 0
      const days: Array<{ date: string; day: number; label: string; taskCount: number; hasUnfinished: boolean; isCurrentMonth: boolean }> = [];

      // Add padding days from previous month
      const prevMonthDays = new Date(selectedYear, selectedMonth, 0).getDate();
      for (let i = firstDayMonday - 1; i >= 0; i--) {
        const day = prevMonthDays - i;
        const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
        const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
        const dayDate = new Date(prevYear, prevMonth, day);
        const dayStr = formatDate(dayDate);
        const dayTasks = tasks.filter(t => shouldShowTaskOnDate(t, dayStr));
        days.push({
          date: dayStr,
          day,
          label: day.toString(),
          taskCount: dayTasks.length,
          hasUnfinished: dayTasks.some(t => !isTaskCompletedOnDate(t, dayStr)),
          isCurrentMonth: false
        });
      }

      // Add current month days
      for (let day = 1; day <= daysInMonth; day++) {
        const dayDate = new Date(selectedYear, selectedMonth, day);
        const dayStr = formatDate(dayDate);
        const dayTasks = tasks.filter(t => shouldShowTaskOnDate(t, dayStr));
        days.push({
          date: dayStr,
          day,
          label: day.toString(),
          taskCount: dayTasks.length,
          hasUnfinished: dayTasks.some(t => !isTaskCompletedOnDate(t, dayStr)),
          isCurrentMonth: true
        });
      }

      // Add padding days from next month
      const remainingDays = 42 - days.length; // 6 rows x 7 days
      for (let day = 1; day <= remainingDays; day++) {
        const nextMonth = selectedMonth === 11 ? 0 : selectedMonth + 1;
        const nextYear = selectedMonth === 11 ? selectedYear + 1 : selectedYear;
        const dayDate = new Date(nextYear, nextMonth, day);
        const dayStr = formatDate(dayDate);
        const dayTasks = tasks.filter(t => shouldShowTaskOnDate(t, dayStr));
        days.push({
          date: dayStr,
          day,
          label: day.toString(),
          taskCount: dayTasks.length,
          hasUnfinished: dayTasks.some(t => !isTaskCompletedOnDate(t, dayStr)),
          isCurrentMonth: false
        });
      }

      return days;
    }
  };

  const celebScaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (celebration) {
      celebScaleAnim.setValue(0);
      Animated.spring(celebScaleAnim, { toValue: 1, friction: 8, useNativeDriver: true }).start();
    }
  }, [celebScaleAnim, celebration]);

  // Calculate badge progress
  const getUnlockedBadges = () => {
    const tasksCreated = tasks.length;

    return badges.map(badge => {
      let unlocked = false;
      let progress = 0;

      switch (badge.type) {
        case 'tasks':
          progress = tasksCreated;
          unlocked = tasksCreated >= badge.requirement;
          break;
        case 'completed':
          // Use persistent total completed count instead of current completed tasks
          progress = totalCompletedCount;
          unlocked = totalCompletedCount >= badge.requirement;
          break;
        case 'streak':
          progress = currentStreak;
          unlocked = currentStreak >= badge.requirement;
          break;
      }

      return { ...badge, unlocked, progress };
    });
  };

  const renderContent = () => {
    if (currentTab === 'profile') {
      const unlockedBadges = getUnlockedBadges();
      const earnedCount = unlockedBadges.filter(b => b.unlocked).length;

      return (
        <>
          <View style={[styles.header, { paddingTop: insets.top }]}>
            <View style={styles.mascotContainer}>
              <Mascot size={90} />
            </View>
            <Text style={[styles.title, { color: text }]}>Profile</Text>
            <Text style={[styles.greeting, { color: textMuted }]}>Hey There!</Text>
          </View>

          <View style={styles.profileStats}>
            <View style={[styles.profileStatItem, { backgroundColor: cardBg }]}>
              <Text style={[styles.profileStatNumber, { color: theme.primary }]}>{tasks.length}</Text>
              <Text style={[styles.profileStatLabel, { color: textMuted }]}>Tasks Created</Text>
            </View>
            <View style={[styles.profileStatItem, { backgroundColor: cardBg }]}>
              <Text style={[styles.profileStatNumber, { color: theme.primary }]}>🔥 {currentStreak}</Text>
              <Text style={[styles.profileStatLabel, { color: textMuted }]}>Day Streak</Text>
            </View>
            <View style={[styles.profileStatItem, { backgroundColor: cardBg }]}>
              <Text style={[styles.profileStatNumber, { color: theme.primary }]}>{earnedCount}</Text>
              <Text style={[styles.profileStatLabel, { color: textMuted }]}>Badges Earned</Text>
            </View>
          </View>

          <ScrollView style={styles.badgesList} contentContainerStyle={{ paddingBottom: 20 }}>
            {/* Achievements Section with Toggle */}
            <TouchableOpacity
              onPress={() => setShowAchievements(!showAchievements)}
              style={styles.achievementsToggle}
            >
              <Text style={[styles.badgesSectionTitle, { color: text }]}>🏆 Achievements</Text>
              <Text style={[styles.achievementsToggleIcon, { color: textMuted }]}>{showAchievements ? '−' : '+'}</Text>
            </TouchableOpacity>

            {showAchievements && (
              <>
            {/* Tasks Category */}
            <Text style={[styles.badgeCategoryTitle, { color: textMuted }]}>🌱 Creation Journey</Text>
            <View style={styles.badgesRow}>
              {unlockedBadges.filter(b => b.type === 'tasks').map((badge) => (
                <TouchableOpacity
                  key={badge.id}
                  style={[styles.badgeMini, { backgroundColor: cardBg }, !badge.unlocked && styles.badgeMiniLocked]}
                  onPress={() => {
                    setSelectedBadge(badge);
                    setShowBadgeModal(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.badgeMiniEmoji, !badge.unlocked && styles.badgeLocked]}>{badge.emoji}</Text>
                  <Text style={[styles.badgeMiniTitle, { color: text }]}>{badge.title}</Text>
                  {!badge.unlocked && (
                    <Text style={[styles.badgeMiniProgress, { color: textMuted }]}>{badge.progress}/{badge.requirement}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Streak Category */}
            <Text style={[styles.badgeCategoryTitle, { color: textMuted }]}>🔥 Streak Power</Text>
            <View style={styles.badgesRow}>
              {unlockedBadges.filter(b => b.type === 'streak').map((badge) => (
                <TouchableOpacity
                  key={badge.id}
                  style={[styles.badgeMini, { backgroundColor: cardBg }, !badge.unlocked && styles.badgeMiniLocked]}
                  onPress={() => {
                    setSelectedBadge(badge);
                    setShowBadgeModal(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.badgeMiniEmoji, !badge.unlocked && styles.badgeLocked]}>{badge.emoji}</Text>
                  <Text style={[styles.badgeMiniTitle, { color: text }]}>{badge.title}</Text>
                  {!badge.unlocked && (
                    <Text style={[styles.badgeMiniProgress, { color: textMuted }]}>{badge.progress}/{badge.requirement}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Completion Category */}
            <Text style={[styles.badgeCategoryTitle, { color: textMuted }]}>✨ Completion Master</Text>
            <View style={styles.badgesRow}>
              {unlockedBadges.filter(b => b.type === 'completed').map((badge) => (
                <TouchableOpacity
                  key={badge.id}
                  style={[styles.badgeMini, { backgroundColor: cardBg }, !badge.unlocked && styles.badgeMiniLocked]}
                  onPress={() => {
                    setSelectedBadge(badge);
                    setShowBadgeModal(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.badgeMiniEmoji, !badge.unlocked && styles.badgeLocked]}>{badge.emoji}</Text>
                  <Text style={[styles.badgeMiniTitle, { color: text }]}>{badge.title}</Text>
                  {!badge.unlocked && (
                    <Text style={[styles.badgeMiniProgress, { color: textMuted }]}>{badge.progress}/{badge.requirement}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            </>
          )}
          </ScrollView>
        </>
      );
    }

    if (currentTab === 'goals') {
      const todoGoals = goals.filter(g => !g.completed);
      const doneGoals = goals.filter(g => g.completed);

      return (
        <>
          {/* Header */}
          <View style={[styles.header, { paddingTop: insets.top }]}>
            <View style={styles.mascotContainer}>
              <Mascot size={90} />
            </View>
            <Text style={[styles.title, { color: text }]}>Goals</Text>
            <Text style={[styles.greeting, { color: textMuted }]}>Dream big, achieve bigger! 🎯</Text>
            <View style={styles.dateNavigator}>
              <TouchableOpacity
                onPress={() => {
                  const prevDate = new Date(selectedDate);
                  prevDate.setDate(prevDate.getDate() - 1);
                  setSelectedDate(prevDate.toISOString().split('T')[0]);
                }}
                style={[styles.dateArrow, { backgroundColor: cardBg }]}
                activeOpacity={0.7}
              >
                <Text style={[styles.dateArrowText, { color: theme.primary }]}>←</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowCalendarModal(true)} style={[styles.dateSelectorWide, { backgroundColor: selectedDate === formatDate(new Date()) ? colors.sage : cardBg }]}>
                <Text style={[styles.dateSelectorText, { color: selectedDate === formatDate(new Date()) ? '#fff' : theme.primary }]}>{formatLongDate(selectedDate)}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  const nextDate = new Date(selectedDate);
                  nextDate.setDate(nextDate.getDate() + 1);
                  setSelectedDate(nextDate.toISOString().split('T')[0]);
                }}
                style={[styles.dateArrow, { backgroundColor: cardBg }]}
                activeOpacity={0.7}
              >
                <Text style={[styles.dateArrowText, { color: theme.primary }]}>→</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={[styles.statBox, { backgroundColor: cardBg, borderTopColor: theme.primary }]}>
              <Text style={[styles.statNumber, { color: theme.primary }]}>{todoGoals.length}</Text>
              <Text style={[styles.statLabel, { color: textMuted }]}>PLANNED</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: cardBg, borderTopColor: theme.primary }]}>
              <Text style={[styles.statNumber, { color: theme.primary }]}>{doneGoals.length}</Text>
              <Text style={[styles.statLabel, { color: textMuted }]}>ACHIEVED</Text>
            </View>
          </View>

          {/* Input */}
          <View style={[styles.inputContainer, { backgroundColor: cardBg }]}>
            <TextInput
              style={[styles.input, { color: text }]}
              value={goalInput}
              onChangeText={setGoalInput}
              placeholder="Add a new goal"
              placeholderTextColor={textMuted}
              onSubmitEditing={addGoal}
            />
            <TouchableOpacity onPress={addGoal} style={styles.addButton}>
              <PlusIcon />
            </TouchableOpacity>
          </View>

          {/* Goal List */}
          {/* All Goals Achieved Banner */}
          {goals.length > 0 && todoGoals.length === 0 && (
            <View style={[styles.allDoneBanner, { backgroundColor: darkMode ? '#1a3a2e' : colors.sage }]}>
              <Text style={styles.allDoneEmoji}>🎉</Text>
              <Text style={[styles.allDoneTitle, { color: darkMode ? '#4a9d7f' : '#fff' }]}>All goals achieved!</Text>
              <Text style={[styles.allDoneSubtitle, { color: darkMode ? '#6ab896' : 'rgba(255,255,255,0.9)' }]}>Keep growing, set new goals!</Text>
            </View>
          )}

          {/* Empty State */}
          {goals.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyTitle, { color: text }]}>Ready when you are!</Text>
              <Text style={[styles.emptySubtitle, { color: textMuted }]}>Add your first goal above 👆</Text>
            </View>
          )}

          {/* Active Goals */}
          {todoGoals.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionIcon}>🎯</Text>
                <Text style={[styles.sectionTitle, { color: text }]}>My Goals</Text>
              </View>
              {todoGoals.map((goal) => (
                <TaskItem
                  key={goal.id}
                  task={{ id: goal.id, text: goal.text, completed: goal.completed, date: '' }}
                  onToggle={toggleGoal}
                  onDelete={deleteGoal}
                  onEditRepeat={() => {}}
                  cardBg={cardBg}
                  text={text}
                  textMuted={textMuted}
                  theme={theme}
                />
              ))}
            </View>
          )}

          {doneGoals.length > 0 && (
            <View style={[styles.section, styles.doneSection]}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionIcon}>✨</Text>
                <Text style={[styles.sectionTitle, { color: colors.mintDark }]}>Conquered!</Text>
              </View>
              {doneGoals.map((goal) => (
                <TaskItem
                  key={goal.id}
                  task={{ id: goal.id, text: goal.text, completed: goal.completed, date: '' }}
                  onToggle={toggleGoal}
                  onDelete={deleteGoal}
                  onEditRepeat={() => {}}
                  cardBg={cardBg}
                  text={text}
                  textMuted={textMuted}
                  theme={theme}
                />
              ))}
            </View>
          )}

          {/* Clear All Goals Button */}
          {goals.length > 0 && (
            <View style={styles.clearAllButtonContainer}>
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    'Clear All Goals',
                    'Are you sure you want to delete all goals? This action cannot be undone.',
                    [
                      {
                        text: 'Cancel',
                        style: 'cancel'
                      },
                      {
                        text: 'Clear All',
                        style: 'destructive',
                        onPress: () => setGoals([])
                      }
                    ]
                  );
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.clearAllButtonText, { color: textMuted }]}>Clear All Goals</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      );
    }

    if (currentTab === 'tips') {
      return (
        <>
          <View style={[styles.header, { paddingTop: insets.top }]}>
            <View style={styles.mascotContainer}>
              <Mascot size={90} />
            </View>
            <Text style={[styles.title, { color: text }]}>Tips</Text>
            <Text style={[styles.greeting, { color: textMuted }]}>No pressure, just gentle guidance 💚</Text>
          </View>

          <ScrollView style={styles.tipsList} contentContainerStyle={{ paddingBottom: 20 }}>
            {tips.map((tip) => (
              <View key={tip.id} style={[styles.tipCard, { backgroundColor: cardBg }]}>
                <Text style={styles.tipEmoji}>{tip.emoji}</Text>
                <View style={styles.tipContent}>
                  <Text style={[styles.tipTitle, { color: text }]}>{tip.title}</Text>
                  <Text style={[styles.tipDescription, { color: textMuted }]}>{tip.description}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </>
      );
    }

    if (currentTab === 'settings') {
      return (
        <ScrollView style={{ paddingTop: insets.top + 20 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 10 }}>
          <View style={styles.settingsHeader}>
            <Text style={[styles.settingsTitle, { color: text }]}>Settings</Text>
            <Text style={[styles.settingsSubtitle, { color: textMuted }]}>Customize your experience</Text>
          </View>

          {/* General Settings */}
          <View style={styles.settingsSection}>
            <Text style={[styles.settingsSectionTitle, { color: text }]}>General</Text>

            {/* Dark Mode */}
            <View style={[styles.settingsCard, { backgroundColor: cardBg }]}>
              <View style={styles.settingsToggleRow}>
                <View>
                  <Text style={[styles.settingsLabel, { color: text }]}>Dark Mode</Text>
                  <Text style={[styles.settingsDescription, { color: textMuted }]}>Switch to dark theme</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setDarkMode(!darkMode);
                    saveSettings({ darkMode: !darkMode });
                  }}
                  style={[styles.toggle, { backgroundColor: darkMode ? theme.primary : textMuted }, darkMode && styles.toggleActive]}
                >
                  <View style={[styles.toggleThumb, darkMode && styles.toggleThumbActive]} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Notifications */}
            <View style={[styles.settingsCard, { backgroundColor: cardBg }]}>
              <View style={styles.settingsToggleRow}>
                <View>
                  <Text style={[styles.settingsLabel, { color: text }]}>Daily Notifications</Text>
                  <Text style={[styles.settingsDescription, { color: textMuted }]}>Get a gentle daily reminder</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setNotificationsEnabled(!notificationsEnabled);
                    saveSettings({ notificationsEnabled: !notificationsEnabled });
                  }}
                  style={[styles.toggle, { backgroundColor: notificationsEnabled ? theme.primary : textMuted }, notificationsEnabled && styles.toggleActive]}
                >
                  <View style={[styles.toggleThumb, notificationsEnabled && styles.toggleThumbActive]} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Sounds */}
            <View style={[styles.settingsCard, { backgroundColor: cardBg }]}>
              <View style={styles.settingsToggleRow}>
                <View>
                  <Text style={[styles.settingsLabel, { color: text }]}>Sounds</Text>
                  <Text style={[styles.settingsDescription, { color: textMuted }]}>Play sound effects</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setSoundsEnabled(!soundsEnabled);
                    saveSettings({ soundsEnabled: !soundsEnabled });
                  }}
                  style={[styles.toggle, { backgroundColor: soundsEnabled ? theme.primary : textMuted }, soundsEnabled && styles.toggleActive]}
                >
                  <View style={[styles.toggleThumb, soundsEnabled && styles.toggleThumbActive]} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Language */}
            <TouchableOpacity
              style={[styles.settingsCard, { backgroundColor: cardBg }]}
              onPress={() => setShowLanguageModal(true)}
            >
              <View style={styles.settingsToggleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingsLabel, { color: text }]}>Language</Text>
                  <Text style={[styles.settingsDescription, { color: textMuted }]}>
                    {language === 'en' ? 'English' : language === 'fr' ? 'Français' : 'Español'}
                  </Text>
                </View>
                <Text style={[styles.settingsArrow, { color: textMuted }]}>›</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Menu Items */}
          <View style={styles.settingsSection}>
            <Text style={[styles.settingsSectionTitle, { color: text }]}>Menu Items</Text>

            {/* Goals Toggle */}
            <View style={[styles.settingsCard, { backgroundColor: cardBg }]}>
              <View style={styles.settingsToggleRow}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={[styles.settingsLabel, { color: text }]}>Goals</Text>
                    {!isPro && (
                      <View style={styles.proBadgeSmall}>
                        <Text style={styles.proBadgeSmallText}>PRO</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.settingsDescription, { color: textMuted }]}>Show Goals in bottom menu</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    if (!isPro) {
                      // Show upgrade modal if not Pro
                      setShowCustomPaywall(true);
                    } else {
                      setGoalsEnabled(!goalsEnabled);
                      saveSettings({ goalsEnabled: !goalsEnabled });
                    }
                  }}
                  style={[styles.toggle, { backgroundColor: goalsEnabled ? theme.primary : textMuted }, goalsEnabled && styles.toggleActive]}
                >
                  <View style={[styles.toggleThumb, goalsEnabled && styles.toggleThumbActive]} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Profile */}
            <View style={[styles.settingsCard, { backgroundColor: cardBg }]}>
              <View style={styles.settingsToggleRow}>
                <View>
                  <Text style={[styles.settingsLabel, { color: text }]}>Profile</Text>
                  <Text style={[styles.settingsDescription, { color: textMuted }]}>Show Profile in bottom menu</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setProfileEnabled(!profileEnabled);
                    saveSettings({ profileEnabled: !profileEnabled });
                  }}
                  style={[styles.toggle, { backgroundColor: profileEnabled ? theme.primary : textMuted }, profileEnabled && styles.toggleActive]}
                >
                  <View style={[styles.toggleThumb, profileEnabled && styles.toggleThumbActive]} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Tips */}
            <View style={[styles.settingsCard, { backgroundColor: cardBg }]}>
              <View style={styles.settingsToggleRow}>
                <View>
                  <Text style={[styles.settingsLabel, { color: text }]}>Tips</Text>
                  <Text style={[styles.settingsDescription, { color: textMuted }]}>Show Tips in bottom menu</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setTipsEnabled(!tipsEnabled);
                    saveSettings({ tipsEnabled: !tipsEnabled });
                  }}
                  style={[styles.toggle, { backgroundColor: tipsEnabled ? theme.primary : textMuted }, tipsEnabled && styles.toggleActive]}
                >
                  <View style={[styles.toggleThumb, tipsEnabled && styles.toggleThumbActive]} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Pro Features */}
          <View style={styles.settingsSection}>
            <Text style={[styles.settingsSectionTitle, { color: text }]}>Subscription</Text>

            {isPro ? (
              /* Pro Status Card */
              <View style={[styles.proCard, { backgroundColor: cardBg, borderColor: colors.mint }]}>
                <View style={styles.proHeader}>
                  <Text style={[styles.proTitle, { color: text }]}>Taskerino Pro</Text>
                  <View style={[styles.proBadge, { backgroundColor: colors.mint }]}>
                    <Text style={styles.proBadgeText}>✓ Active</Text>
                  </View>
                </View>
                <Text style={[styles.proDescription, { color: textMuted }]}>
                  {subscriptionStatus.isActive
                    ? subscriptionStatus.willRenew
                      ? 'Your subscription is active and will renew automatically.'
                      : 'Your subscription is active until the end of the current period.'
                    : 'Thank you for being a Pro member!'}
                </Text>

                {subscriptionStatus.expirationDate && (
                  <Text style={[styles.proDescription, { color: textMuted, marginTop: 8 }]}>
                    {subscriptionStatus.willRenew ? 'Renews' : 'Expires'} on{' '}
                    {subscriptionStatus.expirationDate.toLocaleDateString()}
                  </Text>
                )}

                <TouchableOpacity
                  style={[styles.proButton, { backgroundColor: theme.primary }]}
                  onPress={() => setShowCustomerCenter(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.proButtonText}>Manage Subscription</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Pro Upgrade Card */
              <View style={[styles.proCard, { backgroundColor: cardBg }]}>
                <View style={styles.proHeader}>
                  <Text style={[styles.proTitle, { color: text }]}>Upgrade to Pro</Text>
                  <View style={styles.proBadge}>
                    <Text style={styles.proBadgeText}>✨ Premium</Text>
                  </View>
                </View>
                <Text style={[styles.proDescription, { color: textMuted }]}>
                  Unlock powerful features and support development!
                </Text>

                <View style={styles.proFeatures}>
                  <View style={styles.proFeature}>
                    <Text style={styles.proFeatureIcon}>🎯</Text>
                    <Text style={[styles.proFeatureText, { color: text }]}>Goals tracking</Text>
                  </View>
                  <View style={styles.proFeature}>
                    <Text style={styles.proFeatureIcon}>🎨</Text>
                    <Text style={[styles.proFeatureText, { color: text }]}>Custom themes</Text>
                  </View>
                  <View style={styles.proFeature}>
                    <Text style={styles.proFeatureIcon}>☁️</Text>
                    <Text style={[styles.proFeatureText, { color: text }]}>Cloud sync (coming soon)</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.proButton, { backgroundColor: theme.primary }]}
                  onPress={() => setShowCustomPaywall(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.proButtonText}>See Plans & Pricing</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.restoreButton}
                  onPress={() => setShowCustomerCenter(true)}
                >
                  <Text style={[styles.restoreButtonText, { color: textMuted }]}>Restore Purchase</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* App Info */}
          <View style={styles.settingsSection}>
            <Text style={[styles.settingsSectionTitle, { color: text }]}>App Info</Text>
            <View style={[styles.settingsCard, { backgroundColor: cardBg }]}>
              <View style={styles.settingsRow}>
                <Text style={[styles.settingsLabel, { color: text }]}>Version</Text>
                <Text style={[styles.settingsValue, { color: textMuted }]}>1.0.0</Text>
              </View>
              <View style={styles.settingsRow}>
                <Text style={[styles.settingsLabel, { color: text }]}>Made with</Text>
                <Text style={[styles.settingsValue, { color: textMuted }]}>💚 & React Native</Text>
              </View>
            </View>
          </View>

          {/* Support */}
          <View style={[styles.settingsSection, { marginBottom: 0 }]}>
            <Text style={[styles.settingsSectionTitle, { color: text }]}>Support</Text>
            <TouchableOpacity style={[styles.settingsCard, { backgroundColor: cardBg }]}>
              <Text style={[styles.settingsLink, { color: theme.primary }]}>Send Feedback</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.settingsCard, { backgroundColor: cardBg }]}>
              <Text style={[styles.settingsLink, { color: theme.primary }]}>Rate on App Store</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      );
    }

    // Tasks view (default)
    return (
      <>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <View style={styles.mascotContainer}>
            <Mascot size={90} />
          </View>
          <Text style={[styles.title, { color: text }]}>Taskerino</Text>
          <Text style={[styles.greeting, { color: textMuted }]}>{greeting}</Text>
          <View style={styles.dateNavigator}>
            <TouchableOpacity
              onPress={() => {
                const prevDate = new Date(selectedDate);
                prevDate.setDate(prevDate.getDate() - 1);
                setSelectedDate(prevDate.toISOString().split('T')[0]);
              }}
              style={[styles.dateArrow, { backgroundColor: cardBg }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.dateArrowText, { color: theme.primary }]}>←</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowCalendarModal(true)} style={[styles.dateSelectorWide, { backgroundColor: selectedDate === formatDate(new Date()) ? colors.sage : cardBg }]}>
              <Text style={[styles.dateSelectorText, { color: selectedDate === formatDate(new Date()) ? '#fff' : theme.primary }]}>{formatLongDate(selectedDate)}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                const nextDate = new Date(selectedDate);
                nextDate.setDate(nextDate.getDate() + 1);
                setSelectedDate(nextDate.toISOString().split('T')[0]);
              }}
              style={[styles.dateArrow, { backgroundColor: cardBg }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.dateArrowText, { color: theme.primary }]}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={[styles.statBox, { backgroundColor: cardBg, borderTopColor: theme.primary }]}>
            <Text style={[styles.statNumber, { color: theme.primary }]}>{todo.length}</Text>
            <Text style={[styles.statLabel, { color: textMuted }]}>TO DO</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: cardBg, borderTopColor: theme.primary }]}>
            <Text style={[styles.statNumber, { color: theme.primary }]}>{done.length}</Text>
            <Text style={[styles.statLabel, { color: textMuted }]}>DONE</Text>
          </View>
        </View>

        {/* Input */}
        <View style={[styles.inputContainer, { backgroundColor: cardBg }]}>
          <TextInput
            value={input}
            onChangeText={setInput}
            onSubmitEditing={addTask}
            placeholder="Add a new task"
            placeholderTextColor={textMuted}
            maxLength={200}
            style={[styles.input, { color: text }]}
          />
          <TouchableOpacity
            onPress={() => {
              setEditingTaskId(null);
              setShowRepeatModal(true);
            }}
            style={[styles.repeatButton, { backgroundColor: repeatType !== 'none' ? theme.primary + '20' : 'transparent' }]}
            activeOpacity={0.7}
          >
            <RepeatIcon color={repeatType !== 'none' ? theme.primary : textMuted} size={20} />
          </TouchableOpacity>
          <TouchableOpacity onPress={addTask} style={styles.addButton} activeOpacity={0.7}>
            <PlusIcon />
          </TouchableOpacity>
        </View>

        {/* All Done Banner */}
        {tasksForDate.length > 0 && todo.length === 0 && (
          <View style={[styles.allDoneBanner, { backgroundColor: darkMode ? '#1a3a2e' : colors.sage }]}>
            <Text style={styles.allDoneEmoji}>🎉</Text>
            <Text style={[styles.allDoneTitle, { color: darkMode ? '#4a9d7f' : '#fff' }]}>You did it!</Text>
            <Text style={[styles.allDoneSubtitle, { color: darkMode ? '#6ab896' : 'rgba(255,255,255,0.9)' }]}>All tasks complete. You're amazing!</Text>
          </View>
        )}

        {/* Empty State */}
        {tasksForDate.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: text }]}>Ready when you are!</Text>
            <Text style={[styles.emptySubtitle, { color: textMuted }]}>Add your first task above 👆</Text>
          </View>
        )}

        {/* Tasks List */}
        {todo.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>📋</Text>
              <Text style={[styles.sectionTitle, { color: text }]}>Let's do this!</Text>
            </View>
            {todo.map(t => <TaskItem key={t.id} task={t} onToggle={toggleTask} onDelete={deleteTask} onEditRepeat={handleEditRepeat} cardBg={cardBg} text={text} textMuted={textMuted} theme={theme} />)}
          </View>
        )}

        {done.length > 0 && (
          <View style={[styles.section, styles.doneSection]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>✨</Text>
              <Text style={[styles.sectionTitle, { color: colors.mintDark }]}>Conquered!</Text>
            </View>
            {done.map(t => <TaskItem key={t.id} task={t} onToggle={toggleTask} onDelete={deleteTask} onEditRepeat={handleEditRepeat} cardBg={cardBg} text={text} textMuted={textMuted} theme={theme} />)}
          </View>
        )}

        {/* Clear All Tasks Button */}
        {tasksForDate.length > 0 && (
          <View style={styles.clearAllButtonContainer}>
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  'Clear All Tasks',
                  'Are you sure you want to delete all tasks for this date? This action cannot be undone.',
                  [
                    {
                      text: 'Cancel',
                      style: 'cancel'
                    },
                    {
                      text: 'Clear All',
                      style: 'destructive',
                      onPress: () => setTasks(tasks.filter(t => t.date !== selectedDate))
                    }
                  ]
                );
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.clearAllButtonText, { color: textMuted }]}>Clear All Tasks</Text>
            </TouchableOpacity>
          </View>
        )}
      </>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Confetti */}
      <View style={styles.confettiContainer} pointerEvents="none">
        {confetti.map(c => <ConfettiPiece key={c.id} delay={c.delay} x={c.x} color={c.color} />)}
      </View>

      {/* Celebration Modal */}
      {celebration && (
        <View style={styles.celebrationOverlay} pointerEvents="none">
          <Animated.View style={[styles.celebrationBox, { backgroundColor: cardBg, transform: [{ scale: celebScaleAnim }] }]}>
            <Text style={styles.celebrationEmoji}>{celebration.emoji}</Text>
            <Text style={[styles.celebrationText, { color: theme.primary }]}>{celebration.text}</Text>
          </Animated.View>
        </View>
      )}

      {/* Badge Detail Modal */}
      <Modal visible={showBadgeModal} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => setShowBadgeModal(false)}
          >
            <View style={styles.badgeModalContent}>
              {selectedBadge && (
                <View style={styles.badgeDetailCard}>
                  <TouchableOpacity onPress={() => setShowBadgeModal(false)} style={styles.badgeCloseButton}>
                    <CloseIcon />
                  </TouchableOpacity>

                  <Text style={[styles.badgeDetailEmoji, !selectedBadge.unlocked && styles.badgeLocked]}>{selectedBadge.emoji}</Text>
                  <Text style={styles.badgeDetailTitle}>{selectedBadge.title}</Text>

                  {selectedBadge.unlocked ? (
                    <View style={styles.badgeUnlockedBanner}>
                      <Text style={styles.badgeUnlockedText}>✓ Unlocked!</Text>
                    </View>
                  ) : (
                    <View style={styles.badgeLockedBanner}>
                      <Text style={styles.badgeLockedText}>🔒 Locked</Text>
                    </View>
                  )}

                  <Text style={styles.badgeDetailDescription}>{selectedBadge.detailedDescription}</Text>

                  {!selectedBadge.unlocked && (
                    <View style={styles.badgeDetailProgress}>
                      <Text style={styles.badgeDetailProgressLabel}>Your Progress</Text>
                      <View style={styles.badgeDetailProgressBar}>
                        <View style={[styles.badgeDetailProgressFill, { width: `${Math.min((selectedBadge.progress / selectedBadge.requirement) * 100, 100)}%` }]} />
                      </View>
                      <Text style={styles.badgeDetailProgressText}>
                        {selectedBadge.progress} / {selectedBadge.requirement}
                      </Text>
                    </View>
                  )}

                  <TouchableOpacity style={styles.badgeDetailButton} onPress={() => setShowBadgeModal(false)}>
                    <Text style={styles.badgeDetailButtonText}>Got it!</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Language Selector Modal */}
      <Modal visible={showLanguageModal} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setShowLanguageModal(false)}
            style={styles.modalOverlay}
          >
            <View style={styles.languageModal} onStartShouldSetResponder={() => true}>
              <Text style={styles.languageModalTitle}>Select Language</Text>

              <TouchableOpacity
                onPress={() => {
                  setLanguage('en');
                  saveSettings({ language: 'en' });
                  setShowLanguageModal(false);
                }}
                style={[styles.languageOption, language === 'en' && styles.languageOptionSelected]}
              >
                <Text style={styles.languageOptionText}>🇬🇧 English</Text>
                {language === 'en' && <Text style={styles.languageOptionCheck}>✓</Text>}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setLanguage('fr');
                  saveSettings({ language: 'fr' });
                  setShowLanguageModal(false);
                }}
                style={[styles.languageOption, language === 'fr' && styles.languageOptionSelected]}
              >
                <Text style={styles.languageOptionText}>🇫🇷 Français</Text>
                {language === 'fr' && <Text style={styles.languageOptionCheck}>✓</Text>}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setLanguage('es');
                  saveSettings({ language: 'es' });
                  setShowLanguageModal(false);
                }}
                style={[styles.languageOption, language === 'es' && styles.languageOptionSelected]}
              >
                <Text style={styles.languageOptionText}>🇪🇸 Español</Text>
                {language === 'es' && <Text style={styles.languageOptionCheck}>✓</Text>}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowLanguageModal(false)}
                style={styles.languageCancelButton}
              >
                <Text style={styles.languageCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Theme Color Modal */}
      <Modal visible={showThemeModal} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setShowThemeModal(false)}
            style={styles.modalOverlay}
          >
            <View style={styles.themeModal} onStartShouldSetResponder={() => true}>
              <Text style={styles.themeModalTitle}>Select Theme Color</Text>

              <View style={styles.themeColorGrid}>
                {(Object.keys(themeColors) as Array<keyof typeof themeColors>).map((colorKey) => (
                  <TouchableOpacity
                    key={colorKey}
                    onPress={() => {
                      // TODO: Check if user has Pro
                      setThemeColor(colorKey);
                      saveSettings({ themeColor: colorKey });
                      setShowThemeModal(false);
                    }}
                    style={[
                      styles.themeColorOption,
                      { backgroundColor: themeColors[colorKey].primary },
                      themeColor === colorKey && styles.themeColorOptionSelected
                    ]}
                  >
                    {themeColor === colorKey && <Text style={styles.themeColorCheck}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                onPress={() => setShowThemeModal(false)}
                style={styles.themeCancelButton}
              >
                <Text style={styles.themeCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Repeat Modal */}
      <Modal visible={showRepeatModal} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              setShowRepeatModal(false);
              setEditingTaskId(null);
              if (editingTaskId === null) {
                setRepeatType('none');
                setCustomDays([]);
              }
            }}
            style={styles.modalOverlay}
          >
            <View style={[styles.languageModal, { backgroundColor: cardBg }]} onStartShouldSetResponder={() => true}>
              <Text style={[styles.languageModalTitle, { color: text }]}>Repeat Task</Text>

              <TouchableOpacity
                onPress={() => {
                  if (editingTaskId !== null) {
                    setTasks(tasks.map(t =>
                      t.id === editingTaskId
                        ? { ...t, repeat: 'none', customDays: undefined }
                        : t
                    ));
                    setEditingTaskId(null);
                    setRepeatType('none');
                    setCustomDays([]);
                  } else {
                    setRepeatType('none');
                    setCustomDays([]);
                  }
                  setShowRepeatModal(false);
                }}
                style={[styles.languageOption, repeatType === 'none' && { backgroundColor: theme.primary }]}
              >
                <Text style={[styles.languageOptionText, { color: repeatType === 'none' ? '#fff' : text }]}>🚫 None</Text>
                {repeatType === 'none' && <Text style={styles.languageOptionCheck}>✓</Text>}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  if (editingTaskId !== null) {
                    setTasks(tasks.map(t =>
                      t.id === editingTaskId
                        ? { ...t, repeat: 'daily', customDays: undefined }
                        : t
                    ));
                    setEditingTaskId(null);
                    setRepeatType('none');
                    setCustomDays([]);
                  } else {
                    setRepeatType('daily');
                    setCustomDays([]);
                  }
                  setShowRepeatModal(false);
                }}
                style={[styles.languageOption, repeatType === 'daily' && { backgroundColor: theme.primary }]}
              >
                <Text style={[styles.languageOptionText, { color: repeatType === 'daily' ? '#fff' : text }]}>☀️ Daily</Text>
                {repeatType === 'daily' && <Text style={styles.languageOptionCheck}>✓</Text>}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  if (editingTaskId !== null) {
                    setTasks(tasks.map(t =>
                      t.id === editingTaskId
                        ? { ...t, repeat: 'weekly', customDays: undefined }
                        : t
                    ));
                    setEditingTaskId(null);
                    setRepeatType('none');
                    setCustomDays([]);
                  } else {
                    setRepeatType('weekly');
                    setCustomDays([]);
                  }
                  setShowRepeatModal(false);
                }}
                style={[styles.languageOption, repeatType === 'weekly' && { backgroundColor: theme.primary }]}
              >
                <Text style={[styles.languageOptionText, { color: repeatType === 'weekly' ? '#fff' : text }]}>📅 Weekly</Text>
                {repeatType === 'weekly' && <Text style={styles.languageOptionCheck}>✓</Text>}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  if (editingTaskId !== null) {
                    setTasks(tasks.map(t =>
                      t.id === editingTaskId
                        ? { ...t, repeat: 'monthly', customDays: undefined }
                        : t
                    ));
                    setEditingTaskId(null);
                    setRepeatType('none');
                    setCustomDays([]);
                  } else {
                    setRepeatType('monthly');
                    setCustomDays([]);
                  }
                  setShowRepeatModal(false);
                }}
                style={[styles.languageOption, repeatType === 'monthly' && { backgroundColor: theme.primary }]}
              >
                <Text style={[styles.languageOptionText, { color: repeatType === 'monthly' ? '#fff' : text }]}>🗓️ Monthly</Text>
                {repeatType === 'monthly' && <Text style={styles.languageOptionCheck}>✓</Text>}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setRepeatType('custom');
                  // Auto-select current day if no days selected yet
                  if (customDays.length === 0) {
                    const currentDay = new Date(selectedDate + 'T00:00:00').getDay();
                    setCustomDays([currentDay]);
                  }
                  // Don't close modal, show custom day picker
                }}
                style={[styles.languageOption, repeatType === 'custom' && { backgroundColor: theme.primary }]}
              >
                <Text style={[styles.languageOptionText, { color: repeatType === 'custom' ? '#fff' : text }]}>⚙️ Custom Days</Text>
                {repeatType === 'custom' && <Text style={styles.languageOptionCheck}>✓</Text>}
              </TouchableOpacity>

              {repeatType === 'custom' && (
                <View style={styles.customDaysContainer}>
                  <View style={styles.daysGrid}>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                      // Adjust index: Mon=1, Tue=2, ..., Sat=6, Sun=0
                      const dayIndex = index === 6 ? 0 : index + 1;
                      return (
                        <TouchableOpacity
                          key={index}
                          onPress={() => {
                            if (customDays.includes(dayIndex)) {
                              setCustomDays(customDays.filter(d => d !== dayIndex));
                            } else {
                              setCustomDays([...customDays, dayIndex].sort());
                            }
                          }}
                          style={[
                            styles.dayButton,
                            { borderColor: theme.primary },
                            customDays.includes(dayIndex) && { backgroundColor: theme.primary }
                          ]}
                        >
                          <Text style={[
                            styles.dayButtonText,
                            { color: customDays.includes(dayIndex) ? '#fff' : text }
                          ]}>
                            {day}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      if (editingTaskId !== null) {
                        setTasks(tasks.map(t =>
                          t.id === editingTaskId
                            ? { ...t, repeat: 'custom', customDays: customDays }
                            : t
                        ));
                        setEditingTaskId(null);
                        setRepeatType('none');
                        setCustomDays([]);
                      }
                      setShowRepeatModal(false);
                    }}
                    style={[styles.customDaysDoneButton, { backgroundColor: theme.primary }]}
                  >
                    <Text style={styles.customDaysDoneText}>Done</Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                onPress={() => {
                  setShowRepeatModal(false);
                  setEditingTaskId(null);
                  if (editingTaskId === null) {
                    setRepeatType('none');
                    setCustomDays([]);
                  }
                }}
                style={styles.languageCancelButton}
              >
                <Text style={styles.languageCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Calendar Modal */}
      <Modal visible={showCalendarModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.calendarModal}>
            <View style={styles.calendarHeader}>
              {calendarViewMode === 'month' && (
                <TouchableOpacity
                  onPress={() => setCalendarViewMode('year')}
                  style={styles.backButton}
                >
                  <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
              )}
              <Text style={styles.calendarTitle}>
                {calendarViewMode === 'year' && selectedYear}
                {calendarViewMode === 'month' && `${new Date(selectedYear, selectedMonth, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}
              </Text>
              <TouchableOpacity onPress={() => {
                setShowCalendarModal(false);
                setCalendarViewMode('month');
              }} style={styles.closeButton}>
                <CloseIcon />
              </TouchableOpacity>
            </View>

            {/* Year Navigation */}
            {calendarViewMode === 'year' && (
              <View style={styles.yearNavigation}>
                <TouchableOpacity onPress={() => setSelectedYear(selectedYear - 1)} style={styles.yearNavButton}>
                  <Text style={styles.yearNavText}>← {selectedYear - 1}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSelectedYear(new Date().getFullYear())} style={styles.yearNavButton}>
                  <Text style={styles.yearNavTextCurrent}>Today</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSelectedYear(selectedYear + 1)} style={styles.yearNavButton}>
                  <Text style={styles.yearNavText}>{selectedYear + 1} →</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Year View: 12-month grid */}
            {calendarViewMode === 'year' && (
              <ScrollView>
                <View style={styles.monthsGrid}>
                  {(generateCalendarDates() as any).map((item: any) => {
                    const today = new Date();
                    const isCurrentMonth = selectedYear === today.getFullYear() && item.month === today.getMonth();
                    return (
                      <TouchableOpacity
                        key={item.month}
                        onPress={() => {
                          setSelectedMonth(item.month);
                          setCalendarViewMode('month');
                        }}
                        style={styles.monthGridItem}
                      >
                        <Text style={[
                          styles.monthGridLabel,
                          isCurrentMonth && styles.monthGridLabelCurrent
                        ]}>{item.label}</Text>
                        <View style={styles.monthGridBadgeContainer}>
                          {item.taskCount > 0 && (
                            <View style={styles.monthGridBadge}>
                              <Text style={styles.monthGridBadgeText}>{item.taskCount}</Text>
                              {item.hasUnfinished && <Text style={styles.calendarUnfinishedDot}>●</Text>}
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            )}

            {/* Month View: Calendar grid */}
            {calendarViewMode === 'month' && (
              <ScrollView>
                {/* Month Navigation */}
                <View style={styles.monthNavigation}>
                  <TouchableOpacity
                    onPress={() => {
                      if (selectedMonth === 0) {
                        setSelectedMonth(11);
                        setSelectedYear(selectedYear - 1);
                      } else {
                        setSelectedMonth(selectedMonth - 1);
                      }
                    }}
                    style={styles.monthNavButton}
                  >
                    <Text style={styles.monthNavText}>←</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      const today = new Date();
                      setSelectedYear(today.getFullYear());
                      setSelectedMonth(today.getMonth());
                    }}
                    style={styles.monthNavButton}
                  >
                    <Text style={styles.yearNavTextCurrent}>Today</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      if (selectedMonth === 11) {
                        setSelectedMonth(0);
                        setSelectedYear(selectedYear + 1);
                      } else {
                        setSelectedMonth(selectedMonth + 1);
                      }
                    }}
                    style={styles.monthNavButton}
                  >
                    <Text style={styles.monthNavText}>→</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.weekdayHeaders}>
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                    <Text key={i} style={styles.weekdayHeader}>{day}</Text>
                  ))}
                </View>
                <View style={styles.calendarGrid}>
                  {(generateCalendarDates() as any).map((item: any, index: number) => {
                    const today = formatDate(new Date());
                    const isToday = item.date === today;
                    return (
                      <TouchableOpacity
                        key={index}
                        onPress={() => {
                          setSelectedDate(item.date);
                          setShowCalendarModal(false);
                        }}
                        style={[
                          styles.calendarGridDay,
                          !item.isCurrentMonth && styles.calendarGridDayOtherMonth
                        ]}
                      >
                        <View style={[
                          styles.calendarGridDayNumber,
                          isToday && styles.calendarGridDayNumberSelected
                        ]}>
                          <Text style={[
                            styles.calendarGridDayText,
                            !item.isCurrentMonth && styles.calendarGridDayTextMuted,
                            isToday && styles.calendarGridDayTextSelected
                          ]}>
                            {item.label}
                          </Text>
                        </View>
                        <View style={styles.calendarGridDayDotContainer}>
                          {item.taskCount > 0 && (
                            <View style={styles.calendarGridDayDot}>
                              <Text style={styles.calendarGridDayDotText}>{item.taskCount}</Text>
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {renderContent()}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { backgroundColor: cardBg, paddingBottom: insets.bottom }]}>
        <TouchableOpacity
          onPress={() => {
            setCurrentTab('tasks');
            scrollViewRef.current?.scrollTo({ y: 0, animated: false });
          }}
          style={styles.navItem}
          activeOpacity={0.7}
        >
          <CalendarIcon color={currentTab === 'tasks' ? theme.primary : textMuted} />
          <Text style={[styles.navLabel, { color: currentTab === 'tasks' ? theme.primary : textMuted }]}>Tasks</Text>
        </TouchableOpacity>

        {goalsEnabled && (
          <TouchableOpacity
            onPress={() => {
              setCurrentTab('goals');
              scrollViewRef.current?.scrollTo({ y: 0, animated: false });
            }}
            style={styles.navItem}
            activeOpacity={0.7}
          >
            <GoalsIcon color={currentTab === 'goals' ? theme.primary : textMuted} />
            <Text style={[styles.navLabel, { color: currentTab === 'goals' ? theme.primary : textMuted }]}>Goals</Text>
          </TouchableOpacity>
        )}

        {tipsEnabled && (
          <TouchableOpacity
            onPress={() => {
              setCurrentTab('tips');
              scrollViewRef.current?.scrollTo({ y: 0, animated: false });
            }}
            style={styles.navItem}
            activeOpacity={0.7}
          >
            <LightbulbIcon color={currentTab === 'tips' ? theme.primary : textMuted} />
            <Text style={[styles.navLabel, { color: currentTab === 'tips' ? theme.primary : textMuted }]}>Tips</Text>
          </TouchableOpacity>
        )}

        {profileEnabled && (
          <TouchableOpacity
            onPress={() => {
              setCurrentTab('profile');
              scrollViewRef.current?.scrollTo({ y: 0, animated: false });
            }}
            style={styles.navItem}
            activeOpacity={0.7}
          >
            <ProfileIcon color={currentTab === 'profile' ? theme.primary : textMuted} />
            <Text style={[styles.navLabel, { color: currentTab === 'profile' ? theme.primary : textMuted }]}>Profile</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => {
            setCurrentTab('settings');
            scrollViewRef.current?.scrollTo({ y: 0, animated: false });
          }}
          style={styles.navItem}
          activeOpacity={0.7}
        >
          <SettingsIcon color={currentTab === 'settings' ? theme.primary : textMuted} />
          <Text style={[styles.navLabel, { color: currentTab === 'settings' ? theme.primary : textMuted }]}>Settings</Text>
        </TouchableOpacity>
      </View>

      {/* RevenueCat Paywalls & Customer Center */}
      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onPurchaseSuccess={() => {
          // Refresh app state after successful purchase
          if (isPro) {
            setGoalsEnabled(true);
            saveSettings({ goalsEnabled: true });
          }
        }}
      />

      <CustomPaywall
        visible={showCustomPaywall}
        onClose={() => setShowCustomPaywall(false)}
        onPurchaseSuccess={() => {
          // Refresh app state after successful purchase
          if (isPro) {
            setGoalsEnabled(true);
            saveSettings({ goalsEnabled: true });
          }
        }}
      />

      <CustomerCenterModal
        visible={showCustomerCenter}
        onClose={() => setShowCustomerCenter(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgCream,
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
  },
  celebrationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 51,
  },
  celebrationBox: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 28,
    alignItems: 'center',
    shadowColor: '#4A4F4B',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 60,
    elevation: 20,
  },
  celebrationEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  celebrationText: {
    fontWeight: '800',
    fontSize: 24,
    color: colors.mintDark,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingBottom: 30,
  },
  mascotContainer: {
    marginBottom: 16,
  },
  title: {
    fontWeight: '800',
    fontSize: 32,
    color: colors.sage,
  },
  greeting: {
    fontSize: 15,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#4A4F4B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
    borderTopWidth: 4,
  },
  statNumber: {
    fontWeight: '800',
    fontSize: 32,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#4A4F4B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textDark,
    paddingVertical: 12,
  },
  addButton: {
    width: 52,
    height: 52,
    backgroundColor: colors.sage,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  repeatButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  allDoneBanner: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: colors.sage,
    width: '100%',
  },
  allDoneEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  allDoneTitle: {
    fontWeight: '800',
    fontSize: 20,
    color: '#fff',
  },
  allDoneSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyMascotContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyDecor: {
    position: 'absolute',
    fontSize: 24,
  },
  emptyTitle: {
    fontWeight: '800',
    fontSize: 22,
    color: colors.textDark,
  },
  emptySubtitle: {
    fontSize: 15,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: 8,
  },
  section: {
    marginBottom: 8,
  },
  doneSection: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionIcon: {
    fontSize: 20,
  },
  sectionTitle: {
    fontWeight: '800',
    fontSize: 18,
    color: colors.textDark,
  },
  taskItem: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#4A4F4B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
    marginBottom: 12,
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taskText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  repeatIndicator: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.4,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 12,
    shadowColor: '#4A4F4B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  dateSelectorText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.sage,
  },
  dateNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  dateArrow: {
    width: 44,
    height: 44,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: '#4A4F4B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  dateArrowText: {
    fontSize: 20,
    fontWeight: '700',
  },
  dateSelectorWide: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    shadowColor: '#4A4F4B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: colors.bgPeach,
    paddingTop: 12,
    paddingHorizontal: 8,
    shadowColor: '#4A4F4B',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  calendarModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: 520,
    paddingTop: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.bgPeach,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.sage,
  },
  yearNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.bgPeach,
  },
  yearNavButton: {
    padding: 8,
  },
  yearNavText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMuted,
  },
  yearNavTextCurrent: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.sage,
  },
  monthsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
  },
  monthGridItem: {
    width: '33.33%',
    height: 80,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthGridLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textDark,
    textAlign: 'center',
  },
  monthGridLabelCurrent: {
    color: colors.sage,
    fontWeight: '800',
  },
  monthGridBadgeContainer: {
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  monthGridBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: colors.mint,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  monthGridBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textDark,
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.bgPeach,
  },
  monthNavButton: {
    padding: 8,
  },
  monthNavText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textMuted,
  },
  weekdayHeaders: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  weekdayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  calendarGridDay: {
    width: `${100 / 7}%`,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
  },
  calendarGridDayNumber: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  calendarGridDayNumberSelected: {
    backgroundColor: colors.sage,
  },
  calendarGridDayOtherMonth: {
    opacity: 0.3,
  },
  calendarGridDayText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textDark,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  calendarGridDayTextMuted: {
    color: colors.textMuted,
  },
  calendarGridDayTextSelected: {
    color: '#fff',
    fontWeight: '800',
  },
  calendarGridDayTextToday: {
    color: colors.sage,
    fontWeight: '800',
  },
  calendarGridDayDotContainer: {
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  calendarGridDayDot: {
    backgroundColor: colors.mint,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  calendarGridDayDotText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textDark,
  },
  weekSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  weekDaysContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  weekDayItem: {
    flex: 1,
    backgroundColor: colors.bgPeach,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: 'center',
    minWidth: 0,
  },
  weekDayItemSelected: {
    backgroundColor: colors.sage,
  },
  weekDayName: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 6,
  },
  weekDayNameSelected: {
    color: 'rgba(255,255,255,0.8)',
  },
  weekDayNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textDark,
  },
  weekDayNumberSelected: {
    color: '#fff',
  },
  weekDayDot: {
    marginTop: 6,
    backgroundColor: colors.mint,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  weekDayDotText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textDark,
  },
  calendarTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textDark,
  },
  closeButton: {
    padding: 8,
  },
  calendarDateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.bgPeach,
  },
  calendarDateItemSelected: {
    backgroundColor: colors.sage + '20',
  },
  calendarDateContent: {
    flex: 1,
  },
  calendarDateText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textDark,
  },
  calendarDateTextSelected: {
    color: colors.sage,
  },
  calendarDateFull: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  calendarTaskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.mint,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  calendarTaskBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textDark,
  },
  calendarUnfinishedDot: {
    fontSize: 10,
    color: colors.sage,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  profileContainer: {
    alignItems: 'center',
    width: '100%',
  },
  profileAvatarContainer: {
    marginBottom: 20,
  },
  profileName: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textDark,
    marginBottom: 8,
  },
  profileSubtitle: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: '600',
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  profileStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  profileStatItem: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#4A4F4B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  profileStatNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.sage,
    marginBottom: 4,
  },
  profileStatLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    textAlign: 'center',
  },
  badgesList: {
    paddingHorizontal: 20,
  },
  taskList: {
    paddingHorizontal: 20,
  },
  goalsSection: {
    marginBottom: 32,
  },
  goalsSectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textDark,
    marginBottom: 16,
    marginTop: 8,
  },
  goalsPageHeader: {
    paddingHorizontal: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  goalsPageTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textDark,
    marginBottom: 8,
  },
  goalsPageSubtitle: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: '500',
  },
  goalsPageContent: {
    paddingHorizontal: 20,
  },
  goalsEmptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  goalsEmptyStateEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  goalsEmptyStateText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 8,
  },
  goalsEmptyStateSubtext: {
    fontSize: 14,
    color: colors.textMuted,
  },
  goalInputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  goalInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textDark,
    shadowColor: '#4A4F4B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  goalAddButton: {
    backgroundColor: colors.sage,
    borderRadius: 16,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalAddButtonText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  goalCategory: {
    marginBottom: 20,
  },
  goalCategoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalCategoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textDark,
  },
  goalCategoryToggle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
  },
  goalItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#4A4F4B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  goalText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.textDark,
  },
  goalTextCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  goalActions: {
    flexDirection: 'row',
    gap: 8,
  },
  goalStatusButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.bgPeach,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalStatusButtonText: {
    fontSize: 18,
  },
  goalDeleteButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.bgPeach,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalDeleteButtonText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textMuted,
  },
  goalStatusModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    shadowColor: '#4A4F4B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  goalStatusModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textDark,
    marginBottom: 20,
    textAlign: 'center',
  },
  goalStatusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgPeach,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  goalStatusOptionEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  goalStatusOptionText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textDark,
  },
  goalStatusCancelButton: {
    backgroundColor: colors.sage,
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    alignItems: 'center',
  },
  goalStatusCancelText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  achievementsToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  achievementsToggleIcon: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMuted,
  },
  badgesSectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textDark,
  },
  badgeCategoryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textMuted,
    marginTop: 20,
    marginBottom: 12,
  },
  badgesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  badgeMini: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: 110,
    shadowColor: '#4A4F4B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 2,
    borderColor: colors.gold,
  },
  badgeMiniLocked: {
    borderColor: colors.bgPeach,
    opacity: 0.6,
  },
  badgeMiniEmoji: {
    fontSize: 32,
    marginBottom: 6,
  },
  badgeLocked: {
    opacity: 0.3,
  },
  badgeMiniTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textDark,
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  badgeMiniProgress: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 4,
  },
  badgeModalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  badgeDetailCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#4A4F4B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 10,
    alignItems: 'center',
  },
  badgeCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 1,
  },
  badgeDetailEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  badgeDetailTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: 16,
  },
  badgeUnlockedBanner: {
    backgroundColor: colors.mint,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  badgeUnlockedText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  badgeLockedBanner: {
    backgroundColor: colors.bgPeach,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  badgeLockedText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textMuted,
  },
  badgeDetailDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  badgeDetailProgress: {
    width: '100%',
    marginBottom: 24,
  },
  badgeDetailProgressLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 12,
    textAlign: 'center',
  },
  badgeDetailProgressBar: {
    height: 12,
    backgroundColor: colors.bgPeach,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  badgeDetailProgressFill: {
    height: '100%',
    backgroundColor: colors.sage,
    borderRadius: 6,
  },
  badgeDetailProgressText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.sage,
    textAlign: 'center',
  },
  badgeDetailButton: {
    backgroundColor: colors.sage,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 40,
    shadowColor: colors.sageDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  badgeDetailButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
  },
  settingsHeader: {
    marginBottom: 24,
  },
  settingsTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textDark,
    marginBottom: 4,
  },
  settingsSubtitle: {
    fontSize: 15,
    color: colors.textMuted,
    fontWeight: '600',
  },
  settingsSection: {
    marginBottom: 32,
  },
  settingsSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textDark,
    marginBottom: 12,
  },
  settingsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#4A4F4B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingsLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textDark,
  },
  settingsValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textMuted,
  },
  settingsLink: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.sage,
    textAlign: 'center',
  },
  settingsToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingsDescription: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  settingsArrow: {
    fontSize: 24,
    color: colors.textMuted,
    fontWeight: '300',
  },
  toggle: {
    width: 51,
    height: 31,
    borderRadius: 15.5,
    backgroundColor: colors.textMuted,
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: colors.sage,
  },
  toggleThumb: {
    width: 27,
    height: 27,
    borderRadius: 13.5,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  proBadgeSmall: {
    backgroundColor: colors.gold,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  proBadgeSmallText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
  },
  languageModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  languageModalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textDark,
    marginBottom: 20,
    textAlign: 'center',
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: colors.bgCream,
  },
  languageOptionSelected: {
    backgroundColor: colors.sage,
  },
  languageOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textDark,
  },
  languageOptionCheck: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  languageCancelButton: {
    marginTop: 8,
    padding: 16,
    alignItems: 'center',
  },
  languageCancelText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMuted,
  },
  customDaysContainer: {
    marginTop: 16,
    gap: 16,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: 6,
    justifyContent: 'space-between',
  },
  dayButton: {
    flex: 1,
    aspectRatio: 1,
    minWidth: 40,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayButtonText: {
    fontSize: 11,
    fontWeight: '700',
  },
  customDaysDoneButton: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  customDaysDoneText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  themeColorPreview: {
    width: 40,
    height: 40,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  themeModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  themeModalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textDark,
    marginBottom: 20,
    textAlign: 'center',
  },
  themeColorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  themeColorOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  themeColorOptionSelected: {
    borderWidth: 3,
    borderColor: colors.textDark,
  },
  themeColorCheck: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  themeCancelButton: {
    marginTop: 16,
    padding: 16,
    alignItems: 'center',
  },
  themeCancelText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMuted,
  },
  proCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#4A4F4B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
    borderWidth: 2,
    borderColor: colors.gold,
  },
  proHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  proTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textDark,
  },
  proBadge: {
    backgroundColor: colors.lavender,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  proBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#fff',
  },
  proDescription: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 20,
  },
  proFeatures: {
    gap: 12,
    marginBottom: 24,
  },
  proFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  proFeatureIcon: {
    fontSize: 20,
  },
  proFeatureText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textDark,
  },
  proButton: {
    backgroundColor: colors.sage,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: colors.sageDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  proButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  restoreButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tipsHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  tipsTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textDark,
    marginTop: 16,
    marginBottom: 4,
  },
  tipsSubtitle: {
    fontSize: 15,
    color: colors.textMuted,
    fontWeight: '600',
  },
  tipsList: {
    paddingHorizontal: 20,
  },
  tipCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    gap: 16,
    shadowColor: '#4A4F4B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  tipEmoji: {
    fontSize: 40,
    marginTop: 4,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textDark,
    marginBottom: 8,
  },
  tipDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
    fontWeight: '500',
  },
  clearAllButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
  clearAllButtonContainer: {
    marginTop: 24,
    marginBottom: 20,
    alignItems: 'center',
  },
});
