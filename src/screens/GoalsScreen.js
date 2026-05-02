import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { COLORS } from '../utils/colors';
import useStore from '../store/useStore';
import { standardStyles } from '../utils/standardStyles';
import { formatCurrency } from '../utils/formatters';

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
    <View style={standardStyles.container}>
      <TouchableOpacity style={standardStyles.button} onPress={() => openModal()}>
        <Text style={standardStyles.buttonText}>Add Goal</Text>
      </TouchableOpacity>
      <FlatList
        data={goals}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={standardStyles.card} onPress={() => openModal(item)}>
            <Text style={[standardStyles.header, { fontSize: 16 }]}>{item.name}</Text>
            <Text style={standardStyles.label}>
              Target: {formatCurrency(item.target_amount)} | Current: {formatCurrency(item.current_amount)}
            </Text>
            <Text style={standardStyles.label}>Deadline: {item.deadline}</Text>
            <TouchableOpacity style={[standardStyles.button, { backgroundColor: COLORS.expense }]} onPress={() => removeGoal(item.id)}>
              <Text style={standardStyles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
      <Modal visible={modalVisible} animationType="slide">
        <View style={standardStyles.container}>
          <TextInput style={standardStyles.input} placeholder="Name" value={form.name} onChangeText={text => setForm({ ...form, name: text })} />
          <TextInput style={standardStyles.input} placeholder="Target Amount" value={form.target_amount} onChangeText={text => setForm({ ...form, target_amount: text })} keyboardType="numeric" />
          <TextInput style={standardStyles.input} placeholder="Current Amount" value={form.current_amount} onChangeText={text => setForm({ ...form, current_amount: text })} keyboardType="numeric" />
          <TextInput style={standardStyles.input} placeholder="Deadline (YYYY-MM-DD)" value={form.deadline} onChangeText={text => setForm({ ...form, deadline: text })} />
          <TouchableOpacity style={standardStyles.button} onPress={handleSave}>
            <Text style={standardStyles.buttonText}>{editing ? 'Update' : 'Save'} Goal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={standardStyles.button} onPress={() => setModalVisible(false)}>
            <Text style={standardStyles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}
