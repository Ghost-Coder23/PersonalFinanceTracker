import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, Modal, Button, Alert } from 'react-native';
import { COLORS } from '../utils/colors';
import useStore from '../store/useStore';

export default function RecurringTransactionsScreen() {
  const { recurringTransactions, loadRecurringTransactions, addRecurringTransaction, removeRecurringTransaction } = useStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ type: 'expense', amount: '', category: '', description: '', start_date: '', frequency: '', customer_id: null });

  useEffect(() => {
    loadRecurringTransactions();
  }, [loadRecurringTransactions]);

  const handleSave = async () => {
    if (!form.amount || !form.category || !form.start_date || !form.frequency) {
      Alert.alert('Validation', 'Please fill all required fields.');
      return;
    }
    await addRecurringTransaction(form);
    setModalVisible(false);
    setForm({ type: 'expense', amount: '', category: '', description: '', start_date: '', frequency: '', customer_id: null });
    Alert.alert('Success', 'Recurring transaction saved!');
  };

  return (
    <View style={styles.container}>
      <Button title="Add Recurring" onPress={() => setModalVisible(true)} />
      <FlatList
        data={recurringTransactions}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.name}>{item.category} ({item.type})</Text>
            <Text style={styles.details}>${item.amount} | {item.frequency} | {item.start_date}</Text>
            <Text style={styles.details}>{item.description}</Text>
            <Button title="Delete" color={COLORS.expense} onPress={() => removeRecurringTransaction(item.id)} />
          </View>
        )}
      />
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContent}>
          <TextInput style={styles.input} placeholder="Type (income/expense)" value={form.type} onChangeText={text => setForm({ ...form, type: text })} />
          <TextInput style={styles.input} placeholder="Amount" value={form.amount} onChangeText={text => setForm({ ...form, amount: text })} keyboardType="numeric" />
          <TextInput style={styles.input} placeholder="Category" value={form.category} onChangeText={text => setForm({ ...form, category: text })} />
          <TextInput style={styles.input} placeholder="Description" value={form.description} onChangeText={text => setForm({ ...form, description: text })} />
          <TextInput style={styles.input} placeholder="Start Date (YYYY-MM-DD)" value={form.start_date} onChangeText={text => setForm({ ...form, start_date: text })} />
          <TextInput style={styles.input} placeholder="Frequency (e.g., monthly)" value={form.frequency} onChangeText={text => setForm({ ...form, frequency: text })} />
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
