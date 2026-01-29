import React, { useState } from 'react';
import {
	View,
	Text,
	TextInput,
	StyleSheet,
	TouchableOpacity,
	Alert,
	ActivityIndicator,
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';

export default function LoginScreen({ navigation }: any) {
	const [email, setEmail] = useState('');
	const [senha, setSenha] = useState('');
	const [loading, setLoading] = useState(false);

	const handleLogin = async () => {
		if (!email || !senha) {
			Alert.alert('Erro', 'Por favor, preencha todos os campos');
			return;
		}

		setLoading(true);

		try {
			const userCredential = await signInWithEmailAndPassword(auth, email, senha);
			const user = userCredential.user;
			// Login bem-sucedido: navegar para a tela Details (ajuste se necessário)
			navigation.navigate('Details');
		} catch (error: any) {
			let message = 'Erro ao efetuar login';
			if (error && error.code) {
				switch (error.code) {
					case 'auth/invalid-email':
						message = 'Email inválido';
						break;
					case 'auth/user-not-found':
						message = 'Usuário não encontrado';
						break;
					case 'auth/wrong-password':
						message = 'Senha incorreta';
						break;
					case 'auth/too-many-requests':
						message = 'Muitas tentativas. Tente mais tarde.';
						break;
					default:
						message = error.message || message;
				}
			} else if (error && error.message) {
				message = error.message;
			}

			Alert.alert('Erro no Login', message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Tela de Login</Text>

			<TextInput
				style={styles.input}
				placeholder="Email"
				placeholderTextColor="#999"
				keyboardType="email-address"
				autoCapitalize="none"
				value={email}
				onChangeText={setEmail}
			/>

			<TextInput
				style={styles.input}
				placeholder="Senha"
				placeholderTextColor="#999"
				secureTextEntry
				value={senha}
				onChangeText={setSenha}
			/>

			<TouchableOpacity
				style={[styles.button, loading ? styles.buttonDisabled : null]}
				onPress={handleLogin}
				disabled={loading}
			>
				{loading ? (
					<ActivityIndicator color="#fff" />
				) : (
					<Text style={styles.buttonText}>Entrar</Text>
				)}
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
		backgroundColor: '#fff',
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 24,
	},
	input: {
		width: '100%',
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 12,
		fontSize: 16,
		backgroundColor: '#f9f9f9',
		marginBottom: 12,
	},
	button: {
		width: '100%',
		backgroundColor: '#4CAF50',
		padding: 14,
		borderRadius: 8,
		alignItems: 'center',
		marginTop: 8,
	},
	buttonDisabled: {
		opacity: 0.7,
	},
	buttonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
	},
});

