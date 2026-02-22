import { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { fetchJson } from '../api/client';

export default function JobDetailScreen({ route, navigation }) {
  const { jobId } = route.params || {};
  const [job, setJob] = useState(null);
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');

  const load = useCallback(async () => {
    if (!jobId) return;
    try {
      const [jobData, snapData] = await Promise.all([fetchJson(`/api/jobs/${jobId}`), fetchJson(`/api/jobs/${jobId}/snapshots`)]);
      setJob(jobData);
      setSnapshots(Array.isArray(snapData) ? snapData : []);
    } catch (_) {
      setJob(null);
      setSnapshots([]);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    load();
  }, [load]);

  const runAction = async (action) => {
    setActionLoading(action);
    try {
      const data = await fetchJson(`/api/jobs/${jobId}/${action}`, { method: 'POST' });
      setJob(data);
      load();
    } catch (e) {
      alert(e?.message || 'Failed');
    } finally {
      setActionLoading('');
    }
  };

  const getTitle = (j) => j?.name || j?.start_name || j?.start_location || j?.id?.slice(0, 8) || 'Route';

  if (loading || !job) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const isRunning = String(job.status).toLowerCase() === 'running';

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{getTitle(job)}</Text>
      <Text style={styles.meta}>Status: {job.status || '—'}</Text>
      <View style={styles.actions}>
        {isRunning ? (
          <TouchableOpacity style={styles.btnSecondary} onPress={() => runAction('pause')} disabled={!!actionLoading}>
            <Text>Pause</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.btnPrimary} onPress={() => runAction('start')} disabled={!!actionLoading}>
            <Text style={styles.btnPrimaryText}>Start</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.btnSecondary} onPress={() => navigation.navigate('EditJob', { jobId, job })} disabled={!!actionLoading}>
          <Text>Edit</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.sectionTitle}>Snapshots ({snapshots.length})</Text>
      {snapshots.slice(-10).reverse().map((s) => (
        <TouchableOpacity
          key={s.id}
          style={styles.snapshotRow}
          onPress={() => navigation.navigate('SnapshotDetail', { jobId, snapshotId: s.id })}
        >
          <Text style={styles.snapshotTime}>{s.collected_at ? new Date(s.collected_at).toLocaleString() : '—'}</Text>
          <Text style={styles.snapshotDur}>{s.duration_seconds != null ? `${Math.round(s.duration_seconds / 60)} min` : '—'}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '600', padding: 16, color: '#111' },
  meta: { fontSize: 14, color: '#666', paddingHorizontal: 16 },
  actions: { flexDirection: 'row', gap: 12, padding: 16 },
  btnPrimary: { backgroundColor: '#2563eb', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  btnPrimaryText: { color: '#fff', fontWeight: '600' },
  btnSecondary: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: '#d1d5db' },
  sectionTitle: { fontSize: 16, fontWeight: '600', padding: 16, color: '#111' },
  snapshotRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, marginHorizontal: 16, marginBottom: 4, backgroundColor: '#fff', borderRadius: 8 },
  snapshotTime: { fontSize: 14, color: '#374151' },
  snapshotDur: { fontSize: 14, color: '#111' },
});
