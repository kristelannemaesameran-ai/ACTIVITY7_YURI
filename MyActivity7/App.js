
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Main Campus Quest application
export default function App() {
  return (
    <View style={styles.container}>
      {/* Application heading */}
      <Text style={styles.title}>Campus Quest 🎓</Text>
      <Text style={styles.subtitle}>Your Student Task Tracker</Text>

      {/* Sample school task */}
      <View style={styles.card}>
        <Text style={styles.taskTitle}>Complete React Native Activity</Text>
        <Text style={styles.taskStatus}>Pending</Text>
      </View>
    </View>
  );
}

// Application styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F0FF',
    padding: 20,
    justifyContent: 'center',
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
  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  taskStatus: {
    color: '#E69535',
    marginTop: 8,
  },
});
