/// API base URL (no trailing slash).
/// Override with: flutter run --dart-define=API_URL=http://10.0.2.2:3001
/// Android emulator: use 10.0.2.2 for localhost. iOS simulator: localhost is fine.
const String apiBaseUrl = String.fromEnvironment(
  'API_URL',
  defaultValue: 'http://localhost:3001',
);
