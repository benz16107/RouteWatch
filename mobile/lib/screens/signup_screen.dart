import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../auth/auth_provider.dart';

class SignUpScreen extends StatefulWidget {
  const SignUpScreen({super.key});

  @override
  State<SignUpScreen> createState() => _SignUpScreenState();
}

class _SignUpScreenState extends State<SignUpScreen> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  String _error = '';
  bool _submitting = false;

  void _showUrlHint(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text(
          'On a physical device, use your computer\'s IP. Run: '
          'flutter run --dart-define=API_URL=http://YOUR_IP:3001',
        ),
        duration: Duration(seconds: 6),
      ),
    );
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final password = _passwordController.text;
    if (password.length < 8) {
      setState(() => _error = 'Password must be at least 8 characters');
      return;
    }
    setState(() {
      _error = '';
      _submitting = true;
    });
    try {
      await context.read<AuthProvider>().register(
            _nameController.text,
            _emailController.text,
            password,
          );
      if (mounted) Navigator.of(context).pushReplacementNamed('/');
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
    final showPassword = auth.passwordAuth;
    final showGoogle = auth.googleAuth;

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: BoxConstraints(
              minHeight: MediaQuery.of(context).size.height - 48,
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text(
                  'RouteWatch',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF111111),
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Create an account',
                  style: TextStyle(fontSize: 14, color: Color(0xFF666666)),
                ),
                const SizedBox(height: 20),
                if (_error.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: Text(
                      _error,
                      style: const TextStyle(color: Color(0xFFB91C1C), fontSize: 14),
                    ),
                  ),
                if (showGoogle) ...[
                  OutlinedButton(
                    onPressed: _submitting
                        ? null
                        : () async {
                            final url = Uri.parse(auth.googleSignInUrl);
                            try {
                              final launched = await launchUrl(
                                url,
                                mode: LaunchMode.externalApplication,
                              );
                              if (!launched && mounted) {
                                _showUrlHint(context);
                              }
                            } catch (_) {
                              if (mounted) _showUrlHint(context);
                            }
                          },
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      minimumSize: const Size(double.infinity, 48),
                    ),
                    child: const Text('Sign up with Google'),
                  ),
                  if (showPassword) const SizedBox(height: 12),
                ],
                if (showPassword) ...[
                  if (showGoogle)
                    const Text('or', style: TextStyle(color: Color(0xFF666666))),
                  if (showGoogle) const SizedBox(height: 12),
                  TextField(
                    controller: _nameController,
                    decoration: const InputDecoration(
                      labelText: 'Name',
                      border: OutlineInputBorder(),
                      hintText: 'Your name',
                    ),
                    enabled: !_submitting,
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: _emailController,
                    decoration: const InputDecoration(
                      labelText: 'Email',
                      border: OutlineInputBorder(),
                      hintText: 'you@example.com',
                    ),
                    keyboardType: TextInputType.emailAddress,
                    autocorrect: false,
                    textCapitalization: TextCapitalization.none,
                    enabled: !_submitting,
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: _passwordController,
                    decoration: const InputDecoration(
                      labelText: 'Password (min 8 characters)',
                      border: OutlineInputBorder(),
                    ),
                    obscureText: true,
                    enabled: !_submitting,
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton(
                      onPressed: _submitting ? null : () => _submit(),
                      child: _submitting
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Text('Create account'),
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextButton(
                    onPressed: () => Navigator.of(context).pushReplacementNamed('/login'),
                    child: const Text('Already have an account? Log in'),
                  ),
                ],
                if (!showPassword && !showGoogle)
                  const Text(
                    'No sign-in method configured.',
                    style: TextStyle(color: Color(0xFFB91C1C), fontSize: 14),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
