import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:routewatch/main.dart';

void main() {
  testWidgets('App loads', (WidgetTester tester) async {
    await tester.pumpWidget(const RouteWatchApp());
    await tester.pumpAndSettle(const Duration(seconds: 3));
    expect(find.byType(MaterialApp), findsOneWidget);
  });
}
