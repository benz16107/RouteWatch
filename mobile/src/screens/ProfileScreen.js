import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { fetchJson } from '../api/client';

export default function ProfileScreen({ navigation }) {
  const { user, logout, setUserFromResponse, refreshToken } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChangePassword = async () => {
    setError('');
    setMessage('');
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    setSubmitting(true);
    try {
      const data = await fetchJson('/api/auth/change-password', {
        method: 'POST',
        body: { currentPassword, newPassword },
      });
      setMessage('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      if (data?.user) setUserFromResponse(data.user);
      if (data?.token) await refreshToken(data.token);
    } catch (e) {
      setError(e?.message || 'Failed to change password.');
    } finally {
      setSubmitting(false);
    }
  };

  const displayName = user?.name?.trim() || user?.email || '—';
  const canChangePassword = user?.hasPassword === true;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <View style={styles.section}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{displayName}</Text>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email || '—'}</Text>
      </View>
      {canChangePassword && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Change password</Text>
          {message ? <Text style={styles.success}>{message}</Text> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TextInput style={styles.input} value={currentPassword} onChangeText={setCurrentPassword} placeholder="Current password" placeholderTextColor="#888" secureTextEntry editable={!submitting} />
          <TextInput style={styles.input} value={newPassword} onChangeText={setNewPassword} placeholder="New password" placeholderTextColor="#888" secureTextEntry editable={!submitting} />
          <TextInput style={styles.input} value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Confirm new password" placeholderTextColor="#888" secureTextEntry editable={!submitting} />
          <TouchableOpacity style={[styles.button, submitting && styles.buttonDisabled]} onPress={handleChangePassword} disabled={submitting}>
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Update password</Text>}
          </TouchableOpacity>
        </View>
      )}
      {!canChangePassword && user?.email ? <Text style={styles.hint}>This account uses Google sign-in. Password cannot be changed here.</Text> : null}
      <TouchableOpacity style={styles.logoutBtn} onPress={() => logout()}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 20, color: '#111' },
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#111' },
  label: { fontSize: 12, color: '#666', marginBottom: 4 },
  value: { fontSize: 16, color: '#111', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, marginBottom: 12, backgroundColor: '#fff' },
  button: { backgroundColor: '#2563eb', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontWeight: '600' },
  success: { color: '#059669', marginBottom: 8 },
  error: { color: '#b91c1c', marginBottom: 8 },
  hint: { color: '#666', marginBottom: 16 },
  logoutBtn: { marginTop: 8, paddingVertical: 12 },
  logoutText: { color: '#b91c1c', fontSize: 16 },
});
