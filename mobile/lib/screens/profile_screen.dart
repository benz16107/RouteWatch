import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../api/client.dart';
import '../auth/auth_provider.dart';
import 'login_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _currentController = TextEditingController();
  final _newController = TextEditingController();
  String _error = '';
  String _success = '';
  bool _submitting = false;

  @override
  void dispose() {
    _currentController.dispose();
    _newController.dispose();
    super.dispose();
  }

  Future<void> _changePassword() async {
    final current = _currentController.text;
    final newP = _newController.text;
    if (newP.length < 8) {
      setState(() => _error = 'New password must be at least 8 characters');
      return;
    }
    setState(() {
      _error = '';
      _success = '';
      _submitting = true;
    });
    try {
      await apiClient.post('/api/auth/change-password', {
        'current_password': current,
        'new_password': newP,
      });
      if (mounted) setState(() {
            _success = 'Password updated.';
            _submitting = false;
            _currentController.clear();
            _newController.clear();
          });
    } catch (e) {
      if (mounted) setState(() {
            _error = e.toString().replaceFirst('Exception: ', '');
            _submitting = false;
          });
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user;
    final name = user?['name'] as String? ?? 'Profile';
    final email = user?['email'] as String? ?? '';

    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              name,
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            if (email.isNotEmpty)
              Text(
                email,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Colors.grey,
                    ),
              ),
            const SizedBox(height: 24),
            const Text('Change password', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            if (_error.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Text(_error, style: const TextStyle(color: Color(0xFFB91C1C))),
              ),
            if (_success.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Text(_success, style: const TextStyle(color: Color(0xFF16A34A))),
              ),
            TextField(
              controller: _currentController,
              decoration: const InputDecoration(
                labelText: 'Current password',
                border: OutlineInputBorder(),
              ),
              obscureText: true,
              enabled: !_submitting,
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _newController,
              decoration: const InputDecoration(
                labelText: 'New password (min 8 characters)',
                border: OutlineInputBorder(),
              ),
              obscureText: true,
              enabled: !_submitting,
            ),
            const SizedBox(height: 12),
            FilledButton(
              onPressed: _submitting ? null : _changePassword,
              child: _submitting
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Update password'),
            ),
            const SizedBox(height: 32),
            OutlinedButton(
              onPressed: () async {
                await auth.logout();
                if (context.mounted) {
                  Navigator.of(context).pushAndRemoveUntil(
                    MaterialPageRoute(builder: (_) => const LoginScreen()),
                    (_) => false,
                  );
                }
              },
              child: const Text('Sign out'),
            ),
          ],
        ),
      ),
    );
  }
}
