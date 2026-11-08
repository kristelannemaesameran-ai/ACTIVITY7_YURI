
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
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'campus_quest_tasks';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [category, setCategory] = useState('Assignment');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load saved tasks when the app starts
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const savedTasks = await AsyncStorage.getItem(STORAGE_KEY);

        if (savedTasks !== null) {
          setTasks(JSON.parse(savedTasks));
        }
      } catch (error) {
        console.log('Error loading tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  // Save the latest task list
  const saveTasks = async (updatedTasks) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedTasks)
      );

      setTasks(updatedTasks);
    } catch (error) {
      Alert.alert('Error', 'Unable to save your task.');
    }
  };

  // Create a new school task
  const addTask = () => {
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

    saveTasks([...tasks, newTask]);
    setTaskTitle('');
  };

  // Update the task completion status
  const toggleTask = (id) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, done: !task.done } : task
    );

    saveTasks(updatedTasks);
  };

  // Select a task to edit
  const editTask = (task) => {
    setTaskTitle(task.title);
    setCategory(task.category || 'Assignment');
    setEditingId(task.id);
  };

  // Save edited task information
  const updateTask = () => {
    if (!taskTitle.trim()) {
      Alert.alert('Required', 'Please enter a task title.');
      return;
    }

    const updatedTasks = tasks.map((task) =>
      task.id === editingId
        ? { ...task, title: taskTitle.trim(), category }
        : task
    );

    saveTasks(updatedTasks);
    setTaskTitle('');
    setCategory('Assignment');
    setEditingId(null);
  };

  // Cancel task editing
  const cancelEdit = () => {
    setTaskTitle('');
    setCategory('Assignment');
    setEditingId(null);
  };

  // Remove a task permanently from the saved list
  const deleteTask = (id) => {
    Alert.alert('Delete Task', 'Remove this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          saveTasks(tasks.filter((task) => task.id !== id));
        },
      },
    ]);
  };

  const completedCount = tasks.filter((task) => task.done).length;
  const pendingCount = tasks.length - completedCount;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6041A6" />
        <Text>Loading your tasks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Campus Quest 🎓</Text>
      <Text style={styles.subtitle}>Your Student Task Tracker</Text>

      {/* Task summary */}
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

      <TextInput
        style={styles.input}
        placeholder="Enter a school task..."
        value={taskTitle}
        onChangeText={setTaskTitle}
      />

      {/* Select a task category */}
      <Text style={styles.label}>Choose Category</Text>

      <View style={styles.categoryRow}>
        {['Assignment', 'Exam', 'Project'].map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.categoryButton,
              category === item && styles.selectedCategory,
            ]}
            onPress={() => setCategory(item)}
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

      <TouchableOpacity
        style={styles.addButton}
        onPress={editingId ? updateTask : addTask}
      >
        <Text style={styles.buttonText}>
          {editingId ? 'Save Changes' : '+ Add New Task'}
        </Text>
      </TouchableOpacity>

      {editingId && (
        <TouchableOpacity onPress={cancelEdit}>
          <Text style={styles.cancelText}>Cancel Editing</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.sectionTitle}>My School Tasks</Text>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.empty}>No tasks yet. Add your first task!</Text>
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

            <Text style={styles.categoryTag}>
              {item.category || 'Assignment'}
            </Text>

            <Text style={styles.taskStatus}>
              {item.done ? '✓ Completed' : '○ Pending'}
            </Text>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.completeButton}
                onPress={() => toggleTask(item.id)}
              >
                <Text style={styles.buttonText}>
                  {item.done ? 'Undo' : 'Complete'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.editButton}
                onPress={() => editTask(item)}
              >
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteTask(item.id)}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F0FF',
    padding: 18,
    paddingTop: 55,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F0FF',
    gap: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6041A6',
    textAlign: 'center',
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
    borderRadius: 12,
    marginBottom: 15,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6041A6',
  },
  summaryLabel: {
    color: '#777',
    fontSize: 12,
    marginTop: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 9,
    padding: 13,
    fontSize: 15,
  },
  label: {
    color: '#6041A6',
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
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  selectedCategory: {
    backgroundColor: '#6041A6',
  },
  categoryText: {
    color: '#6041A6',
    fontWeight: 'bold',
    fontSize: 12,
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
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  cancelText: {
    color: '#6041A6',
    textAlign: 'center',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#6041A6',
    marginTop: 18,
    marginBottom: 5,
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
  categoryTag: {
    color: '#6041A6',
    fontSize: 12,
    marginTop: 6,
  },
  taskStatus: {
    color: '#777',
    marginTop: 6,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 8,
  },
  completeButton: {
    backgroundColor: '#6041A6',
    padding: 10,
    borderRadius: 7,
  },
  editButton: {
    backgroundColor: '#E69535',
    padding: 10,
    borderRadius: 7,
  },
  deleteButton: {
    backgroundColor: '#D9534F',
    padding: 10,
    borderRadius: 7,
  },
  empty: {
    textAlign: 'center',
    color: '#777',
    marginTop: 25,
  },
});
