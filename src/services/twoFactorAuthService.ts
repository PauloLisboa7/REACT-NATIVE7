import * as SecureStore from 'expo-secure-store';
import { db } from '../config/firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

export interface TwoFactorSetup {
  userId: string;
  phoneNumber: string;
  enabled: boolean;
  method: 'sms' | 'email';
  createdAt: number;
  verifiedAt?: number;
}

export interface TwoFactorCode {
  code: string;
  expiresAt: number;
  attempts: number;
  maxAttempts: number;
}

/**
 * Gerar código de 6 dígitos para 2FA
 */
function generateTwoFactorCode(): string {
  // Gerar 6 dígitos aleatórios
  const codigo = Math.floor(100000 + Math.random() * 900000).toString();
  return codigo;
}

/**
 * Configurar 2FA para um usuário
 */
export async function setupTwoFactorAuth(
  userId: string,
  phoneNumber: string,
  method: 'sms' | 'email' = 'sms'
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validar número de telefone
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return {
        success: false,
        error: 'Número de telefone inválido',
      };
    }

    const setup: TwoFactorSetup = {
      userId,
      phoneNumber,
      enabled: false,
      method,
      createdAt: new Date().getTime(),
    };

    // Salvar configuração no Firestore
    await updateDoc(doc(db, 'users', userId), {
      twoFactorSetup: setup,
      twoFactorEnabled: false,
    });

    // Armazenar de forma segura
    await SecureStore.setItemAsync(
      `2fa_${userId}`,
      JSON.stringify(setup)
    );

    return { success: true };
  } catch (erro: any) {
    console.error('Erro ao configurar 2FA:', erro);
    return {
      success: false,
      error: erro.message || 'Erro ao configurar 2FA',
    };
  }
}

/**
 * Enviar código de 2FA (SMS ou Email)
 */
export async function send2FACode(
  userId: string,
  method: 'sms' | 'email',
  destination: string
): Promise<{ success: boolean; code?: string; error?: string }> {
  try {
    const code = generateTwoFactorCode();
    const expiresAt = new Date().getTime() + 10 * 60 * 1000; // 10 minutos

    const codeData: TwoFactorCode = {
      code,
      expiresAt,
      attempts: 0,
      maxAttempts: 3,
    };

    // Em produção, aqui você chamaria um serviço de SMS/Email
    // Por exemplo: Twilio para SMS, SendGrid para Email

    if (method === 'sms') {
      // Simular envio de SMS
      console.log(`[SMS enviado para ${destination}] Código: ${code}`);
      // Em produção: await sendSMSWithTwilio(destination, code);
    } else if (method === 'email') {
      // Simular envio de Email
      console.log(`[Email enviado para ${destination}] Código: ${code}`);
      // Em produção: await sendEmailWithSendGrid(destination, code);
    }

    // Armazenar código de forma segura (servidor-side em produção)
    await SecureStore.setItemAsync(
      `2fa_code_${userId}`,
      JSON.stringify(codeData)
    );

    return { success: true, code }; // Retornar code apenas em desenvolvimento
  } catch (erro: any) {
    console.error('Erro ao enviar código 2FA:', erro);
    return {
      success: false,
      error: erro.message || 'Erro ao enviar código',
    };
  }
}

/**
 * Verificar código de 2FA
 */
export async function verify2FACode(
  userId: string,
  inputCode: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Recuperar código armazenado
    const storedCodeString = await SecureStore.getItemAsync(
      `2fa_code_${userId}`
    );

    if (!storedCodeString) {
      return {
        success: false,
        error: 'Nenhum código foi solicitado',
      };
    }

    const codeData: TwoFactorCode = JSON.parse(storedCodeString);

    // Verificar se expirou
    if (codeData.expiresAt < new Date().getTime()) {
      await SecureStore.deleteItemAsync(`2fa_code_${userId}`);
      return {
        success: false,
        error: 'Código expirou',
      };
    }

    // Verificar tentativas
    if (codeData.attempts >= codeData.maxAttempts) {
      await SecureStore.deleteItemAsync(`2fa_code_${userId}`);
      return {
        success: false,
        error: 'Número máximo de tentativas atingido',
      };
    }

    // Comparar códigos
    if (codeData.code !== inputCode) {
      codeData.attempts += 1;
      await SecureStore.setItemAsync(
        `2fa_code_${userId}`,
        JSON.stringify(codeData)
      );
      return {
        success: false,
        error: `Código incorreto. Tentativas restantes: ${codeData.maxAttempts - codeData.attempts}`,
      };
    }

    // Código correto - limpar e retornar sucesso
    await SecureStore.deleteItemAsync(`2fa_code_${userId}`);

    return { success: true };
  } catch (erro: any) {
    console.error('Erro ao verificar código 2FA:', erro);
    return {
      success: false,
      error: erro.message || 'Erro ao verificar código',
    };
  }
}

/**
 * Habilitar 2FA após verificação bem-sucedida
 */
export async function enable2FA(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Atualizar no Firestore
    await updateDoc(doc(db, 'users', userId), {
      twoFactorEnabled: true,
    });

    return { success: true };
  } catch (erro: any) {
    console.error('Erro ao habilitar 2FA:', erro);
    return {
      success: false,
      error: erro.message || 'Erro ao habilitar 2FA',
    };
  }
}

/**
 * Desabilitar 2FA
 */
export async function disable2FA(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Limpar dados de 2FA
    await SecureStore.deleteItemAsync(`2fa_${userId}`);
    await SecureStore.deleteItemAsync(`2fa_code_${userId}`);

    // Atualizar no Firestore
    await updateDoc(doc(db, 'users', userId), {
      twoFactorEnabled: false,
    });

    return { success: true };
  } catch (erro: any) {
    console.error('Erro ao desabilitar 2FA:', erro);
    return {
      success: false,
      error: erro.message || 'Erro ao desabilitar 2FA',
    };
  }
}

/**
 * Obter configuração de 2FA do usuário
 */
export async function get2FASetup(
  userId: string
): Promise<TwoFactorSetup | null> {
  try {
    const setupString = await SecureStore.getItemAsync(`2fa_${userId}`);
    if (!setupString) return null;

    return JSON.parse(setupString);
  } catch (erro) {
    console.error('Erro ao obter configuração de 2FA:', erro);
    return null;
  }
}

/**
 * Validar força da senha
 */
export function validatePasswordStrength(password: string): {
  strength: 'fraca' | 'media' | 'forte' | 'muito-forte';
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score += 1;
  else feedback.push('Use pelo menos 8 caracteres');

  if (password.length >= 12) score += 1;
  else feedback.push('Use mais de 12 caracteres para mais segurança');

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Use letras minúsculas');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Use letras maiúsculas');

  if (/[0-9]/.test(password)) score += 1;
  else feedback.push('Use números');

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  else feedback.push('Use caracteres especiais');

  let strength: 'fraca' | 'media' | 'forte' | 'muito-forte' = 'fraca';
  if (score >= 5) strength = 'muito-forte';
  else if (score >= 4) strength = 'forte';
  else if (score >= 2) strength = 'media';

  return { strength, score, feedback };
}
