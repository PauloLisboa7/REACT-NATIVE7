// Design System - Cores
export const colors = {
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  background: '#F9FAFB',
  surface: '#FFFFFF',
  text: '#1F2937',
  textLight: '#6B7280',
  border: '#E5E7EB',
  shadow: '#000000',
  // Dark Mode
  darkBg: '#0F172A',
  darkSurface: '#1E293B',
  darkText: '#F1F5F9',
  darkTextLight: '#94A3B8',
};

// Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

// Mensagens
export const messages = {
  auth: {
    fillAllFields: 'Por favor, preencha todos os campos',
    invalidEmail: 'Email inválido',
    passwordTooShort: 'Senha deve ter pelo menos 6 caracteres',
    passwordMismatch: 'As senhas não conferem',
    emailAlreadyExists: 'Este email já está cadastrado',
    userNotFound: 'Usuário não encontrado',
    wrongPassword: 'Senha incorreta',
    tooManyRequests: 'Muitas tentativas. Tente mais tarde.',
    loginSuccess: 'Login realizado com sucesso!',
    logoutSuccess: 'Você foi desconectado',
    registerSuccess: 'Cadastro realizado com sucesso!',
    resetEmailSent: 'Email de reset enviado. Verifique sua caixa de entrada',
  },
  validation: {
    nameTooShort: 'Nome deve ter pelo menos 3 caracteres',
    invalidAge: 'Idade deve ser um número válido',
    ageTooLow: 'Idade mínima é 18 anos',
  },
  general: {
    error: 'Erro',
    success: 'Sucesso',
    loading: 'Carregando...',
    noData: 'Nenhum dado encontrado',
  },
};

// Regex patterns
export const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  phone: /^(\d{10,11})$/,
};
