
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Keyboard,
  Animated,
  StatusBar,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage key for saved tasks
const STORAGE_KEY = 'campus_quest_tasks';

// Animated task card component
function TaskCard({ item, onToggle, onEdit, onDelete, disabled }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(25)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Animate the card when it appears
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.taskCard,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <View style={styles.taskTop}>
        <View style={styles.taskInfo}>
          <Text
            style={[
              styles.taskTitle,
              item.done && styles.completedTask,
            ]}
          >
            {item.title}
          </Text>

          <Text style={styles.taskCategory}>
            {item.category || 'Assignment'}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            item.done ? styles.completedBadge : styles.pendingBadge,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              item.done ? styles.completedStatus : styles.pendingStatus,
            ]}
          >
            {item.done ? 'Done' : 'Pending'}
          </Text>
        </View>
      </View>

      {/* Task action buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.completeButton}
          onPress={() => onToggle(item.id)}
          disabled={disabled}
          activeOpacity={0.75}
        >
          <Text style={styles.actionText}>
            {item.done ? 'Undo' : '✓ Complete'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => onEdit(item)}
          disabled={disabled}
          activeOpacity={0.75}
        >
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(item.id)}
          disabled={disabled}
          activeOpacity={0.75}
        >
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [category, setCategory] = useState('Assignment');
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Animate the app header when the screen opens
  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(headerSlide, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Load saved tasks from AsyncStorage
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const savedTasks = await AsyncStorage.getItem(STORAGE_KEY);

        if (savedTasks !== null) {
          const parsedTasks = JSON.parse(savedTasks);

          if (Array.isArray(parsedTasks)) {
            setTasks(parsedTasks);
          }
        }
      } catch (error) {
        console.log('Loading error:', error);
        Alert.alert('Error', 'Unable to load saved tasks.');
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  // Save the updated task list
  const saveTasks = async (updatedTasks) => {
    if (saving) return false;

    setSaving(true);

    try {
      // Convert the array into JSON text
      const jsonValue = JSON.stringify(updatedTasks);

      // Save JSON text to device storage
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);

      // Update the displayed task list
      setTasks(updatedTasks);

      return true;
    } catch (error) {
      console.log('Saving error:', error);
      Alert.alert('Error', 'Unable to save your changes.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Create a new task
  const addTask = async () => {
    if (!taskTitle.trim()) {
      Alert.alert('Required', 'Please enter a task title.');
      return;
    }

    const newTask = {
      id: Date.now().toString(),
      title: taskTitle.trim(),
      category,
      done: false,
    };

    const success = await saveTasks([...tasks, newTask]);

    if (success) {
      setTaskTitle('');
      setCategory('Assignment');
      Keyboard.dismiss();
    }
  };

  // Update task completion status
  const toggleTask = async (id) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id
        ? { ...task, done: !task.done }
        : task
    );

    await saveTasks(updatedTasks);
  };

  // Select a task for editing
  const editTask = (task) => {
    setTaskTitle(task.title);
    setCategory(task.category || 'Assignment');
    setEditingId(task.id);
  };

  // Save edited task details
  const updateTask = async () => {
    if (!taskTitle.trim()) {
      Alert.alert('Required', 'Please enter a task title.');
      return;
    }

    const updatedTasks = tasks.map((task) =>
      task.id === editingId
        ? {
            ...task,
            title: taskTitle.trim(),
            category,
          }
        : task
    );

    const success = await saveTasks(updatedTasks);

    if (success) {
      setTaskTitle('');
      setCategory('Assignment');
      setEditingId(null);
      Keyboard.dismiss();
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setTaskTitle('');
    setCategory('Assignment');
    setEditingId(null);
    Keyboard.dismiss();
  };

  // Delete a task
  const deleteTask = (id) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedTasks = tasks.filter(
              (task) => task.id !== id
            );

            const success = await saveTasks(updatedTasks);

            if (success && editingId === id) {
              cancelEdit();
            }
          },
        },
      ]
    );
  };

  // Animate the main action button when pressed
  const animateButton = () => {
    Animated.sequence([
      Animated.spring(buttonScale, {
        toValue: 0.96,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleMainAction = () => {
    animateButton();

    if (editingId) {
      updateTask();
    } else {
      addTask();
    }
  };

  // Calculate task statistics
  const completedCount = tasks.filter((task) => task.done).length;
  const pendingCount = tasks.length - completedCount;
  const progress =
    tasks.length > 0 ? completedCount / tasks.length : 0;

  // Display loading screen
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF0F5" />
        <Text style={styles.loadingIcon}>🌸</Text>
        <ActivityIndicator size="large" color="#E75480" />
        <Text style={styles.loadingText}>
          Preparing your Campus Quest...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF0F5" />

      {/* Animated application header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerAnim,
            transform: [{ translateY: headerSlide }],
          },
        ]}
      >
        <Text style={styles.welcome}>YOUR DAILY STUDENT PLANNER</Text>
        <Text style={styles.title}>Campus Quest 🌸</Text>
        <Text style={styles.subtitle}>
          Dream big. Stay organized. Get things done.
        </Text>
      </Animated.View>

      {/* Task statistics */}
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryIcon}>📚</Text>
          <Text style={styles.summaryNumber}>{tasks.length}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={styles.summaryIcon}>⏳</Text>
          <Text style={styles.summaryNumber}>{pendingCount}</Text>
          <Text style={styles.summaryLabel}>Pending</Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={styles.summaryIcon}>💗</Text>
          <Text style={styles.summaryNumber}>{completedCount}</Text>
          <Text style={styles.summaryLabel}>Completed</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Your Progress</Text>
          <Text style={styles.progressPercent}>
            {Math.round(progress * 100)}%
          </Text>
        </View>

        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressCaption}>
          Keep going! Every little step counts.
        </Text>
      </View>

      {/* Add or edit task form */}
      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>
          {editingId ? '✏️ Edit Your Task' : '✨ Create a New Task'}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="What do you need to accomplish?"
          placeholderTextColor="#B58D9D"
          value={taskTitle}
          onChangeText={setTaskTitle}
          editable={!saving}
        />

        <Text style={styles.label}>Choose a Category</Text>

        <View style={styles.categoryRow}>
          {['Assignment', 'Exam', 'Project'].map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.categoryButton,
                category === item && styles.selectedCategory,
              ]}
              onPress={() => setCategory(item)}
              disabled={saving}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.categoryText,
                  category === item && styles.selectedCategoryText,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleMainAction}
            disabled={saving}
            activeOpacity={0.85}
          >
            <Text style={styles.addButtonText}>
              {saving
                ? 'Saving...'
                : editingId
                  ? 'Save Changes'
                  : '+ Add New Task'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {editingId && (
          <TouchableOpacity
            onPress={cancelEdit}
            disabled={saving}
          >
            <Text style={styles.cancelText}>Cancel Editing</Text>
          </TouchableOpacity>
        )}

        {saving && (
          <View style={styles.savingContainer}>
            <ActivityIndicator size="small" color="#E75480" />
            <Text style={styles.savingText}>Saving your changes...</Text>
          </View>
        )}
      </View>

      {/* Task list */}
      <View style={styles.listHeader}>
        <Text style={styles.sectionTitle}>My School Tasks</Text>
        <Text style={styles.taskCount}>{tasks.length} tasks</Text>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🧸</Text>
            <Text style={styles.emptyTitle}>Nothing here yet!</Text>
            <Text style={styles.emptyText}>
              Add your first school task and start your journey.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TaskCard
            item={item}
            onToggle={toggleTask}
            onEdit={editTask}
            onDelete={deleteTask}
            disabled={saving}
          />
        )}
      />

      {/* Footer */}
      <Text style={styles.footer}>
        Made for your goals • Campus Quest 💕
      </Text>
    </View>
  );
}

// Pink modern application design
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F5',
    paddingHorizontal: 18,
    paddingTop: 45,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFF0F5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingIcon: {
    fontSize: 45,
    marginBottom: 15,
  },

  loadingText: {
    color: '#C04B75',
    fontSize: 13,
    marginTop: 12,
    fontWeight: '600',
  },

  header: {
    alignItems: 'center',
    marginBottom: 18,
  },

  welcome: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#C17A96',
    letterSpacing: 2,
  },

  title: {
    fontSize: 29,
    fontWeight: 'bold',
    color: '#C44575',
    marginTop: 5,
  },

  subtitle: {
    fontSize: 12,
    color: '#A77A8B',
    textAlign: 'center',
    marginTop: 5,
  },

  summary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    borderRadius: 18,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#D98BA8',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },

  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },

  summaryIcon: {
    fontSize: 19,
    marginBottom: 4,
  },

  summaryNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#D94F82',
  },

  summaryLabel: {
    fontSize: 11,
    color: '#A77A8B',
    marginTop: 3,
  },

  progressCard: {
    backgroundColor: '#FFE0EB',
    padding: 15,
    borderRadius: 15,
    marginBottom: 14,
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 9,
  },

  progressTitle: {
    color: '#A83F6A',
    fontSize: 13,
    fontWeight: 'bold',
  },

  progressPercent: {
    color: '#C44575',
    fontWeight: 'bold',
  },

  progressBackground: {
    height: 9,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    overflow: 'hidden',
  },

  progressFill: {
    height: 9,
    backgroundColor: '#E75480',
    borderRadius: 10,
  },

  progressCaption: {
    color: '#A77A8B',
    fontSize: 10,
    marginTop: 8,
  },

  formCard: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 17,
    marginBottom: 14,
    elevation: 3,
    shadowColor: '#D98BA8',
    shadowOpacity: 0.1,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 3 },
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#C44575',
    marginBottom: 11,
  },

  input: {
    backgroundColor: '#FFF5F8',
    borderWidth: 1,
    borderColor: '#F4C4D5',
    borderRadius: 10,
    padding: 13,
    color: '#75485A',
    fontSize: 13,
  },

  label: {
    fontSize: 12,
    color: '#B65D7D',
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },

  categoryRow: {
    flexDirection: 'row',
    gap: 8,
  },

  categoryButton: {
    flex: 1,
    backgroundColor: '#FFF0F5',
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F5D2DF',
  },

  selectedCategory: {
    backgroundColor: '#E75480',
    borderColor: '#E75480',
  },

  categoryText: {
    color: '#BD6585',
    fontSize: 11,
    fontWeight: 'bold',
  },

  selectedCategoryText: {
    color: '#FFFFFF',
  },

  addButton: {
    backgroundColor: '#E75480',
    padding: 13,
    borderRadius: 11,
    alignItems: 'center',
    marginTop: 14,
    elevation: 3,
    shadowColor: '#E75480',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },

  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },

  cancelText: {
    color: '#C44575',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: 'bold',
    fontSize: 12,
  },

  savingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },

  savingText: {
    color: '#C44575',
    fontSize: 11,
  },

  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },

  taskCount: {
    fontSize: 11,
    color: '#B77B91',
  },

  listContent: {
    paddingBottom: 12,
  },

  taskCard: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 15,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#F9DCE6',
    elevation: 2,
    shadowColor: '#D98BA8',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },

  taskTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  taskInfo: {
    flex: 1,
    paddingRight: 8,
  },

  taskTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#70475A',
  },

  completedTask: {
    textDecorationLine: 'line-through',
    color: '#B9A1AB',
  },

  taskCategory: {
    color: '#C17A96',
    fontSize: 11,
    marginTop: 6,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  pendingBadge: {
    backgroundColor: '#FFF0D9',
  },

  completedBadge: {
    backgroundColor: '#E5F5E9',
  },

  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },

  pendingStatus: {
    color: '#D18A38',
  },

  completedStatus: {
    color: '#479A61',
  },

  actionRow: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 14,
  },

  completeButton: {
    flex: 1.3,
    backgroundColor: '#E75480',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },

  editButton: {
    flex: 1,
    backgroundColor: '#E8A1BA',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },

  deleteButton: {
    flex: 1,
    backgroundColor: '#D96A7D',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },

  actionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },

  emptyContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 25,
    borderRadius: 15,
    marginTop: 8,
  },

  emptyIcon: {
    fontSize: 35,
  },

  emptyTitle: {
    color: '#C44575',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },

  emptyText: {
    color: '#A77A8B',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },

  footer: {
    color: '#C18A9F',
    textAlign: 'center',
    fontSize: 10,
    paddingVertical: 9,
  },
});
