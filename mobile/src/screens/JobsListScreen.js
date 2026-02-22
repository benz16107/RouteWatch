import { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchJson } from '../api/client';

export default function JobsListScreen({ navigation }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchJson('/api/jobs');
      setJobs(Array.isArray(data) ? data : []);
    } catch (_) {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadJobs();
    }, [loadJobs])
  );

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
      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>No routes yet. Create one from Home or New route.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}>
            <Text style={styles.rowTitle}>{getJobTitle(item)}</Text>
            <Text style={styles.rowMeta}>{item.status || '—'}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { padding: 24, textAlign: 'center', color: '#666' },
  row: { backgroundColor: '#fff', padding: 16, marginHorizontal: 16, marginVertical: 6, borderRadius: 8 },
  rowTitle: { fontSize: 16, fontWeight: '500', color: '#111' },
  rowMeta: { fontSize: 12, color: '#666', marginTop: 4 },
});
