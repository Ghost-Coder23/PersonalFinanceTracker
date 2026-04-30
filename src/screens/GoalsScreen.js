import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, Modal, Button, Alert } from 'react-native';
import { COLORS } from '../utils/colors';
import useStore from '../store/useStore';

export default function GoalsScreen() {
  const { goals, loadGoals, addGoal, updateGoal, removeGoal } = useStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', target_amount: '', current_amount: '', deadline: '' });

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const openModal = (goal) => {
    setEditing(goal?.id || null);
    setForm(goal || { name: '', target_amount: '', current_amount: '', deadline: '' });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.target_amount) {
      Alert.alert('Validation', 'Name and target amount required.');
      return;
    }
    if (editing) {
      await updateGoal(editing, form);
    } else {
      await addGoal(form);
    }
    setModalVisible(false);
    setEditing(null);
    setForm({ name: '', target_amount: '', current_amount: '', deadline: '' });
    Alert.alert('Success', 'Goal saved!');
  };

  return (
    <View style={styles.container}>
      <Button title="Add Goal" onPress={() => openModal()} />
      <FlatList
        data={goals}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => openModal(item)}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.details}>Target: ${item.target_amount} | Current: ${item.current_amount}</Text>
            <Text style={styles.details}>Deadline: {item.deadline}</Text>
            <Button title="Delete" color={COLORS.expense} onPress={() => removeGoal(item.id)} />
          </TouchableOpacity>
        )}
      />
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContent}>
          <TextInput style={styles.input} placeholder="Name" value={form.name} onChangeText={text => setForm({ ...form, name: text })} />
          <TextInput style={styles.input} placeholder="Target Amount" value={form.target_amount} onChangeText={text => setForm({ ...form, target_amount: text })} keyboardType="numeric" />
          <TextInput style={styles.input} placeholder="Current Amount" value={form.current_amount} onChangeText={text => setForm({ ...form, current_amount: text })} keyboardType="numeric" />
          <TextInput style={styles.input} placeholder="Deadline (YYYY-MM-DD)" value={form.deadline} onChangeText={text => setForm({ ...form, deadline: text })} />
          <Button title="Save" onPress={handleSave} />
          <Button title="Cancel" color={COLORS.expense} onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  item: { padding: 16, borderBottomWidth: 1, borderColor: '#eee' },
  name: { fontWeight: 'bold', fontSize: 16 },
  details: { color: COLORS.textSecondary },
  modalContent: { flex: 1, justifyContent: 'center', padding: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginBottom: 12 },
});
