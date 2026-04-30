import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, Modal, Button, Alert } from 'react-native';
import { COLORS } from '../utils/colors';
import useStore from '../store/useStore';

export default function TagsScreen() {
  const { tags, loadTags, addTag, removeTag } = useStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [tagName, setTagName] = useState('');

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  const handleSave = async () => {
    if (!tagName) {
      Alert.alert('Validation', 'Tag name required.');
      return;
    }
    await addTag(tagName);
    setModalVisible(false);
    setTagName('');
    Alert.alert('Success', 'Tag saved!');
  };

  return (
    <View style={styles.container}>
      <Button title="Add Tag" onPress={() => setModalVisible(true)} />
      <FlatList
        data={tags}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.name}>{item.name}</Text>
            <Button title="Delete" color={COLORS.expense} onPress={() => removeTag(item.id)} />
          </View>
        )}
      />
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContent}>
          <TextInput style={styles.input} placeholder="Tag Name" value={tagName} onChangeText={setTagName} />
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
  modalContent: { flex: 1, justifyContent: 'center', padding: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginBottom: 12 },
});
