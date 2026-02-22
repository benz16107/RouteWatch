import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function SignUpScreen({ navigation }) {
  const { register, authConfig } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setSubmitting(true);
    try {
      await register(name.trim(), email.trim().toLowerCase(), password);
    } catch (err) {
      setError(err?.message || 'Sign up failed');
    } finally {
      setSubmitting(false);
    }
  };

  const showPassword = authConfig.passwordAuth;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>RouteWatch</Text>
        <Text style={styles.subtitle}>Create an account</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {showPassword && (
          <>
            <Text style={styles.label}>Name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor="#888" editable={!submitting} />
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#888"
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!submitting}
            />
            <Text style={styles.label}>Password (min 8 characters)</Text>
            <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor="#888" secureTextEntry editable={!submitting} />
            <TouchableOpacity style={[styles.button, submitting && styles.buttonDisabled]} onPress={handleSubmit} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign up</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkWrap} onPress={() => navigation.replace('Login')}>
              <Text style={styles.link}>Already have an account? Log in</Text>
            </TouchableOpacity>
          </>
        )}
        {!showPassword && <Text style={styles.error}>No sign-in method configured.</Text>}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f5f5f5' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 4, color: '#111' },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 20 },
  error: { color: '#b91c1c', fontSize: 14, marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, marginBottom: 16, backgroundColor: '#fff' },
  button: { backgroundColor: '#2563eb', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  linkWrap: { marginTop: 16, alignItems: 'center' },
  link: { color: '#2563eb', fontSize: 14 },
});
