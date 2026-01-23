import React, { useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function HomeScreen({ navigation }: any) {
  useEffect(() => {
    console.log('HomeScreen montado');
    return () => {
      console.log('HomeScreen desmontado');
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo ao Meu Primeiro App!</Text>
      <Button
        title="Ir para Detalhes"
        onPress={() => navigation.navigate('Details')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});
