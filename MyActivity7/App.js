
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

  // Save changes to AsyncStorage
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

  // Create a new task
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

  // Update a task's completion status
  const toggleTask = (id) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id
        ? { ...task, done: !task.done }
        : task
    );

    saveTasks(updatedTasks);
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

        <TouchableOpacity style={styles.button} onPress={addTask}>
          <Text style={styles.buttonText}>Add</Text>
        </TouchableOpacity>
      </View>

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

            {/* Mark a task as completed or pending */}
            <TouchableOpacity
              style={styles.button}
              onPress={() => toggleTask(item.id)}
            >
              <Text style={styles.buttonText}>
                {item.done ? 'Mark as Pending' : 'Complete Task'}
              </Text>
            </TouchableOpacity>
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
    marginBottom: 15,
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
  empty: {
    textAlign: 'center',
    color: '#777',
    marginTop: 30,
  },
});
