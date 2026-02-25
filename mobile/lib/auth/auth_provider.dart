import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../api/client.dart';
import '../config.dart';

const _tokenKey = 'routewatch_token';

class AuthProvider with ChangeNotifier {
  AuthProvider() {
    _loadToken().then((_) => _loadConfig());
  }

  final _storage = const FlutterSecureStorage();

  String? _token;
  bool _loading = true;
  bool _authenticated = false;
  bool _authEnabled = true;
  Map<String, dynamic>? _user;
  bool _passwordAuth = true;
  bool _googleAuth = true;

  String? get token => _token;
  bool get loading => _loading;
  bool get isAuthenticated => _authenticated;
  bool get authEnabled => _authEnabled;
  Map<String, dynamic>? get user => _user;
  bool get passwordAuth => _passwordAuth;
  bool get googleAuth => _googleAuth;

  Future<void> _loadToken() async {
    _token = await _storage.read(key: _tokenKey);
    apiClient.getToken = () => _token;
  }

  Future<void> _loadConfig() async {
    try {
      final data = await apiClient.get('/api/auth/config');
      _passwordAuth = data['passwordAuth'] == true;
      _googleAuth = data['googleAuth'] == true;
    } catch (_) {
      // keep defaults
    }
    try {
      if (_token != null) {
        final data = await apiClient.get('/api/auth/me');
        _authenticated = true;
        _authEnabled = data['authEnabled'] == true;
        _user = data['user'] as Map<String, dynamic>?;
      } else {
        _authenticated = false;
        _authEnabled = true;
        _user = null;
      }
    } catch (_) {
      _authenticated = false;
      _authEnabled = true;
      _user = null;
      await _storage.delete(key: _tokenKey);
      _token = null;
      apiClient.getToken = () => _token;
    }
    _loading = false;
    notifyListeners();
  }

  Future<void> checkAuth() async {
    await _loadToken();
    await _loadConfig();
  }

  Future<void> login(String email, String password) async {
    final data = await apiClient.post('/api/auth/login', {
      'email': email.trim().toLowerCase(),
      'password': password,
    });
    final t = data['token'] as String?;
    if (t != null) {
      _token = t;
      await _storage.write(key: _tokenKey, value: t);
      apiClient.getToken = () => _token;
    }
    _authenticated = true;
    _authEnabled = data['authEnabled'] == true;
    _user = data['user'] as Map<String, dynamic>?;
    notifyListeners();
  }

  Future<void> register(String name, String email, String password) async {
    final data = await apiClient.post('/api/auth/register', {
      'name': name.trim(),
      'email': email.trim().toLowerCase(),
      'password': password,
    });
    final t = data['token'] as String?;
    if (t != null) {
      _token = t;
      await _storage.write(key: _tokenKey, value: t);
      apiClient.getToken = () => _token;
    }
    _authenticated = true;
    _authEnabled = data['authEnabled'] == true;
    _user = data['user'] as Map<String, dynamic>?;
    notifyListeners();
  }

  Future<void> logout() async {
    try {
      await apiClient.post('/api/auth/logout');
    } catch (_) {}
    _token = null;
    _authenticated = false;
    _user = null;
    await _storage.delete(key: _tokenKey);
    apiClient.getToken = () => _token;
    notifyListeners();
  }

  String get googleSignInUrl => '${apiBaseUrl.replaceAll(RegExp(r'/$'), '')}/api/auth/google';
}
