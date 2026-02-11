import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { register } from '../services/authService';
import { theme, spacing, fontSizes, colors, responsiveScale, isWeb, screenWidth, isAndroid } from '../config/theme';

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [idade, setIdade] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    console.log('📋 RegisterScreen montada e pronta para usar');
  }, []);

  const handleRegister = async () => {
    console.log('🔍 Iniciando validação...');
    console.log('Campo nome:', { valor: name, vazio: !name.trim() });
    console.log('Campo email:', { valor: email, vazio: !email.trim() });
    console.log('Campo idade:', { valor: idade, vazio: !idade.trim() });
    console.log('Campo phone:', { valor: phone, vazio: !phone.trim() });
    console.log('Campo password:', { vazio: !password.trim() });

    if (!name.trim() || !email.trim() || !idade.trim() || !phone.trim() || !password.trim()) {
      console.warn('⚠️ Validação falhou: campos vazios');
      Alert.alert('Aviso', 'Preencha todos os campos');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.warn('⚠️ Validação falhou: email inválido');
      Alert.alert('Erro', 'Por favor, insira um email válido');
      return;
    }

    if (password.length < 6) {
      console.warn('⚠️ Validação falhou: senha muito curta');
      Alert.alert('Erro', 'Senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      console.warn('⚠️ Validação falhou: senhas não conferem');
      Alert.alert('Erro', 'As senhas não conferem');
      return;
    }

    console.log('✅ Validação passou!');
    setLoading(true);

    try {
      await register(email, password, name, {
        idade,
        phone,
      });

      Alert.alert('Sucesso', 'Conta criada com sucesso! Bem-vindo ao app!');

      setName('');
      setEmail('');
      setIdade('');
      setPhone('');
      setPassword('');
      setConfirmPassword('');

      // Aguarda o AppNavigator renderizar AppStack (após onAuthStateChanged dispara)
      // e então navega para Details
      setTimeout(() => {
        navigation.navigate('Details');
      }, 1000);
    } catch (error: any) {
      const errorMsg = error?.message || 'Erro desconhecido';
      console.error('❌ Erro ao registrar usuário:', errorMsg);
      console.error('📋 Erro completo:', error);
      Alert.alert('Erro', `Falha ao registrar: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const renderInputField = (
    icon: React.ReactNode,
    placeholder: string,
    value: string,
    onChangeText: (text: string) => void,
    keyboardType: any = 'default',
    secureTextEntry: boolean = false,
    toggleSecure?: () => void
  ) => (
    <View style={styles.inputWrapper}>
      <View style={styles.inputIconContainer}>
        {icon}
      </View>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        editable={!loading}
        placeholderTextColor={colors.textTertiary}
      />
      {toggleSecure && (
        <TouchableOpacity onPress={toggleSecure} style={styles.toggleButton}>
          <MaterialIcons
            name={secureTextEntry ? 'visibility-off' : 'visibility'}
            size={responsiveScale(16)}
            color={colors.primary}
          />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.card}>
        <View style={styles.headerContainer}>
          <MaterialIcons name="person-add" size={responsiveScale(40)} color={colors.primary} />
          <Text style={styles.title}>Criar Conta</Text>
          <Text style={styles.subtitle}>Preencha seus dados abaixo</Text>
        </View>

        {renderInputField(
          <MaterialIcons name="person" size={responsiveScale(20)} color={colors.primary} />,
          'Nome Completo',
          name,
          setName
        )}

        {renderInputField(
          <MaterialIcons name="email" size={responsiveScale(20)} color={colors.primary} />,
          'Email',
          email,
          setEmail,
          'email-address'
        )}

        {renderInputField(
          <MaterialIcons name="cake" size={responsiveScale(20)} color={colors.primary} />,
          'Idade',
          idade,
          setIdade,
          'numeric'
        )}

        {renderInputField(
          <MaterialIcons name="phone" size={responsiveScale(20)} color={colors.primary} />,
          'Telefone',
          phone,
          setPhone,
          'phone-pad'
        )}

        {renderInputField(
          <MaterialIcons name="lock" size={responsiveScale(20)} color={colors.primary} />,
          'Senha',
          password,
          setPassword,
          'default',
          !showPassword,
          () => setShowPassword(!showPassword)
        )}

        {renderInputField(
          <MaterialIcons name="lock" size={responsiveScale(20)} color={colors.primary} />,
          'Confirmar Senha',
          confirmPassword,
          setConfirmPassword,
          'default',
          !showPassword
        )}

        <TouchableOpacity
          style={[styles.button, styles.registerButton, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <MaterialIcons name="check-circle" size={responsiveScale(20)} color={colors.white} />
              <Text style={styles.buttonText}>Registrar</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.backButton]}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <MaterialIcons name="arrow-back" size={responsiveScale(20)} color={colors.white} />
          <Text style={styles.buttonText}>Voltar para Home</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.light,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
    alignItems: isWeb ? 'center' : 'stretch',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: responsiveScale(10),
    padding: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    width: isWeb ? Math.min(500, screenWidth * 0.9) : '100%',
    alignSelf: isWeb ? 'center' : undefined,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
    textAlign: 'center',
    color: colors.text,
    marginTop: spacing.sm,
  },
  subtitle: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: responsiveScale(6),
    marginBottom: spacing.sm,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
  },
  inputIconContainer: {
    marginRight: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: spacing.sm,
    fontSize: fontSizes.sm,
    color: colors.text,
  },
  toggleButton: {
    padding: spacing.xs,
  },
  button: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: responsiveScale(8),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    gap: spacing.xs,
    width: '100%',
  },
  registerButton: {
    backgroundColor: colors.primary,
  },
  backButton: {
    backgroundColor: colors.textSecondary,
  },
  buttonDisabled: {
    backgroundColor: colors.textTertiary,
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSizes.sm,
    fontWeight: 'bold',
  },
});
