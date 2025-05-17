import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen relative">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: 'url(/images/campus-library.jpg)' }}
      >
        <div className="absolute inset-0 bg-blue-900 bg-opacity-75"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-3xl mx-auto bg-white bg-opacity-90 p-8 rounded-lg shadow-xl">
          <h1 className="text-3xl font-bold text-black mb-6 border-b pb-3">
            About Us
          </h1>

          <div className="prose max-w-none">
            <p className="text-lg mb-4">
              The Smart Campus Services Portal is a role-based digital platform
              developed to streamline essential campus operations such as room
              bookings, timetable viewing, maintenance issue reporting, and
              announcements.
            </p>

            <p className="text-lg mb-4">
              Designed by a dedicated software engineering team, this solution
              empowers students, lecturers, and administrators with efficient
              tools that enhance productivity and communication across campus.
            </p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-5 rounded-lg shadow">
                <h3 className="font-bold text-lg text-blue-800 mb-2">
                  For Students
                </h3>
                <p>
                  Access timetables, book study rooms, and stay updated with
                  campus announcements.
                </p>
              </div>

              <div className="bg-blue-50 p-5 rounded-lg shadow">
                <h3 className="font-bold text-lg text-blue-800 mb-2">
                  For Lecturers
                </h3>
                <p>
                  Manage classroom bookings, track attendance, and communicate
                  with students effectively.
                </p>
              </div>

              <div className="bg-blue-50 p-5 rounded-lg shadow">
                <h3 className="font-bold text-lg text-blue-800 mb-2">
                  For Administrators
                </h3>
                <p>
                  Oversee facility usage, approve requests, and maintain smooth
                  campus operations.
                </p>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-bold text-black mb-3">
                Our Mission
              </h2>
              <p className="text-lg mb-4">
                To create a more connected and efficient campus environment
                through innovative digital solutions that simplify
                administrative tasks and enhance the educational experience for
                all members of our academic community.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
