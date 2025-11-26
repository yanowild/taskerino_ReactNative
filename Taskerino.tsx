import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
  Modal,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path, Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

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
  { id: 10, emoji: "🎯", title: "Focused", description: "Completed all tasks in a day", detailedDescription: "Perfect execution! You completed every task you set for yourself in a single day. That's focus!", requirement: 1, type: "perfect_day" },
  { id: 11, emoji: "🚀", title: "Skyrocket", description: "Created 10 tasks in one day", detailedDescription: "Super productive day! Creating 10+ tasks shows serious planning energy. You're on fire!", requirement: 10, type: "productive_day" },
  { id: 12, emoji: "🌟", title: "Steady", description: "Completed tasks 5 days in a row", detailedDescription: "Steady wins the race! Completing tasks 5 days straight shows true dedication to progress.", requirement: 5, type: "completion_streak" },
];

const colors = {
  bgCream: '#F7F6F3', bgPeach: '#E8E4DD', sage: '#8FB996', sageDark: '#6A9B72',
  mint: '#A8D5BA', mintDark: '#7EC492', lavender: '#C4B7D6', textDark: '#4A4F4B', textMuted: '#8A8F8B', white: '#FFFFFF',
  gold: '#FFD700', silver: '#C0C0C0', bronze: '#CD7F32'
};

interface Task {
  id: number;
  text: string;
  completed: boolean;
  date: string; // YYYY-MM-DD format
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
  }, []);

  const s = size / 90;

  return (
    <Animated.View style={[{ width: size, height: size }, { transform: [{ translateY: bounceAnim }] }]}>
      <View style={{
        width: '100%', height: '100%', borderRadius: size / 2, backgroundColor: colors.sage,
        shadowColor: colors.sageDark, shadowOffset: { width: 0, height: 8 * s }, shadowOpacity: 0.3, shadowRadius: 0
      }}>
        {/* Left eye white */}
        <View style={{ position: 'absolute', width: 20 * s, height: 24 * s, backgroundColor: '#fff', borderRadius: (20 * s) / 2, top: 28 * s, left: 22 * s }} />
        {/* Right eye white */}
        <View style={{ position: 'absolute', width: 20 * s, height: 24 * s, backgroundColor: '#fff', borderRadius: (20 * s) / 2, top: 28 * s, right: 22 * s }} />
        {/* Left pupil */}
        <View style={{ position: 'absolute', width: 8 * s, height: 10 * s, backgroundColor: '#4A4F4B', borderRadius: (8 * s) / 2, top: 34 * s, left: 28 * s }} />
        {/* Right pupil */}
        <View style={{ position: 'absolute', width: 8 * s, height: 10 * s, backgroundColor: '#4A4F4B', borderRadius: (8 * s) / 2, top: 34 * s, right: 28 * s }} />
        {/* Left cheek */}
        <View style={{ position: 'absolute', width: 14 * s, height: 8 * s, backgroundColor: 'rgba(200,220,200,0.5)', borderRadius: (14 * s) / 2, top: 52 * s, left: 10 * s }} />
        {/* Right cheek */}
        <View style={{ position: 'absolute', width: 14 * s, height: 8 * s, backgroundColor: 'rgba(200,220,200,0.5)', borderRadius: (14 * s) / 2, top: 52 * s, right: 10 * s }} />
        {/* Smile */}
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

function TaskItem({ task, onToggle, onDelete }: { task: Task; onToggle: (id: number) => void; onDelete: (id: number) => void }) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[
      styles.taskItem,
      { opacity: task.completed ? 0.8 : opacityAnim, transform: [{ translateY: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }
    ]}>
      <TouchableOpacity onPress={() => onToggle(task.id)} style={[
        styles.checkbox,
        { borderColor: task.completed ? colors.mint : colors.bgPeach, backgroundColor: task.completed ? colors.mint : 'transparent' }
      ]}>
        {task.completed && <CheckIcon />}
      </TouchableOpacity>
      <Text style={[
        styles.taskText,
        { color: task.completed ? colors.textMuted : colors.textDark, textDecorationLine: task.completed ? 'line-through' : 'none' }
      ]} numberOfLines={3}>
        {task.text}
      </Text>
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
  }, []);

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

// Helper to get date string in YYYY-MM-DD format
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Helper to format date for display
const formatDisplayDate = (dateStr: string): string => {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (formatDate(date) === formatDate(today)) return 'Today';
  if (formatDate(date) === formatDate(yesterday)) return 'Yesterday';

  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

export default function Taskerino() {
  const insets = useSafeAreaInsets();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState('');
  const [greeting, setGreeting] = useState('');
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; color: string; delay: number }>>([]);
  const [celebration, setCelebration] = useState<{ emoji: string; text: string } | null>(null);
  const [currentTab, setCurrentTab] = useState<'tasks' | 'calendar' | 'profile' | 'tips' | 'settings'>('tasks');
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()));
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [lastLoginDate, setLastLoginDate] = useState<string>('');
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [selectedBadge, setSelectedBadge] = useState<typeof badges[0] | null>(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);

  useEffect(() => {
    loadTasks();
    loadStreakData();
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
          setCurrentStreak(parseInt(streak || '0'));
        } else if (diffDays === 1) {
          // Next day, increment streak
          const newStreak = parseInt(streak || '0') + 1;
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

  useEffect(() => {
    saveTasks();
  }, [tasks]);

  const loadTasks = async () => {
    try {
      const saved = await AsyncStorage.getItem('taskerino-tasks');
      if (saved) setTasks(JSON.parse(saved));
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  const saveTasks = async () => {
    try {
      await AsyncStorage.setItem('taskerino-tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error('Failed to save tasks:', error);
    }
  };

  const addTask = () => {
    if (!input.trim()) return;
    setTasks([{ id: Date.now(), text: input.trim(), completed: false, date: selectedDate }, ...tasks]);
    setInput('');
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        if (!t.completed) {
          setConfetti(Array.from({ length: 30 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
            delay: i * 30
          })));
          setCelebration(celebrations[Math.floor(Math.random() * celebrations.length)]);
          setTimeout(() => { setConfetti([]); setCelebration(null); }, 2000);
        }
        return { ...t, completed: !t.completed };
      }
      return t;
    }));
  };

  const deleteTask = (id: number) => setTasks(tasks.filter(t => t.id !== id));

  // Filter tasks by selected date
  const tasksForDate = tasks.filter(t => t.date === selectedDate);
  const todo = tasksForDate.filter(t => !t.completed);
  const done = tasksForDate.filter(t => t.completed);

  // Generate calendar dates (last 30 days + next 30 days)
  const generateCalendarDates = () => {
    const dates: Array<{ date: string; taskCount: number; hasUnfinished: boolean }> = [];
    const today = new Date();

    for (let i = -30; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = formatDate(date);
      const dateTasks = tasks.filter(t => t.date === dateStr);
      const unfinished = dateTasks.some(t => !t.completed);

      dates.push({
        date: dateStr,
        taskCount: dateTasks.length,
        hasUnfinished: unfinished
      });
    }

    return dates;
  };

  const celebScaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (celebration) {
      celebScaleAnim.setValue(0);
      Animated.spring(celebScaleAnim, { toValue: 1, friction: 8, useNativeDriver: true }).start();
    }
  }, [celebration]);

  // Calculate badge progress
  const getUnlockedBadges = () => {
    const completedCount = tasks.filter(t => t.completed).length;
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
          progress = completedCount;
          unlocked = completedCount >= badge.requirement;
          break;
        case 'streak':
          progress = currentStreak;
          unlocked = currentStreak >= badge.requirement;
          break;
        case 'perfect_day':
        case 'productive_day':
          // These would need more complex tracking, simplified for now
          unlocked = false;
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
        <View style={{ paddingTop: insets.top + 20 }}>
          <View style={styles.profileHeader}>
            <View style={styles.profileAvatarContainer}>
              <Mascot size={100} />
            </View>
            <Text style={styles.profileName}>Task Master</Text>
            <Text style={styles.profileSubtitle}>You're doing amazing! 💚</Text>

            <View style={styles.profileStats}>
              <View style={styles.profileStatItem}>
                <Text style={styles.profileStatNumber}>{tasks.length}</Text>
                <Text style={styles.profileStatLabel}>Tasks Created</Text>
              </View>
              <View style={styles.profileStatItem}>
                <Text style={[styles.profileStatNumber, { color: colors.mint }]}>🔥 {currentStreak}</Text>
                <Text style={styles.profileStatLabel}>Day Streak</Text>
              </View>
              <View style={styles.profileStatItem}>
                <Text style={[styles.profileStatNumber, { color: colors.lavender }]}>{earnedCount}</Text>
                <Text style={styles.profileStatLabel}>Badges Earned</Text>
              </View>
            </View>
          </View>

          <ScrollView style={styles.badgesList} contentContainerStyle={{ paddingBottom: 20 }}>
            <Text style={styles.badgesSectionTitle}>🏆 Achievements</Text>

            {/* Tasks Category */}
            <Text style={styles.badgeCategoryTitle}>🌱 Creation Journey</Text>
            <View style={styles.badgesRow}>
              {unlockedBadges.filter(b => b.type === 'tasks').map((badge) => (
                <TouchableOpacity
                  key={badge.id}
                  style={[styles.badgeMini, !badge.unlocked && styles.badgeMiniLocked]}
                  onPress={() => {
                    setSelectedBadge(badge);
                    setShowBadgeModal(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.badgeMiniEmoji, !badge.unlocked && styles.badgeLocked]}>{badge.emoji}</Text>
                  <Text style={styles.badgeMiniTitle}>{badge.title}</Text>
                  {!badge.unlocked && (
                    <Text style={styles.badgeMiniProgress}>{badge.progress}/{badge.requirement}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Streak Category */}
            <Text style={styles.badgeCategoryTitle}>🔥 Streak Power</Text>
            <View style={styles.badgesRow}>
              {unlockedBadges.filter(b => b.type === 'streak').map((badge) => (
                <TouchableOpacity
                  key={badge.id}
                  style={[styles.badgeMini, !badge.unlocked && styles.badgeMiniLocked]}
                  onPress={() => {
                    setSelectedBadge(badge);
                    setShowBadgeModal(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.badgeMiniEmoji, !badge.unlocked && styles.badgeLocked]}>{badge.emoji}</Text>
                  <Text style={styles.badgeMiniTitle}>{badge.title}</Text>
                  {!badge.unlocked && (
                    <Text style={styles.badgeMiniProgress}>{badge.progress}/{badge.requirement}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Completion Category */}
            <Text style={styles.badgeCategoryTitle}>✨ Completion Master</Text>
            <View style={styles.badgesRow}>
              {unlockedBadges.filter(b => b.type === 'completed').map((badge) => (
                <TouchableOpacity
                  key={badge.id}
                  style={[styles.badgeMini, !badge.unlocked && styles.badgeMiniLocked]}
                  onPress={() => {
                    setSelectedBadge(badge);
                    setShowBadgeModal(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.badgeMiniEmoji, !badge.unlocked && styles.badgeLocked]}>{badge.emoji}</Text>
                  <Text style={styles.badgeMiniTitle}>{badge.title}</Text>
                  {!badge.unlocked && (
                    <Text style={styles.badgeMiniProgress}>{badge.progress}/{badge.requirement}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Special Category */}
            <Text style={styles.badgeCategoryTitle}>🎯 Special Achievements</Text>
            <View style={styles.badgesRow}>
              {unlockedBadges.filter(b => b.type === 'perfect_day' || b.type === 'productive_day' || b.type === 'completion_streak').map((badge) => (
                <TouchableOpacity
                  key={badge.id}
                  style={[styles.badgeMini, !badge.unlocked && styles.badgeMiniLocked]}
                  onPress={() => {
                    setSelectedBadge(badge);
                    setShowBadgeModal(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.badgeMiniEmoji, !badge.unlocked && styles.badgeLocked]}>{badge.emoji}</Text>
                  <Text style={styles.badgeMiniTitle}>{badge.title}</Text>
                  {!badge.unlocked && (
                    <Text style={styles.badgeMiniProgress}>Locked</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      );
    }

    if (currentTab === 'tips') {
      return (
        <View style={{ paddingTop: insets.top + 20 }}>
          <View style={styles.tipsHeader}>
            <Mascot size={70} />
            <Text style={styles.tipsTitle}>Friendly Tips</Text>
            <Text style={styles.tipsSubtitle}>No pressure, just gentle guidance 💚</Text>
          </View>
          <ScrollView style={styles.tipsList} contentContainerStyle={{ paddingBottom: 20 }}>
            {tips.map((tip) => (
              <View key={tip.id} style={styles.tipCard}>
                <Text style={styles.tipEmoji}>{tip.emoji}</Text>
                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>{tip.title}</Text>
                  <Text style={styles.tipDescription}>{tip.description}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      );
    }

    if (currentTab === 'settings') {
      return (
        <ScrollView style={{ paddingTop: insets.top + 20 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
          <View style={styles.settingsHeader}>
            <Text style={styles.settingsTitle}>Settings</Text>
            <Text style={styles.settingsSubtitle}>Customize your experience</Text>
          </View>

          {/* Pro Section */}
          <View style={styles.settingsSection}>
            <Text style={styles.settingsSectionTitle}>⭐ Taskerino Pro</Text>
            <View style={styles.proCard}>
              <View style={styles.proHeader}>
                <Text style={styles.proTitle}>Upgrade to Pro</Text>
                <View style={styles.proBadge}>
                  <Text style={styles.proBadgeText}>✨ Premium</Text>
                </View>
              </View>
              <Text style={styles.proDescription}>Unlock powerful features and support development!</Text>

              <View style={styles.proFeatures}>
                <View style={styles.proFeature}>
                  <Text style={styles.proFeatureIcon}>🎨</Text>
                  <Text style={styles.proFeatureText}>Custom themes & colors</Text>
                </View>
                <View style={styles.proFeature}>
                  <Text style={styles.proFeatureIcon}>☁️</Text>
                  <Text style={styles.proFeatureText}>Cloud sync across devices</Text>
                </View>
                <View style={styles.proFeature}>
                  <Text style={styles.proFeatureIcon}>📊</Text>
                  <Text style={styles.proFeatureText}>Advanced statistics</Text>
                </View>
                <View style={styles.proFeature}>
                  <Text style={styles.proFeatureIcon}>🔔</Text>
                  <Text style={styles.proFeatureText}>Smart reminders</Text>
                </View>
                <View style={styles.proFeature}>
                  <Text style={styles.proFeatureIcon}>🏅</Text>
                  <Text style={styles.proFeatureText}>Exclusive badges</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.proButton} activeOpacity={0.8}>
                <Text style={styles.proButtonText}>Get Pro - $4.99/month</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.restoreButton}>
                <Text style={styles.restoreButtonText}>Restore Purchase</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* App Info */}
          <View style={styles.settingsSection}>
            <Text style={styles.settingsSectionTitle}>ℹ️ App Info</Text>
            <View style={styles.settingsCard}>
              <View style={styles.settingsRow}>
                <Text style={styles.settingsLabel}>Version</Text>
                <Text style={styles.settingsValue}>1.0.0</Text>
              </View>
              <View style={styles.settingsRow}>
                <Text style={styles.settingsLabel}>Made with</Text>
                <Text style={styles.settingsValue}>💚 & React Native</Text>
              </View>
            </View>
          </View>

          {/* Support */}
          <View style={styles.settingsSection}>
            <Text style={styles.settingsSectionTitle}>💬 Support</Text>
            <TouchableOpacity style={styles.settingsCard}>
              <Text style={styles.settingsLink}>Send Feedback</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsCard}>
              <Text style={styles.settingsLink}>Rate on App Store</Text>
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
          <Text style={styles.title}>Taskerino</Text>
          <Text style={styles.greeting}>{greeting}</Text>
          <TouchableOpacity onPress={() => setShowCalendarModal(true)} style={styles.dateSelector}>
            <CalendarIcon color={colors.sage} />
            <Text style={styles.dateSelectorText}>{formatDisplayDate(selectedDate)}</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={[styles.statBox, { borderTopColor: colors.sage }]}>
            <Text style={[styles.statNumber, { color: colors.sage }]}>{todo.length}</Text>
            <Text style={styles.statLabel}>TO DO</Text>
          </View>
          <View style={[styles.statBox, { borderTopColor: colors.mint }]}>
            <Text style={[styles.statNumber, { color: colors.mint }]}>{done.length}</Text>
            <Text style={styles.statLabel}>DONE</Text>
          </View>
        </View>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            value={input}
            onChangeText={setInput}
            onSubmitEditing={addTask}
            placeholder="What's on your mind?"
            placeholderTextColor={colors.textMuted}
            maxLength={200}
            style={styles.input}
          />
          <TouchableOpacity onPress={addTask} style={styles.addButton} activeOpacity={0.7}>
            <PlusIcon />
          </TouchableOpacity>
        </View>

        {/* All Done Banner */}
        {tasksForDate.length > 0 && todo.length === 0 && (
          <View style={styles.allDoneBanner}>
            <Text style={styles.allDoneEmoji}>🎉</Text>
            <Text style={styles.allDoneTitle}>You did it!</Text>
            <Text style={styles.allDoneSubtitle}>All tasks complete. You're amazing!</Text>
          </View>
        )}

        {/* Empty State */}
        {tasksForDate.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyMascotContainer}>
              <Text style={[styles.emptyDecor, { top: 0, left: 10 }]}>✨</Text>
              <Text style={[styles.emptyDecor, { top: 20, right: 5 }]}>⭐</Text>
              <Text style={[styles.emptyDecor, { bottom: 10, left: 20 }]}>💫</Text>
              <Mascot size={80} />
            </View>
            <Text style={styles.emptyTitle}>Ready when you are!</Text>
            <Text style={styles.emptySubtitle}>Add your first task above 👆</Text>
          </View>
        )}

        {/* Tasks List */}
        {todo.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>📋</Text>
              <Text style={styles.sectionTitle}>Let's do this!</Text>
            </View>
            {todo.map(t => <TaskItem key={t.id} task={t} onToggle={toggleTask} onDelete={deleteTask} />)}
          </View>
        )}

        {done.length > 0 && (
          <View style={[styles.section, styles.doneSection]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>✨</Text>
              <Text style={[styles.sectionTitle, { color: colors.mintDark }]}>Conquered!</Text>
            </View>
            {done.map(t => <TaskItem key={t.id} task={t} onToggle={toggleTask} onDelete={deleteTask} />)}
          </View>
        )}
      </>
    );
  };

  return (
    <View style={styles.container}>
      {/* Confetti */}
      <View style={styles.confettiContainer} pointerEvents="none">
        {confetti.map(c => <ConfettiPiece key={c.id} delay={c.delay} x={c.x} color={c.color} />)}
      </View>

      {/* Celebration Modal */}
      {celebration && (
        <View style={styles.celebrationOverlay} pointerEvents="none">
          <Animated.View style={[styles.celebrationBox, { transform: [{ scale: celebScaleAnim }] }]}>
            <Text style={styles.celebrationEmoji}>{celebration.emoji}</Text>
            <Text style={styles.celebrationText}>{celebration.text}</Text>
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

      {/* Calendar Modal */}
      <Modal visible={showCalendarModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.calendarModal}>
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarTitle}>Select Date</Text>
              <TouchableOpacity onPress={() => setShowCalendarModal(false)} style={styles.closeButton}>
                <CloseIcon />
              </TouchableOpacity>
            </View>
            <FlatList
              data={generateCalendarDates()}
              keyExtractor={(item) => item.date}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedDate(item.date);
                    setShowCalendarModal(false);
                  }}
                  style={[
                    styles.calendarDateItem,
                    item.date === selectedDate && styles.calendarDateItemSelected
                  ]}
                >
                  <View style={styles.calendarDateContent}>
                    <Text style={[
                      styles.calendarDateText,
                      item.date === selectedDate && styles.calendarDateTextSelected
                    ]}>
                      {formatDisplayDate(item.date)}
                    </Text>
                    <Text style={styles.calendarDateFull}>{item.date}</Text>
                  </View>
                  {item.taskCount > 0 && (
                    <View style={styles.calendarTaskBadge}>
                      <Text style={styles.calendarTaskBadgeText}>{item.taskCount}</Text>
                      {item.hasUnfinished && <Text style={styles.calendarUnfinishedDot}>●</Text>}
                    </View>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {renderContent()}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { paddingBottom: insets.bottom }]}>
        <TouchableOpacity
          onPress={() => setCurrentTab('tasks')}
          style={styles.navItem}
          activeOpacity={0.7}
        >
          <CalendarIcon color={currentTab === 'tasks' ? colors.sage : colors.textMuted} />
          <Text style={[styles.navLabel, currentTab === 'tasks' && { color: colors.sage }]}>Tasks</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowCalendarModal(true)}
          style={styles.navItem}
          activeOpacity={0.7}
        >
          <CalendarIcon color={colors.textMuted} />
          <Text style={styles.navLabel}>Calendar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setCurrentTab('tips')}
          style={styles.navItem}
          activeOpacity={0.7}
        >
          <LightbulbIcon color={currentTab === 'tips' ? colors.sage : colors.textMuted} />
          <Text style={[styles.navLabel, currentTab === 'tips' && { color: colors.sage }]}>Tips</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setCurrentTab('profile')}
          style={styles.navItem}
          activeOpacity={0.7}
        >
          <ProfileIcon color={currentTab === 'profile' ? colors.sage : colors.textMuted} />
          <Text style={[styles.navLabel, currentTab === 'profile' && { color: colors.sage }]}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setCurrentTab('settings')}
          style={styles.navItem}
          activeOpacity={0.7}
        >
          <SettingsIcon color={currentTab === 'settings' ? colors.sage : colors.textMuted} />
          <Text style={[styles.navLabel, currentTab === 'settings' && { color: colors.sage }]}>Settings</Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 100,
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
    textShadowColor: 'rgba(106,155,114,0.2)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 0,
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
    shadowColor: colors.sageDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  allDoneBanner: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: colors.mint,
  },
  allDoneEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  allDoneTitle: {
    fontWeight: '800',
    fontSize: 20,
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
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
    marginBottom: 24,
  },
  doneSection: {
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
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
  taskText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
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
    fontSize: 15,
    fontWeight: '700',
    color: colors.sage,
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
    maxHeight: '80%',
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
    marginTop: 24,
    width: '100%',
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
  badgesSectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textDark,
    marginBottom: 16,
    marginTop: 8,
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
});
