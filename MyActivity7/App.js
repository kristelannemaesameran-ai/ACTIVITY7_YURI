
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
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Read saved tasks from the device
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

  // Save updated task data
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

  // Create a task
  const addTask = () => {
    if (!taskTitle.trim()) {
      Alert.alert('Required', 'Please enter a task title.');
      return;
    }

    const newTask = {
      id: Date.now().toString(),
      title: taskTitle.trim(),
      done: false,
    };

    saveTasks([...tasks, newTask]);
    setTaskTitle('');
  };

  // Update completion status
  const toggleTask = (id) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, done: !task.done } : task
    );

    saveTasks(updatedTasks);
  };

  // Select a task for editing
  const editTask = (task) => {
    setTaskTitle(task.title);
    setEditingId(task.id);
  };

  // Save the edited title
  const updateTask = () => {
    if (!taskTitle.trim()) {
      Alert.alert('Required', 'Please enter a task title.');
      return;
    }

    const updatedTasks = tasks.map((task) =>
      task.id === editingId
        ? { ...task, title: taskTitle.trim() }
        : task
    );

    saveTasks(updatedTasks);
    setTaskTitle('');
    setEditingId(null);
  };

  // Cancel editing
  const cancelEdit = () => {
    setTaskTitle('');
    setEditingId(null);
  };

  // Delete a task from the list and storage
  const deleteTask = (id) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedTasks = tasks.filter(
              (task) => task.id !== id
            );

            saveTasks(updatedTasks);
          },
        },
      ]
    );
  };

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
      <Text style={styles.subtitle}>Organize Your School Tasks</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter a school task..."
          value={taskTitle}
          onChangeText={setTaskTitle}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={editingId ? updateTask : addTask}
        >
          <Text style={styles.buttonText}>
            {editingId ? 'Update' : 'Add'}
          </Text>
        </TouchableOpacity>
      </View>

      {editingId && (
        <TouchableOpacity onPress={cancelEdit}>
          <Text style={styles.cancelText}>Cancel Editing</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
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

            <Text style={styles.taskStatus}>
              {item.done ? 'Completed' : 'Pending'}
            </Text>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => toggleTask(item.id)}
              >
                <Text style={styles.buttonText}>
                  {item.done ? 'Mark Pending' : 'Complete'}
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
    padding: 20,
    paddingTop: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F0FF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6041A6',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#777',
    textAlign: 'center',
    marginVertical: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
  },
  button: {
    backgroundColor: '#6041A6',
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 10,
  },
  editButton: {
    backgroundColor: '#E69535',
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 10,
  },
  deleteButton: {
    backgroundColor: '#D9534F',
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 12,
    marginVertical: 7,
    elevation: 2,
  },
  taskTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  taskStatus: {
    color: '#E69535',
    marginTop: 8,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cancelText: {
    color: '#6041A6',
    textAlign: 'center',
    marginBottom: 10,
  },
  empty: {
    textAlign: 'center',
    color: '#777',
    marginTop: 30,
  },
});
