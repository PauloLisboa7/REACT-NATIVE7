import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type User = {
  id: string;
  name: string;
  email: string;
  idade: string;
  phone: string;
};

export default function ListScreen() {
  const [users, setUsers] = useState<User[]>([]);

  // READ carregar do AsyncStorage ao focar
  useFocusEffect(
    useCallback(() => {
      const loadUsers = async () => {
        try {
          const storedUsers = await AsyncStorage.getItem('Users');
          setUsers(storedUsers ? JSON.parse(storedUsers) : []);
        } catch (error) {
          console.log('Usuários erro ao carregar usuários', error);
        }
      };
      loadUsers();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Usuários</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.userContainer}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userEmail}>{item.email}</Text>
            <Text style={styles.userPhone}>{item.phone}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  userContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  userPhone: {
    fontSize: 14,
    color: '#999',
  },
});
