import React from 'react';

const Privacy = () => {
  return (
    <div className="min-h-screen relative">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: 'url(/images/data-security.jpg)' }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-80"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-3xl mx-auto bg-white bg-opacity-95 p-8 rounded-lg shadow-xl">
          <h1 className="text-3xl font-bold text-black mb-6 border-b pb-3">
            Privacy Policy
          </h1>

          <div className="prose max-w-none">
            <p className="text-lg mb-6">
              We respect your privacy. All personal data collected through the
              Smart Campus Services Portal—including login credentials, booking
              details, and feedback—are stored securely and used strictly to
              provide campus services. We do not share or sell user data to
              third parties.
            </p>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">
                Information We Collect
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Account information (name, email, student/staff ID)</li>
                <li>Usage data (room bookings, service requests)</li>
                <li>System logs for security and performance monitoring</li>
                <li>Feedback and communication submitted through the portal</li>
              </ul>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">
                How We Use Your Information
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>To authenticate your access to the platform</li>
                <li>
                  To provide the requested services (bookings, announcements)
                </li>
                <li>To maintain and improve the portal's functionality</li>
                <li>
                  To communicate important information about your account or the
                  services
                </li>
                <li>To ensure platform security and prevent misuse</li>
              </ul>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">
                Data Security
              </h2>
              <p className="text-lg mb-4">
                We implement robust security measures to protect your personal
                information from unauthorized access, alteration, or disclosure.
                These measures include:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Encryption of sensitive data</li>
                <li>Regular security audits and updates</li>
                <li>Role-based access controls for system administrators</li>
                <li>Secure data backup procedures</li>
              </ul>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">
                Your Rights
              </h2>
              <p className="text-lg mb-4">
                As a user of the Smart Campus Services Portal, you have the
                right to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access the personal data we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>
                  Request deletion of your data (subject to academic record
                  requirements)
                </li>
                <li>Receive a copy of your data in a structured format</li>
              </ul>
            </div>

            <div className="p-5 bg-blue-50 rounded-lg border-l-4 border-blue-500 shadow">
              <p className="text-lg">
                By using our platform, you consent to data handling in
                accordance with industry standards and applicable data
                protection regulations. For any privacy-related inquiries,
                please contact our data protection officer at
                privacy@smartcampusportal.edu.
              </p>
            </div>

            <p className="text-sm text-gray-600 mt-8">
              Last updated: April 15, 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
