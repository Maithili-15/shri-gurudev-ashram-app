import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import AppButton from '../../components/AppButton';
import AppCard from '../../components/AppCard';
import AppHeader from '../../components/AppHeader';
import ScreenContainer from '../../components/ScreenContainer';
import { theme } from '../../constants/theme';
import { useAuthStore } from '../../store/useAuthStore';
import { MainTabParamList } from '../../navigators/MainTabNavigator';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ProfileNav = {
  navigate: (name: keyof MainTabParamList) => void;
  getParent?: () => {
    navigate: (name: string) => void;
  };
};

function YatraRegistrationCard({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withTiming(0.97, { duration: 150 }); }}
      onPressOut={() => { scale.value = withTiming(1, { duration: 150 }); }}
      style={[styles.yatraCardWrap, animatedStyle]}
    >
      <LinearGradient
        colors={['#7B4B00', '#B97512', '#E0A31F']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.yatraCardFill}
      >
        <View style={styles.yatraCardContent}>
          <View style={styles.yatraIconWrap}>
            <MaterialIcons name="auto-awesome" size={22} color="#7B4B00" />
          </View>
          <View style={styles.yatraTextWrap}>
            <Text style={styles.yatraCardTitle}>Begin Your Spiritual Journey</Text>
            <Text style={styles.yatraCardSubtitle}>Explore & book sacred Yatra packages</Text>
          </View>
        </View>
        <MaterialIcons name="arrow-forward-ios" size={18} color="rgba(255,255,255,0.8)" />
      </LinearGradient>
    </AnimatedPressable>
  );
}

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileNav>();
  const parentNavigation = navigation.getParent?.();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const isCollector = user?.role === 'collector';

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <AppHeader title="Profile" subtitle="User profile shell with placeholder account actions." />

        <AppCard style={styles.card}>
          <Text style={styles.label}>Signed in as</Text>
          <Text style={styles.name}>{user?.name ?? 'Guest User'}</Text>
          <Text style={styles.text}>Profile data and preferences can be added here later.</Text>
        </AppCard>

        <YatraRegistrationCard onPress={() => navigation.navigate('Travel')} />

        <View style={styles.actions}>
          <AppButton title="Settings" onPress={() => parentNavigation?.navigate('Settings')} />
          <AppButton title="Help & Support" onPress={() => parentNavigation?.navigate('HelpSupport')} variant="secondary" />
          {isCollector ? (
            <AppButton title="Collector Dashboard" onPress={() => parentNavigation?.navigate('CollectorDashboard')} variant="secondary" />
          ) : null}
          <AppButton title="Logout" onPress={logout} variant="secondary" />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  card: {
    marginBottom: theme.spacing.lg,
  },
  yatraCardWrap: {
    marginBottom: theme.spacing.xl,
    borderRadius: 20,
    shadowColor: '#B97512',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  yatraCardFill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 20,
  },
  yatraCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  yatraIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  yatraTextWrap: {
    flex: 1,
  },
  yatraCardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  yatraCardSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '500',
  },
  actions: {
    gap: theme.spacing.md,
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
    marginBottom: theme.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  name: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    marginBottom: theme.spacing.sm,
  },
  text: {
    color: theme.colors.textMuted,
    lineHeight: 20,
  },
});
