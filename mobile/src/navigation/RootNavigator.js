import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import MainStack from './MainStack';

export default function RootNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading…</Text>
      </View>
    );
  }

  return isAuthenticated ? <MainStack /> : <AuthStack />;
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  loadingText: { marginTop: 12, color: '#666' },
});
