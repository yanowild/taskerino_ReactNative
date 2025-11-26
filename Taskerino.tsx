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

const colors = {
  bgCream: '#F7F6F3', bgPeach: '#E8E4DD', sage: '#8FB996', sageDark: '#6A9B72',
  mint: '#A8D5BA', mintDark: '#7EC492', lavender: '#C4B7D6', textDark: '#4A4F4B', textMuted: '#8A8F8B', white: '#FFFFFF'
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
  const [currentTab, setCurrentTab] = useState<'tasks' | 'calendar' | 'profile' | 'settings'>('tasks');
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()));
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  useEffect(() => {
    loadTasks();
    const hour = new Date().getHours();
    const time = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    setGreeting(greetings[time][Math.floor(Math.random() * greetings[time].length)]);
  }, []);

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

  const renderContent = () => {
    if (currentTab === 'profile') {
      return (
        <View style={styles.centerContent}>
          <View style={styles.profileContainer}>
            <View style={styles.profileAvatarContainer}>
              <Mascot size={100} />
            </View>
            <Text style={styles.profileName}>Task Master</Text>
            <Text style={styles.profileSubtitle}>Keep crushing it! 💪</Text>

            <View style={styles.profileStats}>
              <View style={styles.profileStatItem}>
                <Text style={styles.profileStatNumber}>{tasks.length}</Text>
                <Text style={styles.profileStatLabel}>Total Tasks</Text>
              </View>
              <View style={styles.profileStatItem}>
                <Text style={styles.profileStatNumber}>{tasks.filter(t => t.completed).length}</Text>
                <Text style={styles.profileStatLabel}>Completed</Text>
              </View>
              <View style={styles.profileStatItem}>
                <Text style={styles.profileStatNumber}>{Math.round((tasks.filter(t => t.completed).length / (tasks.length || 1)) * 100)}%</Text>
                <Text style={styles.profileStatLabel}>Success Rate</Text>
              </View>
            </View>
          </View>
        </View>
      );
    }

    if (currentTab === 'settings') {
      return (
        <View style={styles.centerContent}>
          <View style={styles.settingsContainer}>
            <Text style={styles.settingsTitle}>Settings</Text>
            <Text style={styles.settingsSubtitle}>More features coming soon! 🚀</Text>
            <View style={styles.settingsItem}>
              <Text style={styles.settingsItemText}>Version 1.0.0</Text>
            </View>
          </View>
        </View>
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
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 4,
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
  profileStats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 32,
    width: '100%',
  },
  profileStatItem: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#4A4F4B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  profileStatNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.sage,
    marginBottom: 4,
  },
  profileStatLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textAlign: 'center',
  },
  settingsContainer: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  settingsTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textDark,
    marginBottom: 8,
  },
  settingsSubtitle: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: '600',
    marginBottom: 32,
  },
  settingsItem: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    shadowColor: '#4A4F4B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  settingsItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
    textAlign: 'center',
  },
});
