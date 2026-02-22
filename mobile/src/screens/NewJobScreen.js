import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { fetchJson } from '../api/client';

export default function NewJobScreen({ navigation }) {
  const [name, setName] = useState('');
  const [startName, setStartName] = useState('');
  const [endName, setEndName] = useState('');
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [cycleMinutes, setCycleMinutes] = useState('60');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!startLocation.trim() || !endLocation.trim()) {
      setError('Start and end locations are required');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await fetchJson('/api/jobs', {
        method: 'POST',
        body: {
          name: name.trim() || null,
          start_name: startName.trim() || null,
          end_name: endName.trim() || null,
          start_location: startLocation.trim(),
          end_location: endLocation.trim(),
          cycle_minutes: parseInt(cycleMinutes, 10) || 60,
        },
      });
      navigation.replace('JobDetail', { jobId: data?.id });
    } catch (e) {
      setError(e?.message || 'Failed to create route');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>New route</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Text style={styles.label}>Route name (optional)</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Home to Work" placeholderTextColor="#888" editable={!loading} />
      <Text style={styles.label}>Start address *</Text>
      <TextInput style={styles.input} value={startLocation} onChangeText={setStartLocation} placeholder="Address or place" placeholderTextColor="#888" editable={!loading} />
      <Text style={styles.label}>Start label (optional)</Text>
      <TextInput style={styles.input} value={startName} onChangeText={setStartName} placeholder="e.g. Home" placeholderTextColor="#888" editable={!loading} />
      <Text style={styles.label}>End address *</Text>
      <TextInput style={styles.input} value={endLocation} onChangeText={setEndLocation} placeholder="Address or place" placeholderTextColor="#888" editable={!loading} />
      <Text style={styles.label}>End label (optional)</Text>
      <TextInput style={styles.input} value={endName} onChangeText={setEndName} placeholder="e.g. Office" placeholderTextColor="#888" editable={!loading} />
      <Text style={styles.label}>Collect every (minutes)</Text>
      <TextInput style={styles.input} value={cycleMinutes} onChangeText={setCycleMinutes} placeholder="60" keyboardType="number-pad" editable={!loading} />
      <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleCreate} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create route</Text>}
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()} disabled={loading}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
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
