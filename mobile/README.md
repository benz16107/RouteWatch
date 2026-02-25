# RouteWatch (Flutter)

Mobile app for RouteWatch. Requires the backend to be running.

## Run

```bash
flutter pub get
flutter run
```

## API URL (important for device / emulator)

Default is `http://localhost:3001`, which **only works in an emulator** where localhost is the host machine.

### Physical device (e.g. Pixel, iPhone)

On a real device, **localhost is the phone**, not your computer. You must use your computer's LAN IP:

1. Find your computer's IP (same Wi‑Fi as the phone):
   - **Mac:** Terminal → `ifconfig | grep "inet " | grep -v 127.0.0.1` → use the `192.168.x.x` or `10.x.x.x` address.
   - **Windows:** `ipconfig` → IPv4 address of your Wi‑Fi adapter.
2. Start the backend on your computer (`npm run dev:backend` from the project root).
3. Run the app with that IP:
   ```bash
   flutter run --dart-define=API_URL=http://192.168.1.5:3001
   ```
   Replace `192.168.1.5` with your actual IP.

Without this, the app and "Sign in with Google" will try to reach `localhost:3001` on the device and fail.

### Android emulator

```bash
flutter run --dart-define=API_URL=http://10.0.2.2:3001
```

### iOS simulator

`localhost` is fine; no override needed.

---

Ensure the backend is reachable at the URL you use (same network for a physical device).
