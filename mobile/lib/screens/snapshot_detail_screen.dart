import 'package:flutter/material.dart';
import '../api/client.dart';

class SnapshotDetailScreen extends StatefulWidget {
  const SnapshotDetailScreen({
    super.key,
    required this.jobId,
    required this.snapshotId,
  });

  final String jobId;
  final String snapshotId;

  @override
  State<SnapshotDetailScreen> createState() => _SnapshotDetailScreenState();
}

class _SnapshotDetailScreenState extends State<SnapshotDetailScreen> {
  Map<String, dynamic>? _snapshot;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final data = await apiClient.get(
        '/api/jobs/${widget.jobId}/snapshots/${widget.snapshotId}',
      );
      if (mounted) setState(() {
            _snapshot = data;
            _loading = false;
          });
    } catch (e) {
      if (mounted) setState(() {
            _error = e.toString().replaceFirst('Exception: ', '');
            _loading = false;
          });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return Scaffold(
        appBar: AppBar(title: const Text('Snapshot')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }
    if (_error != null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Snapshot')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(_error!, textAlign: TextAlign.center),
                const SizedBox(height: 16),
                FilledButton(onPressed: _load, child: const Text('Retry')),
              ],
            ),
          ),
        ),
      );
    }
    final s = _snapshot!;
    final duration = s['duration_minutes'];
    final at = s['collected_at'] as String? ?? '';
    final steps = s['route_details']?['steps'] as List<dynamic>? ?? [];

    return Scaffold(
      appBar: AppBar(title: Text(duration != null ? '$duration min' : 'Snapshot')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          if (at.isNotEmpty) Text('Collected: $at'),
          const SizedBox(height: 16),
          const Text('Steps', style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          ...steps.map<Widget>((e) {
            final step = e as Map<String, dynamic>;
            final instr = step['instruction'] as String? ?? '';
            final dist = step['distance_text'] as String?;
            return Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.directions, size: 20),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      instr,
                      style: const TextStyle(fontSize: 14),
                    ),
                  ),
                  if (dist != null) Text(dist, style: const TextStyle(fontSize: 12)),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }
}
