import 'package:flutter/material.dart';
import '../api/client.dart';

class NewJobScreen extends StatelessWidget {
  const NewJobScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return _JobFormScreen(
      title: 'New job',
      jobId: null,
      initialJob: null,
    );
  }
}

class EditJobScreen extends StatelessWidget {
  const EditJobScreen({super.key, required this.jobId, required this.job});

  final String jobId;
  final Map<String, dynamic> job;

  @override
  Widget build(BuildContext context) {
    return _JobFormScreen(
      title: 'Edit job',
      jobId: jobId,
      initialJob: job,
    );
  }
}

class _JobFormScreen extends StatefulWidget {
  const _JobFormScreen({
    required this.title,
    required this.jobId,
    required this.initialJob,
  });

  final String title;
  final String? jobId;
  final Map<String, dynamic>? initialJob;

  @override
  State<_JobFormScreen> createState() => _JobFormScreenState();
}

class _JobFormScreenState extends State<_JobFormScreen> {
  final _startController = TextEditingController();
  final _endController = TextEditingController();
  final _intervalController = TextEditingController(text: '5');
  String _error = '';
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    final j = widget.initialJob;
    if (j != null) {
      _startController.text = (j['start_address'] ?? j['start_label'] ?? '') as String;
      _endController.text = (j['end_address'] ?? j['end_label'] ?? '') as String;
      final interval = j['interval_minutes'];
      _intervalController.text = interval != null ? '$interval' : '5';
    }
  }

  @override
  void dispose() {
    _startController.dispose();
    _endController.dispose();
    _intervalController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() {
      _error = '';
      _submitting = true;
    });
    try {
      final interval = int.tryParse(_intervalController.text) ?? 5;
      if (widget.jobId != null) {
        await apiClient.patch('/api/jobs/${widget.jobId}', {
          'start_address': _startController.text.trim(),
          'end_address': _endController.text.trim(),
          'interval_minutes': interval,
        });
      } else {
        await apiClient.post('/api/jobs', {
          'start_address': _startController.text.trim(),
          'end_address': _endController.text.trim(),
          'interval_minutes': interval,
          'duration_minutes': 60,
          'navigation_type': 'driving',
        });
      }
      if (mounted) Navigator.of(context).pop();
    } catch (e) {
      if (mounted) setState(() {
            _error = e.toString().replaceFirst('Exception: ', '');
            _submitting = false;
          });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.title)),
      body: SingleChildScrollView(
        keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (_error.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Text(
                  _error,
                  style: const TextStyle(color: Color(0xFFB91C1C)),
                ),
              ),
            TextField(
              controller: _startController,
              decoration: const InputDecoration(
                labelText: 'Start address',
                border: OutlineInputBorder(),
              ),
              enabled: !_submitting,
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _endController,
              decoration: const InputDecoration(
                labelText: 'End address',
                border: OutlineInputBorder(),
              ),
              enabled: !_submitting,
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _intervalController,
              decoration: const InputDecoration(
                labelText: 'Interval (minutes)',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.number,
              enabled: !_submitting,
            ),
            const SizedBox(height: 24),
            FilledButton(
              onPressed: _submitting ? null : _submit,
              child: _submitting
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : Text(widget.jobId != null ? 'Save' : 'Create'),
            ),
          ],
        ),
      ),
    );
  }
}
