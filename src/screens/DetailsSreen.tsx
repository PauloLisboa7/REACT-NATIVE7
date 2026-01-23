import React, { useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function DetailsScreen({ navigation }: any) {
  useEffect(() => {
    console.log('DetailsScreen montado');
    return () => {
      console.log('DetailsScreen desmontado');
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tela de Detalhes</Text>
      <Text style={styles.text}>
        Esta é a tela de detalhes do aplicativo.
      </Text>
      <Button title="Voltar para Início" onPress={() => navigation.navigate('Home')} />
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
});
