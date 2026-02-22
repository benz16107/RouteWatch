import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { fetchJson } from '../api/client';

export default function EditJobScreen({ route, navigation }) {
  const { jobId, job } = route.params || {};
  const [name, setName] = useState(job?.name ?? '');
  const [startName, setStartName] = useState(job?.start_name ?? '');
  const [endName, setEndName] = useState(job?.end_name ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await fetchJson(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        body: {
          name: name.trim() || null,
          start_name: startName.trim() || null,
          end_name: endName.trim() || null,
        },
      });
      navigation.navigate('JobDetail', { jobId, job: data });
    } catch (e) {
      setError(e?.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  if (!jobId) {
    return (
      <View style={styles.centered}>
        <Text>Job not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Edit route</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Text style={styles.label}>Route name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Optional" placeholderTextColor="#888" editable={!loading} />
      <Text style={styles.label}>Start label</Text>
      <TextInput style={styles.input} value={startName} onChangeText={setStartName} placeholder="Optional" placeholderTextColor="#888" editable={!loading} />
      <Text style={styles.label}>End label</Text>
      <TextInput style={styles.input} value={endName} onChangeText={setEndName} placeholder="Optional" placeholderTextColor="#888" editable={!loading} />
      <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSave} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save</Text>}
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()} disabled={loading}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '600', padding: 16, color: '#111' },
  error: { color: '#b91c1c', paddingHorizontal: 16, marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6, marginHorizontal: 16 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 16, marginHorizontal: 16, marginBottom: 16, backgroundColor: '#fff' },
  button: { backgroundColor: '#2563eb', marginHorizontal: 16, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cancelBtn: { marginTop: 12, marginHorizontal: 16, paddingVertical: 12, alignItems: 'center' },
  cancelText: { color: '#666' },
});
