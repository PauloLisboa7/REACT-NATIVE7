# 🚀 GETTING STARTED - REACT-NATIVE7

## ⚙️ Instalação e Configuração

### 1. Pré-requisitos

```bash
- Node.js 16+ ou superior
- npm ou yarn
- Expo CLI
- VS Code (recomendado)
```

### 2. Clonar e Instalar

```bash
# Clonar repositório
git clone https://github.com/PauloLisboa7/REACT-NATIVE7.git
cd REACT-NATIVE7

# Instalar dependências
npm install

# Ou com yarn
yarn install
```

### 3. Configurar Firebase

1. Ir para [Firebase Console](https://console.firebase.google.com)
2. Criar novo projeto
3. Ativar:
   - ✅ Authentication (Email/Senha, Google)
   - ✅ Firestore Database
   - ✅ Storage
4. Copiar credenciais para `src/config/firebaseConfig.ts`

### 4. Configurar Google Sign-In

1. Ir para [Google Cloud Console](https://console.cloud.google.com)
2. Criar projeto
3. Ativar Google+ API
4. Criar OAuth 2.0 credentials
5. Adicionar em `src/services/googleSignInService.ts`:
   ```typescript
   clientId: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
   iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
   androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
   ```

### 5. Rodar Aplicação

```bash
# Start dev server
npm start
# ou
expo start

# Escanear com Expo Go (física)
# Ou pressionar 'i' para iOS simulator
# Ou pressionar 'a' para Android emulator
# Ou pressionar 'w' para web
```

---

## 📱 Testando no Celular

### Android
```bash
expo start --android
# Ou instalar via Play Store: Expo Go
# Escanear QR code no terminal
```

### iOS
```bash
expo start --ios
# Ou instalar via App Store: Expo Go
# Escanear QR code no terminal
```

### Web
```bash
expo start --web
# Ou
npm run web
```

---

## 🔧 Configurações Importantes

### Firebase Config (`src/config/firebaseConfig.ts`)
```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

### Environment Variables
Criar arquivo `.env` (se necessário):
```bash
REACT_APP_FIREBASE_API_KEY=sua_chave
REACT_APP_FIREBASE_PROJECT_ID=seu_projeto
```

---

## 🎯 Primeiro Acesso

### Conta de Teste
```
Email: teste@email.com
Senha: Senha123!
```

Ou registrar nova conta na tela de Register.

---

## 📝 Desenvolvimento

### Estrutura de Arquivos
```
src/
├── config/          # Configurações (Firebase)
├── context/         # Estado global (Auth, Theme, Permissions)
├── hooks/           # Hooks customizados
├── screens/         # Telas da aplicação
├── services/        # Lógica de negócio
└── navigation/      # Navegação
```

### Criar Nova Feature

1. **Criar Screen**
```typescript
// src/screens/NovaScreen.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function NovaScreen() {
  const { colors } = useTheme();
  
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>Olá</Text>
    </View>
  );
}
```

2. **Adicionar ao AppNavigator**
```typescript
// src/navigation/AppNavigator.tsx
import NovaScreen from '../screens/NovaScreen';

<Stack.Screen name="Nova" component={NovaScreen} />
```

3. **Navegar**
```typescript
navigation.navigate('Nova');
```

---

## 🧪 Testes

### Testes Manuais Recomendados

**Autenticação**
- [ ] Register novo usuário
- [ ] Login com email/senha
- [ ] Logout
- [ ] Recuperação de senha
- [ ] Login com Google
- [ ] Biometria

**Gerenciamento**
- [ ] Criar usuário
- [ ] Editar usuário
- [ ] Deletar usuário
- [ ] Favoritarr usuário

**Features**
- [ ] Dark mode
- [ ] Busca e filtros
- [ ] Exportar dados
- [ ] Dashboard
- [ ] Histórico
- [ ] Notificações

---

## 🐛 Debug

### Enable Debug Mode
```typescript
// App.tsx
import { enableDebugMode } from './debug';
enableDebugMode();
```

### Inspect Element
```
Expo: pressionar 'Shift+M' no terminal
iOS: shake device e tocar "Debug Remote JS"
Android: shake device e tocar "Open Debugger"
```

### Console Logs
```typescript
console.log('Debug:', variavel);
console.warn('Warning:', mensagem);
console.error('Error:', erro);
```

---

## 📦 Build para Produção

### Android APK
```bash
eas build --platform android
# ou
expo build:android
```

### iOS IPA
```bash
eas build --platform ios
# ou
expo build:ios
```

### Deploy
```bash
eas submit --platform android
eas submit --platform ios
```

---

## 🔐 Variáveis de Ambiente

Criar `.env.local`:
```
FIREBASE_API_KEY=sua_chave_api
FIREBASE_PROJECT_ID=seu_projeto
GOOGLE_CLIENT_ID=seu_client_id
```

Acessar:
```typescript
const apiKey = process.env.FIREBASE_API_KEY;
```

---

## 📊 Monitoramento

### Firebase Console
- Ver usuários autenticados
- Monitorar Firestore
- Verificar Storage
- Analisar crashes

### Expo Dashboard
```bash
# Ir para https://expo.dev
# Login com sua conta
# Ver histórico de builds
```

---

## 🆘 Problemas Comuns

### "Cannot find module"
```bash
npm install
# ou
npm install <nome-do-pacote>
```

### Firebase não conecta
```
- Verificar credenciais em firebaseConfig.ts
- Verificar regras de Firestore
- Verificar internet
```

### Biometria não funciona
```
- Android: Ativar fingerprint em Configurações
- iOS: Face ID/Touch ID ativado
```

### Dark mode não muda
```typescript
// Forçar atualizar
const { toggleTheme } = useTheme();
toggleTheme(); // Click 2x se necessário
```

---

## 📚 Recursos

### Documentação
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Docs](https://docs.expo.dev/)
- [Firebase Docs](https://firebase.google.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Comunidades
- [React Native Community](https://react-native.community/)
- [Expo Community](https://discord.gg/expo)
- [Firebase Community](https://www.reddit.com/r/Firebase/)

### Tutoriais
- [React Native Course](https://www.youtube.com/playlist?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf)
- [Firebase Course](https://www.youtube.com/watch?v=2hR-uWjBi7w)

---

## 📝 Conventions

### Nomenclatura
```typescript
// Screens - PascalCase
HomeScreen, LoginScreen, ListScreen

// Services - camelCase
authService, exportService

// Functions - camelCase
const handlePress = () => {}
const calculateStats = () => {}

// Variables - camelCase
const [userData, setUserData] = useState()

// Constants - UPPER_SNAKE_CASE
const MAX_PASSWORD_LENGTH = 128
const DEFAULT_THEME = 'light'
```

### Imports
```typescript
// Sempre no topo
import React from 'react';
import { View } from 'react-native';

// Depois bibliotecas externas
import { useTheme } from '../context/ThemeContext';

// Depois relativos
import { logActivity } from '../services/firebaseActivityService';
```

---

## ✅ Pre-Deploy Checklist

- [ ] TypeScript sem erros: `tsc --noEmit`
- [ ] Eslint sem warnings: `eslint src/`
- [ ] Tests passando: `npm test`
- [ ] Versão atualizada: `package.json`
- [ ] Changelog atualizado
- [ ] README.md atualizado
- [ ] Commit clean: `git log`
- [ ] Build local testado
- [ ] Todas as screens testadas
- [ ] Dark mode testado

---

## 🎉 Pronto!

Agora você pode:
✅ Desenvolver novas features
✅ Fazer deploy para produção
✅ Distribuir para usuários
✅ Monitorar analytics

---

**Desenvolvido por**: Paulo Lisboa  
**Versão**: 1.0.0  
**Última Atualização**: 2025

Para mais informações, consulte:
- `FUNCIONALIDADES.md` - Todas as 24 features
- `GUIA_DESENVOLVEDOR.md` - Guia prático
- `STATUS.md` - Status do projeto
