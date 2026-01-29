import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const [isPressed, setIsPressed] = useState<string | null>(null);

  useEffect(() => {
    console.log('HomeScreen montado');
    return () => {
      console.log('HomeScreen desmontado');
    };
  }, []);

  const handlePressIn = (id: string) => {
    setIsPressed(id);
  };

  const handlePressOut = () => {
    setIsPressed(null);
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Image
          source={require('../../assets/logopaulo.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>Bem-vindo!</Text>
        <Text style={styles.subtitle}>Gerencie seus cadastros de forma prática</Text>
      </View>

      {/* Buttons Section */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.buttonRegister,
            isPressed === 'register' && styles.buttonPressed,
          ]}
          onPress={() => navigation.navigate('Register')}
          onPressIn={() => handlePressIn('register')}
          onPressOut={handlePressOut}
          activeOpacity={0.8}
        >
          <View style={styles.buttonIconWrapper}>
            <Text style={styles.buttonIcon}>📝</Text>
          </View>
          <Text style={styles.buttonTitle}>Cadastro de Usuários</Text>
          <Text style={styles.buttonSubtitle}>Criar novo cadastro</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.buttonList,
            isPressed === 'list' && styles.buttonPressed,
          ]}
          onPress={() => navigation.navigate('List')}
          onPressIn={() => handlePressIn('list')}
          onPressOut={handlePressOut}
          activeOpacity={0.8}
        >
          <View style={styles.buttonIconWrapper}>
            <Text style={styles.buttonIcon}>👥</Text>
          </View>
          <Text style={styles.buttonTitle}>Ver Cadastrados</Text>
          <Text style={styles.buttonSubtitle}>Lista de usuários</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.buttonLogin,
            isPressed === 'login' && styles.buttonPressed,
          ]}
          onPress={() => navigation.navigate('Login')}
          onPressIn={() => handlePressIn('login')}
          onPressOut={handlePressOut}
          activeOpacity={0.8}
        >
          <View style={styles.buttonIconWrapper}>
            <Text style={styles.buttonIcon}>🔐</Text>
          </View>
          <Text style={styles.buttonTitle}>Fazer Login</Text>
          <Text style={styles.buttonSubtitle}>Acessar sua conta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingVertical: 40,
    justifyContent: 'space-between',
  },
  headerSection: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 60,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '400',
  },
  buttonsContainer: {
    gap: 14,
    marginBottom: 40,
  },
  button: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
    minHeight: 120,
  },
  buttonRegister: {
    backgroundColor: '#10B981',
  },
  buttonList: {
    backgroundColor: '#3B82F6',
  },
  buttonLogin: {
    backgroundColor: '#8B5CF6',
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  buttonIconWrapper: {
    marginBottom: 8,
  },
  buttonIcon: {
    fontSize: 32,
  },
  buttonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },
  buttonSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    fontWeight: '400',
  },
});
