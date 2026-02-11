import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { theme, spacing, fontSizes, colors, screenWidth, responsiveScale, isWeb, isAndroid } from '../config/theme';

/**
 * HomeScreen - Tela Inicial da Aplicação Autenticada
 * 
 * Esta é uma rota privada que só é acessível para usuários autenticados.
 * Se o usuário fizer logout, será automaticamente redirecionado para AuthStack.
 */
export default function HomeScreen({ navigation }: any) {
  useEffect(() => {
    console.log('HomeScreen montado');
    return () => {
      console.log('HomeScreen desmontado');
    };
  }, []);

  const renderMenuItem = (
    icon: React.ReactNode,
    title: string,
    subtitle: string,
    onPress: () => void,
    bgColor: string
  ) => (
    <TouchableOpacity 
      style={[styles.menuItem, { backgroundColor: bgColor }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        {icon}
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color={colors.white} />
    </TouchableOpacity>
  );

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerIconContainer}>
          <MaterialIcons name="home" size={responsiveScale(40)} color={colors.white} />
        </View>
        <Text style={styles.headerTitle}>Bem-vindo!</Text>
        <Text style={styles.headerSubtitle}>Escolha uma opção abaixo</Text>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {renderMenuItem(
          <MaterialIcons name="info" size={responsiveScale(28)} color={colors.white} />,
          'Detalhes',
          'Veja informações do app',
          () => navigation.navigate('Details'),
          '#4A90E2'
        )}

        {renderMenuItem(
          <MaterialIcons name="person" size={responsiveScale(28)} color={colors.white} />,
          'Minha Conta',
          'Visualize seu perfil e faça logout',
          () => navigation.navigate('Login'),
          '#FF6B6B'
        )}
      </View>

      {/* Footer Info */}
      <View style={styles.footerContainer}>
        <MaterialIcons name="security" size={responsiveScale(20)} color={colors.primary} />
        <Text style={styles.footerText}>
          Você está autenticado e protegido
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  scrollContent: {
    paddingBottom: spacing.lg,
    alignItems: isWeb ? 'center' : 'stretch',
  },
  headerContainer: {
    backgroundColor: colors.primary,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    borderBottomLeftRadius: responsiveScale(12),
    borderBottomRightRadius: responsiveScale(12),
    width: isWeb ? Math.min(500, screenWidth * 0.9) : '100%',
    alignSelf: isWeb ? 'center' : undefined,
  },
  headerIconContainer: {
    width: responsiveScale(35),
    height: responsiveScale(35),
    borderRadius: responsiveScale(18),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  headerTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: fontSizes.xs,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  menuContainer: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    gap: spacing.xs,
    width: isWeb ? Math.min(500, screenWidth * 0.9) : isAndroid ? Math.min(350, screenWidth * 0.9) : '100%',
    alignSelf: isWeb ? 'center' : isAndroid ? 'center' : undefined,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: responsiveScale(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  iconContainer: {
    width: responsiveScale(32),
    height: responsiveScale(32),
    borderRadius: responsiveScale(16),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.white,
  },
  menuSubtitle: {
    fontSize: fontSizes.xs,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: spacing.xs,
  },
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: responsiveScale(8),
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    width: isWeb ? Math.min(500, screenWidth * 0.9) : '100%',
    alignSelf: isWeb ? 'center' : undefined,
  },
  footerText: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    flex: 1,
  },
});
