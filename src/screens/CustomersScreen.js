import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, Modal, Button } from 'react-native';
import { COLORS } from '../utils/colors';
import useStore, { useLoadCustomers } from '../store/useStore';

export default function CustomersScreen() {
  const { customers, addCustomer, updateCustomer, removeCustomer } = useStore();
  const loadCustomers = useLoadCustomers();
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' });

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const openModal = (customer) => {
    setEditing(customer?.id || null);
    setForm(customer || { name: '', email: '', phone: '', notes: '' });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (editing) {
      await updateCustomer(editing, form);
    } else {
      await addCustomer(form);
    }
    setModalVisible(false);
    setEditing(null);
    setForm({ name: '', email: '', phone: '', notes: '' });
  };

  return (
    <View style={styles.container}>
      <Button title="Add Customer" onPress={() => openModal()} />
      <FlatList
        data={customers}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => openModal(item)}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.details}>{item.email} | {item.phone}</Text>
            <Text style={styles.details}>{item.notes}</Text>
            <Button title="Delete" color={COLORS.expense} onPress={() => removeCustomer(item.id)} />
          </TouchableOpacity>
        )}
      />
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContent}>
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={form.name}
            onChangeText={text => setForm({ ...form, name: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={form.email}
            onChangeText={text => setForm({ ...form, email: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone"
            value={form.phone}
            onChangeText={text => setForm({ ...form, phone: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Notes"
            value={form.notes}
            onChangeText={text => setForm({ ...form, notes: text })}
          />
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
