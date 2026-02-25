import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config.dart';

class ApiClient {
  ApiClient({this.getToken});

  String? Function()? getToken;

  String get _base => apiBaseUrl.endsWith('/') ? apiBaseUrl : apiBaseUrl;

  Future<Map<String, dynamic>> _request(
    String method,
    String path, {
    Map<String, dynamic>? body,
  }) async {
    final uri = Uri.parse('$_base${path.startsWith('/') ? path : '/$path'}');
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    final token = getToken?.call();
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }
    http.Response response;
    switch (method) {
      case 'GET':
        response = await http.get(uri, headers: headers);
        break;
      case 'POST':
        response = await http.post(
          uri,
          headers: headers,
          body: body != null ? jsonEncode(body) : null,
        );
        break;
      case 'PATCH':
        response = await http.patch(
          uri,
          headers: headers,
          body: body != null ? jsonEncode(body) : null,
        );
        break;
      case 'DELETE':
        response = await http.delete(uri, headers: headers);
        break;
      default:
        throw Exception('Unsupported method: $method');
    }
    final text = response.body;
    if (text.trim().isEmpty) {
      throw Exception(response.statusCode == 401 ? 'Not authenticated' : 'Empty response');
    }
    final data = jsonDecode(text) as Map<String, dynamic>?;
    if (response.statusCode >= 400) {
      final msg = data?['error'] as String? ?? 'Request failed: ${response.statusCode}';
      throw Exception(msg);
    }
    return data ?? {};
  }

  Future<Map<String, dynamic>> get(String path) => _request('GET', path);
  Future<Map<String, dynamic>> post(String path, [Map<String, dynamic>? body]) =>
      _request('POST', path, body: body);
  Future<Map<String, dynamic>> patch(String path, [Map<String, dynamic>? body]) =>
      _request('PATCH', path, body: body);
  Future<Map<String, dynamic>> delete(String path) => _request('DELETE', path);
}

final apiClient = ApiClient();
