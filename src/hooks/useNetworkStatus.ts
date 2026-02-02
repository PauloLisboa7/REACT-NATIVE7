import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar status inicial
    const checkConnection = async () => {
      const state = await NetInfo.fetch();
      setIsConnected(state.isConnected ?? true);
      setIsLoading(false);
    };

    checkConnection();

    // Subscribir a mudanças de conexão
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? true);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { isConnected, isLoading };
};
