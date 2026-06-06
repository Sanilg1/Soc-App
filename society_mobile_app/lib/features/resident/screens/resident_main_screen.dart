import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'resident_home_screen.dart';
import '../../bookings/screens/hall_booking_list_screen.dart';
import '../../profile/screens/profile_screen.dart';

class ResidentMainScreen extends ConsumerStatefulWidget {
  const ResidentMainScreen({super.key});

  @override
  ConsumerState<ResidentMainScreen> createState() => _ResidentMainScreenState();
}

class _ResidentMainScreenState extends ConsumerState<ResidentMainScreen> {
  int _selectedIndex = 0;

  final List<Widget> _screens = const [
    ResidentHomeScreen(),
    HallBookingListScreen(),
    ProfileScreen(),
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  void _showOptionsBottomSheet(BuildContext context) {
    final theme = Theme.of(context);
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 20),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Quick Actions',
                        style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () => Navigator.pop(context),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  ListTile(
                    leading: CircleAvatar(
                      backgroundColor: Colors.blue.shade50,
                      child: Icon(Icons.add_task_rounded, color: Colors.blue.shade700),
                    ),
                    title: const Text('Add Complaint', style: TextStyle(fontWeight: FontWeight.w600)),
                    subtitle: const Text('Request electrician, plumber, housekeeping, or ironing'),
                    onTap: () {
                      Navigator.pop(context);
                      context.push('/complaint-create');
                    },
                  ),
                  ListTile(
                    leading: CircleAvatar(
                      backgroundColor: Colors.green.shade50,
                      child: Icon(Icons.event_seat_rounded, color: Colors.green.shade700),
                    ),
                    title: const Text('Book Community Hall', style: TextStyle(fontWeight: FontWeight.w600)),
                    subtitle: const Text('Reserve hall for private events'),
                    onTap: () {
                      Navigator.pop(context);
                      context.push('/hall-booking-create');
                    },
                  ),
                  ListTile(
                    leading: CircleAvatar(
                      backgroundColor: Colors.amber.shade50,
                      child: Icon(Icons.report_problem_rounded, color: Colors.amber.shade700),
                    ),
                    title: const Text('Report Society Issue', style: TextStyle(fontWeight: FontWeight.w600)),
                    subtitle: const Text('Report lift, gate, or common area issues'),
                    onTap: () {
                      Navigator.pop(context);
                      context.push('/society-issue-create');
                    },
                  ),
                  ListTile(
                    leading: CircleAvatar(
                      backgroundColor: Colors.orange.shade50,
                      child: Icon(Icons.receipt_long_rounded, color: Colors.orange.shade700),
                    ),
                    title: const Text('Ironing Bills', style: TextStyle(fontWeight: FontWeight.w600)),
                    subtitle: const Text('View outstanding ledger and history'),
                    onTap: () {
                      Navigator.pop(context);
                      context.push('/resident-bills');
                    },
                  ),
                  ListTile(
                    leading: CircleAvatar(
                      backgroundColor: Colors.teal.shade50,
                      child: Icon(Icons.contact_phone_rounded, color: Colors.teal.shade700),
                    ),
                    title: const Text('Worker Contacts', style: TextStyle(fontWeight: FontWeight.w600)),
                    subtitle: const Text('Directory of all society staff'),
                    onTap: () {
                      Navigator.pop(context);
                      context.push('/worker-directory');
                    },
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _selectedIndex,
        children: _screens,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex >= 2 ? _selectedIndex + 1 : _selectedIndex,
        onDestinationSelected: (index) {
          if (index == 2) {
            _showOptionsBottomSheet(context);
          } else {
            setState(() {
              _selectedIndex = index > 2 ? index - 1 : index;
            });
          }
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.event_available_outlined),
            selectedIcon: Icon(Icons.event_available),
            label: 'Bookings',
          ),
          NavigationDestination(
            icon: Icon(Icons.add_circle_outline, color: Colors.blue),
            selectedIcon: Icon(Icons.add_circle, color: Colors.blue),
            label: 'Actions',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}
