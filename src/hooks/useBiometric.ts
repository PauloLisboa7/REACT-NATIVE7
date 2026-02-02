import { useEffect, useState } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';

interface BiometricAvailable {
  isAvailable: boolean;
  biometryType: LocalAuthentication.AuthenticationType | null;
}

/**
 * Hook para autenticação biométrica (Face ID / Touch ID)
 */
export const useBiometric = () => {
  const [biometricAvailable, setBiometricAvailable] = useState<BiometricAvailable>({
    isAvailable: false,
    biometryType: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();

      if (compatible && enrolled) {
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        const biometryType = types?.[0] || null;
        setBiometricAvailable({ isAvailable: true, biometryType });
      } else {
        setBiometricAvailable({ isAvailable: false, biometryType: null });
      }
    } catch (error) {
      console.error('Erro ao verificar biometria:', error);
      setBiometricAvailable({ isAvailable: false, biometryType: null });
    } finally {
      setLoading(false);
    }
  };

  const authenticate = async (): Promise<boolean> => {
    try {
      if (!biometricAvailable.isAvailable) {
        return false;
      }

      const authenticated = await LocalAuthentication.authenticateAsync({
        disableDeviceFallback: false,
        reason: 'Autentique-se para acessar sua conta',
      });

      return authenticated.success;
    } catch (error) {
      console.error('Erro durante autenticação biométrica:', error);
      return false;
    }
  };

  return {
    biometricAvailable: biometricAvailable.isAvailable,
    biometryType: biometricAvailable.biometryType,
    loading,
    authenticate,
  };
};
