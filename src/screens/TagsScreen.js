import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { COLORS } from '../utils/colors';
import useStore from '../store/useStore';
import { standardStyles } from '../utils/standardStyles';

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
    <View style={standardStyles.container}>
      <TouchableOpacity style={standardStyles.button} onPress={() => setModalVisible(true)}>
        <Text style={standardStyles.buttonText}>Add Tag</Text>
      </TouchableOpacity>
      <FlatList
        data={tags}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={standardStyles.card}>
            <Text style={[standardStyles.header, { fontSize: 16 }]}>{item.name}</Text>
            <TouchableOpacity style={[standardStyles.button, { backgroundColor: COLORS.expense }]} onPress={() => removeTag(item.id)}>
              <Text style={standardStyles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <Modal visible={modalVisible} animationType="slide">
        <View style={standardStyles.container}>
          <TextInput style={standardStyles.input} placeholder="Tag Name" value={tagName} onChangeText={setTagName} />
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
