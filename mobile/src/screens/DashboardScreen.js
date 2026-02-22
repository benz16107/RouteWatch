import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { fetchJson } from '../api/client';

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadJobs = async () => {
    try {
      const data = await fetchJson('/api/jobs');
      setJobs(Array.isArray(data) ? data : []);
    } catch (_) {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const displayName = user?.name?.trim() || user?.email?.split('@')[0] || 'there';
  const getJobTitle = (job) => job?.name || job?.start_name || job?.start_location || job?.id?.slice(0, 8) || 'Route';

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Hi, {displayName}, welcome to RouteWatch.</Text>
      <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('NewJob')}>
        <Text style={styles.primaryButtonText}>New route</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('JobsList')}>
        <Text style={styles.secondaryButtonText}>View all routes</Text>
      </TouchableOpacity>
      {jobs.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Recent routes</Text>
          <FlatList
            data={jobs.slice(0, 5)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.jobRow} onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}>
                <Text style={styles.jobRowTitle}>{getJobTitle(item)}</Text>
              </TouchableOpacity>
            )}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  welcome: { fontSize: 18, color: '#374151', marginBottom: 20 },
  primaryButton: { backgroundColor: '#2563eb', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  secondaryButton: { paddingVertical: 12, alignItems: 'center', marginBottom: 24 },
  secondaryButtonText: { color: '#2563eb', fontSize: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#111' },
  jobRow: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 8 },
  jobRowTitle: { fontSize: 16, color: '#111' },
});
