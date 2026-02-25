import 'package:flutter/material.dart';
import '../api/client.dart';
import 'job_detail_screen.dart';
import 'new_job_screen.dart';

class JobsListScreen extends StatefulWidget {
  const JobsListScreen({super.key});

  @override
  State<JobsListScreen> createState() => _JobsListScreenState();
}

class _JobsListScreenState extends State<JobsListScreen> {
  List<dynamic> _jobs = [];
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
      final data = await apiClient.get('/api/jobs');
      final list = data['jobs'] as List<dynamic>? ?? [];
      if (mounted) setState(() {
            _jobs = list;
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
    return Scaffold(
      appBar: AppBar(
        title: const Text('Jobs'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loading ? null : _load,
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(_error!, textAlign: TextAlign.center),
                        const SizedBox(height: 16),
                        FilledButton(
                          onPressed: () => _load(),
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  ),
                )
              : _jobs.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Text('No jobs yet. Create one to start tracking.'),
                          const SizedBox(height: 16),
                          FilledButton.icon(
                            onPressed: () async {
                              await Navigator.of(context).push(
                                MaterialPageRoute(
                                  builder: (_) => const NewJobScreen(),
                                ),
                              );
                              _load();
                            },
                            icon: const Icon(Icons.add),
                            label: const Text('New job'),
                          ),
                        ],
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: _load,
                      child: ListView.builder(
                        padding: const EdgeInsets.all(8),
                        itemCount: _jobs.length,
                        itemBuilder: (context, i) {
                          final job = _jobs[i] as Map<String, dynamic>;
                          final id = job['id'] as String? ?? '';
                          final status = job['status'] as String? ?? '';
                          final startLabel = job['start_label'] as String? ?? '';
                          final endLabel = job['end_label'] as String? ?? '';
                          return Card(
                            margin: const EdgeInsets.symmetric(vertical: 4),
                            child: ListTile(
                              title: Text(startLabel.isNotEmpty ? startLabel : 'Job'),
                              subtitle: Text(
                                endLabel.isNotEmpty ? endLabel : id,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              trailing: Chip(
                                label: Text(
                                  status,
                                  style: const TextStyle(fontSize: 12),
                                ),
                              ),
                              onTap: () async {
                                await Navigator.of(context).push(
                                  MaterialPageRoute(
                                    builder: (_) => JobDetailScreen(jobId: id),
                                  ),
                                );
                                _load();
                              },
                            ),
                          );
                        },
                      ),
                    ),
      floatingActionButton: _error == null
          ? FloatingActionButton(
              onPressed: () async {
                await Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => const NewJobScreen(),
                  ),
                );
                _load();
              },
              child: const Icon(Icons.add),
            )
          : null,
    );
  }
}
