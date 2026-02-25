import 'package:flutter/material.dart';
import '../api/client.dart';
import 'new_job_screen.dart';
import 'snapshot_detail_screen.dart';

class JobDetailScreen extends StatefulWidget {
  const JobDetailScreen({super.key, required this.jobId});

  final String jobId;

  @override
  State<JobDetailScreen> createState() => _JobDetailScreenState();
}

class _JobDetailScreenState extends State<JobDetailScreen> {
  Map<String, dynamic>? _job;
  List<dynamic> _snapshots = [];
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
      final jobData = await apiClient.get('/api/jobs/${widget.jobId}');
      final snapData = await apiClient.get('/api/jobs/${widget.jobId}/snapshots');
      if (mounted) {
        setState(() {
          _job = jobData;
          _snapshots = snapData['snapshots'] as List<dynamic>? ?? [];
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() {
            _error = e.toString().replaceFirst('Exception: ', '');
            _loading = false;
          });
    }
  }

  Future<void> _action(String action) async {
    try {
      await apiClient.post('/api/jobs/${widget.jobId}/$action');
      _load();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString().replaceFirst('Exception: ', ''))),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return Scaffold(
        appBar: AppBar(title: const Text('Job')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }
    if (_error != null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Job')),
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
    final job = _job!;
    final status = job['status'] as String? ?? '';
    final startLabel = job['start_label'] as String? ?? 'Start';
    final endLabel = job['end_label'] as String? ?? 'End';

    return Scaffold(
      appBar: AppBar(
        title: Text(startLabel),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _load,
          ),
          IconButton(
            icon: const Icon(Icons.edit),
            onPressed: () async {
              await Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => EditJobScreen(jobId: widget.jobId, job: job),
                ),
              );
              _load();
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              endLabel,
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                if (status == 'running')
                  FilledButton.tonal(
                    onPressed: () => _action('pause'),
                    child: const Text('Pause'),
                  ),
                if (status == 'paused')
                  FilledButton.tonal(
                    onPressed: () => _action('resume'),
                    child: const Text('Resume'),
                  ),
                if (status == 'running')
                  OutlinedButton(
                    onPressed: () => _action('stop'),
                    child: const Text('Stop'),
                  ),
                if (status != 'running' && status != 'paused')
                  FilledButton(
                    onPressed: () => _action('start'),
                    child: const Text('Start'),
                  ),
              ],
            ),
            const SizedBox(height: 24),
            Text(
              'Snapshots (${_snapshots.length})',
              style: Theme.of(context).textTheme.titleSmall,
            ),
            const SizedBox(height: 8),
            if (_snapshots.isEmpty)
              const Text('No snapshots yet.')
            else
              ..._snapshots.map<Widget>((s) {
                final sn = s as Map<String, dynamic>;
                final sid = sn['id'] as String? ?? '';
                final duration = sn['duration_minutes'];
                final at = sn['collected_at'] as String? ?? '';
                return Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: ListTile(
                    title: Text(
                      duration != null ? '${duration} min' : at,
                    ),
                    subtitle: at.isNotEmpty ? Text(at) : null,
                    onTap: () => Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => SnapshotDetailScreen(
                          jobId: widget.jobId,
                          snapshotId: sid,
                        ),
                      ),
                    ),
                  ),
                );
              }),
          ],
        ),
      ),
    );
  }
}
