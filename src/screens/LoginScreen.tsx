import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	TextInput,
	StyleSheet,
	TouchableOpacity,
	Alert,
	ActivityIndicator,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
	BackHandler,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useFormValidation, useBiometric } from '../hooks';
import { messages } from '../config/constants';

export default function LoginScreen({ navigation }: any) {
	const { login } = useAuth();
	const { colors } = useTheme();
	const { t } = useLanguage();
	const { validateEmail, validatePassword, clearAllErrors, getError } = useFormValidation();
	const { biometricAvailable, biometryType, authenticate } = useBiometric();
	
	const [email, setEmail] = useState('');
	const [senha, setSenha] = useState('');
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [isEmailValid, setIsEmailValid] = useState(false);
	const [usuarioBiometriaSalvo, setUsuarioBiometriaSalvo] = useState<string | null>(null);

	// Padrão para validar email com domínio completo
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	useEffect(() => {
		const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
			navigation.popToTop();
			return true;
		});

		carregarUsuarioBiometria();

		return () => backHandler.remove();
	}, [navigation]);

	const carregarUsuarioBiometria = async () => {
		try {
			const emailSalvo = await AsyncStorage.getItem('biometryUser');
			setUsuarioBiometriaSalvo(emailSalvo);
		} catch (erro) {
			console.error('Erro ao carregar usuário biométrico:', erro);
		}
	};

	const handleLogin = async () => {
		clearAllErrors();

		// Validações
		if (!validateEmail(email) || !validatePassword(senha)) {
			return;
		}

		setLoading(true);

		try {
			await login(email, senha);
			Alert.alert(t('common.success'), t('screens.login.signIn'));
			navigation.navigate('Details');
		} catch (error: any) {
			const message = error.message || t('screens.login.loginError');
			Alert.alert(t('common.error'), message);
		} finally {
			setLoading(false);
		}
	};

	const handleBiometricLogin = async () => {
		if (!usuarioBiometriaSalvo) {
			Alert.alert(t('common.warning'), t('screens.login.noBiometricUser'));
			return;
		}

		const authenticated = await authenticate();
		
		if (authenticated) {
			try {
				setLoading(true);
				// Buscar a senha salva do AsyncStorage (nota: em produção, usar Keychain/Keystore seguro)
				const senhaSalva = await AsyncStorage.getItem(`biometry_password_${usuarioBiometriaSalvo}`);
				
				if (!senhaSalva) {
					Alert.alert(t('common.error'), t('screens.login.biometricCredentialsNotFound'));
					return;
				}

				await login(usuarioBiometriaSalvo, senhaSalva);
				Alert.alert(t('common.success'), t('screens.login.signIn'));
				navigation.navigate('Details');
			} catch (error: any) {
				Alert.alert(t('common.error'), error.message || t('screens.login.loginError'));
			} finally {
				setLoading(false);
			}
		}
	};

	const handleForgotPassword = () => {
		navigation.navigate('ForgotPassword');
	};

	const styles = createStyles(colors);

	return (
		<SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
			<KeyboardAvoidingView 
				style={[styles.container, { backgroundColor: colors.background }]}
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
			>
				<ScrollView 
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.scrollContent}
				>
					<View style={styles.headerContainer}>
						<MaterialCommunityIcons name="lock" size={56} color={colors.primary} />
						<Text style={[styles.title, { color: colors.text }]}>{t('screens.login.title')}</Text>
						<Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('screens.login.signIn')}</Text>
					</View>

					<View style={styles.formContainer}>
						<View style={styles.inputGroup}>
							<Text style={[styles.label, { color: colors.text }]}>{t('screens.login.email')}</Text>
							<View style={[styles.inputWrapper, { borderColor: getError('email') ? colors.danger : colors.border, backgroundColor: colors.surface }]}>
								<TextInput
									style={[styles.input, { color: colors.text }]}
									placeholder="seu@email.com"
									placeholderTextColor={colors.textSecondary}
									keyboardType="email-address"
									autoCapitalize="none"
									value={email}
									onChangeText={(text) => {
										setEmail(text);
										// Valida apenas se tiver @ e . (domínio completo)
										setIsEmailValid(emailRegex.test(text));
									}}
								/>
								{isEmailValid && !getError('email') && (
									<MaterialCommunityIcons name="check-circle" size={20} color={colors.success} style={styles.inputIcon} />
								)}
							</View>
							{getError('email') && (
								<Text style={[styles.errorText, { color: colors.danger }]}>{getError('email')}</Text>
							)}
						</View>

						<View style={styles.inputGroup}>
							<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
								<Text style={[styles.label, { color: colors.text }]}>{t('screens.login.password')}</Text>
								<TouchableOpacity onPress={handleForgotPassword}>
									<Text style={[styles.forgotPasswordLink, { color: colors.primary }]}>{t('screens.login.forgotPassword')}</Text>
								</TouchableOpacity>
							</View>
							<View style={[styles.inputWrapper, { borderColor: getError('password') ? colors.danger : colors.border, backgroundColor: colors.surface }]}>
								<TextInput
									style={[styles.input, { color: colors.text }]}
									placeholder="••••••••"
									placeholderTextColor={colors.textSecondary}
									secureTextEntry={!showPassword}
									value={senha}
									onChangeText={setSenha}
								/>
								<TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
									<MaterialCommunityIcons 
										name={showPassword ? 'eye-off' : 'eye'} 
										size={20} 
										color={colors.primary}
										style={styles.inputIcon}
									/>
								</TouchableOpacity>
							</View>
							{getError('password') && (
								<Text style={[styles.errorText, { color: colors.danger }]}>{getError('password')}</Text>
							)}
						</View>

						<TouchableOpacity
							style={[styles.button, loading && styles.buttonDisabled]}
							onPress={handleLogin}
							disabled={loading}
						>
							{loading ? (
								<ActivityIndicator color="#fff" />
							) : (
								<>
									<MaterialCommunityIcons name="login" size={20} color="#fff" style={styles.buttonIcon} />
									<Text style={styles.buttonText}>{t('screens.login.signIn')}</Text>
								</>
							)}
						</TouchableOpacity>

						{biometricAvailable && (
							<TouchableOpacity
								style={[styles.biometricButton, { borderColor: colors.primary }]}
								onPress={handleBiometricLogin}
							>
								<MaterialCommunityIcons 
									name={biometryType === 1 ? 'face-recognition' : 'fingerprint'} 
									size={24} 
									color={colors.primary} 
								/>
								<Text style={[styles.biometricButtonText, { color: colors.primary }]}>
									{biometryType === 1 ? 'Face ID' : 'Touch ID'}
								</Text>
							</TouchableOpacity>
						)}
					</View>

					<View style={styles.footer}>
						<Text style={[styles.footerText, { color: colors.textSecondary }]}>{t('screens.login.noAccount')}</Text>
						<TouchableOpacity onPress={() => navigation.navigate('Register')}>
							<Text style={[styles.registerLink, { color: colors.primary }]}>{t('screens.login.signUp')}</Text>
						</TouchableOpacity>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

function createStyles(colors: any) {
	return StyleSheet.create({
		safeArea: {
			flex: 1,
		},
		container: {
			flex: 1,
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
			marginBottom: 8,
			textAlign: 'center',
		},
		subtitle: {
			fontSize: 16,
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
			letterSpacing: 0.3,
		},
		inputWrapper: {
			flexDirection: 'row',
			alignItems: 'center',
			borderWidth: 1.5,
			borderRadius: 12,
			paddingHorizontal: 12,
		},
		input: {
			flex: 1,
			paddingHorizontal: 4,
			paddingVertical: 14,
			fontSize: 16,
			fontWeight: '500',
		},
		inputIcon: {
			marginHorizontal: 8,
		},
		errorText: {
			fontSize: 12,
			marginTop: 4,
			fontWeight: '500',
		},
		forgotPasswordLink: {
			fontSize: 13,
			fontWeight: '600',
			textAlign: 'right',
			marginTop: 4,
		},
		button: {
			flexDirection: 'row',
			backgroundColor: colors.primary,
			borderRadius: 12,
			paddingVertical: 16,
			paddingHorizontal: 20,
			alignItems: 'center',
			justifyContent: 'center',
			marginTop: 12,
			shadowColor: colors.primary,
			shadowOffset: { width: 0, height: 4 },
			shadowOpacity: 0.3,
			shadowRadius: 8,
			elevation: 4,
			gap: 8,
		},
		buttonDisabled: {
			backgroundColor: colors.primaryLight,
			shadowOpacity: 0.1,
		},
		buttonIcon: {
			marginRight: 4,
		},
		buttonText: {
			color: '#FFFFFF',
			fontSize: 16,
			fontWeight: '700',
			letterSpacing: 0.5,
		},
		biometricButton: {
			flexDirection: 'row',
			borderWidth: 2,
			borderRadius: 12,
			paddingVertical: 14,
			paddingHorizontal: 20,
			alignItems: 'center',
			justifyContent: 'center',
			gap: 8,
			marginTop: 8,
		},
		biometricButtonText: {
			fontSize: 15,
			fontWeight: '600',
		},
		footer: {
			alignItems: 'center',
			gap: 4,
		},
		footerText: {
			fontSize: 14,
			fontWeight: '400',
		},
		registerLink: {
			fontSize: 14,
			fontWeight: '700',
			letterSpacing: 0.3,
		},
	});
}
