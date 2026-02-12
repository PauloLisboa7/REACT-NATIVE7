import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { UserData } from './firebaseFirestoreService';

/**
 * Exporta usuários como CSV
 */
export const exportUsersAsCSV = async (users: UserData[]): Promise<string> => {
  try {
    const headers = ['UID', 'Email', 'Nome', 'Idade', 'Role', 'Grupo', 'Data Criação', 'Último Update'];
    const rows = users.map(user => [
      user.uid,
      user.email,
      user.name,
      user.age,
      user.role || 'user',
      user.group || '-',
      new Date(user.createdAt).toLocaleDateString('pt-BR'),
      new Date(user.updatedAt).toLocaleDateString('pt-BR'),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const fileName = `usuarios_${new Date().getTime()}.csv`;
    const file = new File(Paths.cache, fileName);
    file.write(csvContent);

    return file.uri;
  } catch (error: any) {
    throw new Error(`Erro ao exportar CSV: ${error.message}`);
  }
};

/**
 * Exporta usuários como JSON
 */
export const exportUsersAsJSON = async (users: UserData[]): Promise<string> => {
  try {
    const jsonContent = JSON.stringify(users, null, 2);

    const fileName = `usuarios_${new Date().getTime()}.json`;
    const file = new File(Paths.cache, fileName);
    file.write(jsonContent);

    return file.uri;
  } catch (error: any) {
    throw new Error(`Erro ao exportar JSON: ${error.message}`);
  }
};

/**
 * Compartilha um arquivo exportado
 */
export const shareExportedFile = async (filePath: string, fileName: string): Promise<void> => {
  try {
    if (!(await Sharing.isAvailableAsync())) {
      throw new Error('Compartilhamento não disponível neste dispositivo');
    }

    await Sharing.shareAsync(filePath, {
      mimeType: fileName.endsWith('.csv') ? 'text/csv' : 'application/json',
      dialogTitle: `Compartilhar ${fileName}`,
    });
  } catch (error: any) {
    throw new Error(`Erro ao compartilhar arquivo: ${error.message}`);
  }
};

/**
 * Gera relatório em texto
 */
export const generateTextReport = async (users: UserData[]): Promise<string> => {
  try {
    const now = new Date().toLocaleString('pt-BR');
    const totalUsers = users.length;
    const adminCount = users.filter(u => u.role === 'admin').length;
    const moderatorCount = users.filter(u => u.role === 'moderator').length;
    const userCount = totalUsers - adminCount - moderatorCount;

    const ageStats = users.reduce((acc, u) => {
      return {
        min: Math.min(acc.min, u.age),
        max: Math.max(acc.max, u.age),
        total: acc.total + u.age,
      };
    }, { min: Infinity, max: 0, total: 0 });

    const avgAge = (ageStats.total / totalUsers).toFixed(2);

    const content = `
========================================
RELATÓRIO DE USUÁRIOS
========================================
Data de Geração: ${now}

ESTATÍSTICAS GERAIS:
- Total de Usuários: ${totalUsers}
- Administradores: ${adminCount}
- Moderadores: ${moderatorCount}
- Usuários Comuns: ${userCount}

ESTATÍSTICAS DE IDADE:
- Idade Mínima: ${ageStats.min} anos
- Idade Máxima: ${ageStats.max} anos
- Idade Média: ${avgAge} anos

DETALHE DOS USUÁRIOS:
${users.map((u, i) => `
${i + 1}. ${u.name}
   Email: ${u.email}
   Idade: ${u.age} anos
   Role: ${u.role || 'user'}
   Grupo: ${u.group || '-'}
   Cadastrado em: ${new Date(u.createdAt).toLocaleDateString('pt-BR')}
`).join('')}

========================================
`;

    const fileName = `relatorio_usuarios_${new Date().getTime()}.txt`;
    const file = new File(Paths.cache, fileName);
    file.write(content);

    return file.uri;
  } catch (error: any) {
    throw new Error(`Erro ao gerar relatório: ${error.message}`);
  }
};
