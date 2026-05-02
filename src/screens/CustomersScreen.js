import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Modal } from 'react-native';
import { COLORS } from '../utils/colors';
import useStore, { useLoadCustomers } from '../store/useStore';
import { standardStyles } from '../utils/standardStyles';

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
    <View style={standardStyles.container}>
      <TouchableOpacity style={standardStyles.button} onPress={() => openModal()}>
        <Text style={standardStyles.buttonText}>Add Customer</Text>
      </TouchableOpacity>
      <FlatList
        data={customers}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={standardStyles.card} onPress={() => openModal(item)}>
            <Text style={[standardStyles.header, { fontSize: 16 }]}>{item.name}</Text>
            <Text style={standardStyles.label}>{item.email} | {item.phone}</Text>
            <Text style={standardStyles.label}>{item.notes}</Text>
            <TouchableOpacity style={[standardStyles.button, { backgroundColor: COLORS.expense }]} onPress={() => removeCustomer(item.id)}>
              <Text style={standardStyles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
      <Modal visible={modalVisible} animationType="slide">
        <View style={standardStyles.container}>
          <TextInput style={standardStyles.input} placeholder="Name" value={form.name} onChangeText={text => setForm({ ...form, name: text })} />
          <TextInput style={standardStyles.input} placeholder="Email" value={form.email} onChangeText={text => setForm({ ...form, email: text })} />
          <TextInput style={standardStyles.input} placeholder="Phone" value={form.phone} onChangeText={text => setForm({ ...form, phone: text })} />
          <TextInput style={standardStyles.input} placeholder="Notes" value={form.notes} onChangeText={text => setForm({ ...form, notes: text })} />
          <TouchableOpacity style={standardStyles.button} onPress={handleSave}>
            <Text style={standardStyles.buttonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[standardStyles.button, { backgroundColor: COLORS.expense }]} onPress={() => setModalVisible(false)}>
            <Text style={standardStyles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}
