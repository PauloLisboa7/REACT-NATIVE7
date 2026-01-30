import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	TextInput,
	StyleSheet,
	TouchableOpacity,
	Alert,
	ActivityIndicator,
	SafeAreaView,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
	BackHandler,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';

export default function LoginScreen({ navigation }: any) {
	const [email, setEmail] = useState('');
	const [senha, setSenha] = useState('');
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
			navigation.popToTop();
			return true;
		});

		return () => backHandler.remove();
	}, [navigation]);

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
		<SafeAreaView style={styles.safeArea}>
			<KeyboardAvoidingView 
				style={styles.container}
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
			>
				<ScrollView 
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.scrollContent}
				>
					<View style={styles.headerContainer}>
						<MaterialCommunityIcons name="lock" size={56} color="#6366F1" />
						<Text style={styles.title}>Login</Text>
						<Text style={styles.subtitle}>Acesse sua conta</Text>
					</View>

					<View style={styles.formContainer}>
						<View style={styles.inputGroup}>
							<Text style={styles.label}>Email</Text>
							<TextInput
								style={styles.input}
								placeholder="seu@email.com"
								placeholderTextColor="#9CA3AF"
								keyboardType="email-address"
								autoCapitalize="none"
								value={email}
								onChangeText={setEmail}
							/>
						</View>

						<View style={styles.inputGroup}>
							<Text style={styles.label}>Senha</Text>
							<TextInput
								style={styles.input}
								placeholder="••••••••"
								placeholderTextColor="#9CA3AF"
								secureTextEntry
								value={senha}
								onChangeText={setSenha}
							/>
						</View>

						<TouchableOpacity
							style={[styles.button, loading && styles.buttonDisabled]}
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

					<View style={styles.footer}>
						<Text style={styles.footerText}>Não tem conta?</Text>
						<TouchableOpacity onPress={() => navigation.navigate('Register')}>
							<Text style={styles.registerLink}>Cadastre-se aqui</Text>
						</TouchableOpacity>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#F9FAFB',
	},
	container: {
		flex: 1,
		backgroundColor: '#F9FAFB',
	},
	scrollContent: {
		flexGrow: 1,
		justifyContent: 'center',
		paddingHorizontal: 20,
		paddingVertical: 40,
	},
	headerContainer: {
		alignItems: 'center',
		marginBottom: 40,
	},
	title: {
		fontSize: 32,
		fontWeight: '700',
		color: '#1F2937',
		marginBottom: 8,
		textAlign: 'center',
	},
	subtitle: {
		fontSize: 16,
		color: '#6B7280',
		textAlign: 'center',
		fontWeight: '400',
	},
	formContainer: {
		marginBottom: 32,
		gap: 16,
	},
	inputGroup: {
		marginBottom: 4,
	},
	label: {
		fontSize: 14,
		fontWeight: '600',
		marginBottom: 8,
		color: '#1F2937',
		letterSpacing: 0.3,
	},
	input: {
		borderWidth: 1.5,
		borderColor: '#E5E7EB',
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 14,
		fontSize: 16,
		backgroundColor: '#FFFFFF',
		color: '#1F2937',
		fontWeight: '500',
	},
	button: {
		backgroundColor: '#6366F1',
		borderRadius: 12,
		paddingVertical: 16,
		paddingHorizontal: 20,
		alignItems: 'center',
		marginTop: 12,
		shadowColor: '#6366F1',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 4,
	},
	buttonDisabled: {
		backgroundColor: '#C4B5FD',
		shadowOpacity: 0.1,
	},
	buttonText: {
		color: '#FFFFFF',
		fontSize: 16,
		fontWeight: '700',
		letterSpacing: 0.5,
	},
	footer: {
		alignItems: 'center',
		gap: 4,
	},
	footerText: {
		fontSize: 14,
		color: '#6B7280',
		fontWeight: '400',
	},
	registerLink: {
		fontSize: 14,
		color: '#6366F1',
		fontWeight: '700',
		letterSpacing: 0.3,
	},
});

