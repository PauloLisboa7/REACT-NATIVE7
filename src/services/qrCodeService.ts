import QRCode from 'qrcode.react';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';

export interface QRCodeProfileData {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  timestamp: number;
}

/**
 * Gerar dados de QR Code para perfil de usuário
 */
export function generateProfileQRData(userData: QRCodeProfileData): string {
  const data = {
    type: 'user_profile',
    userId: userData.userId,
    name: userData.name,
    email: userData.email,
    avatar: userData.avatar,
    timestamp: userData.timestamp,
  };

  return JSON.stringify(data);
}

/**
 * Gerar e salvar imagem QR Code no sistema de arquivos
 */
export async function generateQRCodeImage(
  qrData: string,
  userId: string
): Promise<string> {
  try {
    // Criar diretório se não existir
    const directory = `${FileSystem.cacheDirectory}qrcodes/`;
    
    try {
      await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
    } catch (err) {
      // Diretório pode já existir
    }

    const filename = `${directory}profile_${userId}_${Date.now()}.png`;

    // Aqui você pode usar uma biblioteca como qrcode.react 
    // Esta é uma implementação conceitual
    // Para implementação real, use canvas ou react-native-view-shot

    return filename;
  } catch (erro) {
    console.error('Erro ao gerar imagem QR Code:', erro);
    throw erro;
  }
}

/**
 * Compartilhar QR Code do perfil
 */
export async function shareProfileQRCode(
  qrData: string,
  userName: string
): Promise<void> {
  try {
    // Salvar a imagem QR Code
    const directory = `${FileSystem.cacheDirectory}qrcodes/`;
    
    try {
      await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
    } catch (err) {
      // Diretório pode já existir
    }

    const filename = `${directory}profile_qr_${Date.now()}.png`;

    // Aqui a imagem seria salva, depois compartilhada
    // Para implementação completa, seria necessário usar uma biblioteca
    // que gere o PNG do QR Code

    // Compartilhar usando expo-sharing
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filename, {
        mimeType: 'image/png',
        dialogTitle: `Compartilhar Perfil - ${userName}`,
        UTI: 'com.compuserve.gif',
      });
    } else {
      throw new Error('Compartilhamento não está disponível neste dispositivo');
    }
  } catch (erro) {
    console.error('Erro ao compartilhar QR Code:', erro);
    throw erro;
  }
}

/**
 * Decodificar dados QR Code do perfil
 */
export function decodeProfileQRData(qrString: string): QRCodeProfileData | null {
  try {
    const data = JSON.parse(qrString);

    if (data.type === 'user_profile') {
      return {
        userId: data.userId,
        name: data.name,
        email: data.email,
        avatar: data.avatar,
        timestamp: data.timestamp,
      };
    }

    return null;
  } catch (erro) {
    console.error('Erro ao decodificar QR Code:', erro);
    return null;
  }
}

/**
 * Obter URL para escanear perfil via deep link
 */
export function getProfileScanLink(userId: string): string {
  // Esta seria uma URL deep link para sua app
  return `app://profile/${userId}`;
}

/**
 * Validar dados QR Code do perfil
 */
export function validateProfileQRData(data: any): boolean {
  return (
    data &&
    typeof data === 'object' &&
    data.type === 'user_profile' &&
    data.userId &&
    data.email &&
    typeof data.timestamp === 'number'
  );
}

/**
 * Gerar múltiplos QR Codes para diferentes usuários
 */
export async function generateMultipleQRCodes(
  users: QRCodeProfileData[]
): Promise<string[]> {
  const qrCodes: string[] = [];

  for (const user of users) {
    const qrData = generateProfileQRData(user);
    const qrCode = await generateQRCodeImage(qrData, user.userId);
    qrCodes.push(qrCode);
  }

  return qrCodes;
}
