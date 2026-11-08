
import React, { useState, useEffect } from 'react';
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
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage key for the Campus Quest task collection
const STORAGE_KEY = 'campus_quest_tasks';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [category, setCategory] = useState('Assignment');
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Read saved tasks when the application first opens
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const savedTasks = await AsyncStorage.getItem(STORAGE_KEY);

        if (savedTasks !== null) {
          // Convert JSON text into a JavaScript array
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

  // Save the updated task array to device storage
  const saveTasks = async (updatedTasks) => {
    if (saving) return false;

    setSaving(true);

    try {
      // Convert the task array into JSON text
      const jsonValue = JSON.stringify(updatedTasks);

      // Store the JSON text locally on the device
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);

      // Update the screen after storage succeeds
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

  // Create a new school task
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

  // Update a task's completion status
  const toggleTask = async (id) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id
        ? { ...task, done: !task.done }
        : task
    );

    await saveTasks(updatedTasks);
  };

  // Select a task and display its information in the input
  const editTask = (task) => {
    setTaskTitle(task.title);
    setCategory(task.category || 'Assignment');
    setEditingId(task.id);
  };

  // Save changes to an existing task
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

  // Cancel the current editing process
  const cancelEdit = () => {
    setTaskTitle('');
    setCategory('Assignment');
    setEditingId(null);
    Keyboard.dismiss();
  };

  // Delete a selected task
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

  // Calculate task progress
  const completedCount = tasks.filter((task) => task.done).length;
  const pendingCount = tasks.length - completedCount;

  // Show loading screen while reading saved tasks
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6041A6" />
        <Text style={styles.loadingText}>Loading Campus Quest...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Application heading */}
      <Text style={styles.welcome}>WELCOME TO</Text>
      <Text style={styles.title}>Campus Quest 🎓</Text>
      <Text style={styles.subtitle}>
        Your Student Task Tracker
      </Text>

      {/* Display task statistics */}
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{tasks.length}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{pendingCount}</Text>
          <Text style={styles.summaryLabel}>Pending</Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{completedCount}</Text>
          <Text style={styles.summaryLabel}>Completed</Text>
        </View>
      </View>

      {/* Input field for creating or editing tasks */}
      <Text style={styles.sectionTitle}>
        {editingId ? 'Edit Your Task' : 'Add New Task'}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="What do you need to accomplish?"
        placeholderTextColor="#999"
        value={taskTitle}
        onChangeText={setTaskTitle}
        editable={!saving}
      />

      {/* Choose a task category */}
      <Text style={styles.label}>Task Category</Text>

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

      {/* Add or update the selected task */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={editingId ? updateTask : addTask}
        disabled={saving}
      >
        <Text style={styles.addButtonText}>
          {saving
            ? 'Saving...'
            : editingId
              ? 'Save Changes'
              : '+ Add New Task'}
        </Text>
      </TouchableOpacity>

      {editingId && (
        <TouchableOpacity
          onPress={cancelEdit}
          disabled={saving}
        >
          <Text style={styles.cancelText}>Cancel Editing</Text>
        </TouchableOpacity>
      )}

      {/* Display saving status */}
      {saving && (
        <View style={styles.savingContainer}>
          <ActivityIndicator size="small" color="#6041A6" />
          <Text style={styles.savingText}>Saving your changes...</Text>
        </View>
      )}

      {/* Task collection */}
      <Text style={styles.sectionTitle}>My School Tasks</Text>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyTitle}>No Tasks Yet</Text>
            <Text style={styles.emptyText}>
              Add your first school task to get started!
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text
              style={[
                styles.taskTitle,
                item.done && styles.completedTask,
              ]}
            >
              {item.title}
            </Text>

            <View style={styles.taskDetails}>
              <Text style={styles.categoryTag}>
                {item.category || 'Assignment'}
              </Text>

              <Text
                style={[
                  styles.status,
                  item.done ? styles.completedStatus : styles.pendingStatus,
                ]}
              >
                {item.done ? '✓ Completed' : '○ Pending'}
              </Text>
            </View>

            {/* Task management buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.completeButton}
                onPress={() => toggleTask(item.id)}
                disabled={saving}
              >
                <Text style={styles.actionText}>
                  {item.done ? 'Undo' : 'Complete'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.editButton}
                onPress={() => editTask(item)}
                disabled={saving}
              >
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteTask(item.id)}
                disabled={saving}
              >
                <Text style={styles.actionText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Application footer */}
      <Text style={styles.footer}>Campus Quest | Stay Organized!</Text>
    </View>
  );
}

// Application design and layout
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F0FF',
    paddingHorizontal: 18,
    paddingTop: 45,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F0FF',
  },
  loadingText: {
    color: '#6041A6',
    marginTop: 12,
    fontWeight: 'bold',
  },
  welcome: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#999',
    textAlign: 'center',
    letterSpacing: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6041A6',
    textAlign: 'center',
    marginTop: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginVertical: 12,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 14,
    marginBottom: 16,
    elevation: 3,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#6041A6',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#6041A6',
    marginBottom: 9,
    marginTop: 5,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 9,
    padding: 13,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E5DDF7',
  },
  label: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#6041A6',
    marginTop: 12,
    marginBottom: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 11,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedCategory: {
    backgroundColor: '#6041A6',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6041A6',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  addButton: {
    backgroundColor: '#6041A6',
    padding: 13,
    borderRadius: 9,
    alignItems: 'center',
    marginTop: 12,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  cancelText: {
    color: '#6041A6',
    textAlign: 'center',
    marginTop: 9,
    fontWeight: 'bold',
  },
  savingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  savingText: {
    color: '#6041A6',
    fontSize: 12,
  },
  listContent: {
    paddingBottom: 15,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginVertical: 7,
    elevation: 2,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  taskDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 9,
  },
  categoryTag: {
    color: '#6041A6',
    fontSize: 12,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  completedStatus: {
    color: '#39965A',
  },
  pendingStatus: {
    color: '#E69535',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 13,
  },
  completeButton: {
    flex: 1,
    backgroundColor: '#6041A6',
    padding: 10,
    borderRadius: 7,
    alignItems: 'center',
  },
  editButton: {
    flex: 1,
    backgroundColor: '#E69535',
    padding: 10,
    borderRadius: 7,
    alignItems: 'center',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#D9534F',
    padding: 10,
    borderRadius: 7,
    alignItems: 'center',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 25,
  },
  emptyIcon: {
    fontSize: 35,
  },
  emptyTitle: {
    color: '#6041A6',
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 8,
  },
  emptyText: {
    color: '#777',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 5,
  },
  footer: {
    color: '#999',
    textAlign: 'center',
    fontSize: 11,
    paddingVertical: 10,
  },
});
