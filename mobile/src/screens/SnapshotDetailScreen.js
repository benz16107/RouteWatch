import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { fetchJson } from '../api/client';

export default function SnapshotDetailScreen({ route }) {
  const { jobId, snapshotId } = route.params || {};
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jobId || !snapshotId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetchJson(`/api/jobs/${jobId}/snapshots/${snapshotId}`)
      .then((data) => {
        if (!cancelled) setSnapshot(data);
      })
      .catch(() => {
        if (!cancelled) setSnapshot(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [jobId, snapshotId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!snapshot) {
    return (
      <View style={styles.centered}>
        <Text>Snapshot not found</Text>
      </View>
    );
  }

  let details = {};
  try {
    const rd = snapshot.route_details;
    details = typeof rd === 'string' ? JSON.parse(rd) : rd || {};
  } catch (_) {}
  const steps = details.steps || [];
  const points = details.points || [];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>Collected at</Text>
        <Text style={styles.value}>{snapshot.collected_at ? new Date(snapshot.collected_at).toLocaleString() : '—'}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Duration</Text>
        <Text style={styles.value}>{snapshot.duration_seconds != null ? `${Math.round(snapshot.duration_seconds / 60)} min` : '—'}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Distance</Text>
        <Text style={styles.value}>{snapshot.distance_meters != null ? `${(snapshot.distance_meters / 1000).toFixed(2)} km` : '—'}</Text>
      </View>
      {points.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Route</Text>
          <Text style={styles.hint}>{points.length} points (map can be added with react-native-maps)</Text>
        </View>
      )}
      {steps.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Turn-by-turn</Text>
          {steps.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <Text style={styles.stepNum}>{i + 1}.</Text>
              <Text style={styles.stepText}>{step.html_instructions ? step.html_instructions.replace(/<[^>]*>/g, '').trim() : step.instruction || '—'}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  section: { backgroundColor: '#fff', marginHorizontal: 16, marginVertical: 8, padding: 16, borderRadius: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#111' },
  label: { fontSize: 12, color: '#666', marginBottom: 4 },
  value: { fontSize: 16, color: '#111' },
  hint: { fontSize: 14, color: '#666' },
  stepRow: { flexDirection: 'row', marginBottom: 8 },
  stepNum: { fontWeight: '600', marginRight: 8, color: '#374151' },
  stepText: { flex: 1, fontSize: 14, color: '#111' },
});
