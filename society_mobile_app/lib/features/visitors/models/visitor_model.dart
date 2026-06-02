class Visitor {
  final String id;
  final String name;
  final String flatId;
  final String company;
  final String purpose;
  final String status; // pending, approved, denied
  final DateTime timestamp;

  Visitor({
    required this.id,
    required this.name,
    required this.flatId,
    required this.company,
    required this.purpose,
    required this.status,
    required this.timestamp,
  });

  factory Visitor.fromMap(Map<String, dynamic> data, String documentId) {
    return Visitor(
      id: documentId,
      name: data['name'] ?? '',
      flatId: data['flatId'] ?? '',
      company: data['company'] ?? '',
      purpose: data['purpose'] ?? '',
      status: data['status'] ?? 'pending',
      timestamp: data['timestamp'] != null ? DateTime.parse(data['timestamp']) : DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'name': name,
      'flatId': flatId,
      'company': company,
      'purpose': purpose,
      'status': status,
      'timestamp': timestamp.toIso8601String(),
    };
  }
}
