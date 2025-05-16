import React from 'react';

const About = () => {
  // Color scheme variables
  const blueColor = '#1d4ed8';
  const lightBlueColor = '#dbeafe';
  const veryLightBlueColor = '#eff6ff';
  //const mediumBlueColor = '#2563eb';

  return (
    <div className="min-h-screen relative">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: 'url(/images/campus-library.jpg)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue to-blue-900 bg-opacity-80"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div
          className="max-w-3xl mx-auto bg-white bg-opacity-95 p-8 md:p-10 rounded-xl shadow-2xl"
          // style={{ borderTop: `4px solid ${blueColor}` }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-black mb-8 pb-4 border-b border-gray-200">
            About Us
          </h1>

          <div className="prose max-w-none">
            <p className="text-lg mb-6 leading-relaxed text-gray-700">
              The Smart Campus Services Portal is a role-based digital platform
              developed to streamline essential campus operations such as room
              bookings, timetable viewing, maintenance issue reporting, and
              announcements.
            </p>

            <p className="text-lg mb-6 leading-relaxed text-gray-700">
              Designed by a dedicated software engineering team, this solution
              empowers students, lecturers, and administrators with efficient
              tools that enhance productivity and communication across campus.
            </p>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div
                className="p-6 rounded-xl shadow-md transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                style={{ backgroundColor: veryLightBlueColor }}
              >
                <div className="flex items-center mb-3">
                  <div
                    className="flex items-center justify-center h-10 w-10 rounded-full mr-3"
                    style={{ backgroundColor: lightBlueColor }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      style={{ color: blueColor }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                  <h3
                    className="font-bold text-lg"
                    style={{ color: blueColor }}
                  >
                    For Students
                  </h3>
                </div>
                <p className="text-gray-700 leading-relaxed ml-13">
                  Access timetables, book study rooms, and stay updated with
                  campus announcements.
                </p>
              </div>

              <div
                className="p-6 rounded-xl shadow-md transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                style={{ backgroundColor: veryLightBlueColor }}
              >
                <div className="flex items-center mb-3">
                  <div
                    className="flex items-center justify-center h-10 w-10 rounded-full mr-3"
                    style={{ backgroundColor: lightBlueColor }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      style={{ color: blueColor }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <h3
                    className="font-bold text-lg"
                    style={{ color: blueColor }}
                  >
                    For Lecturers
                  </h3>
                </div>
                <p className="text-gray-700 leading-relaxed ml-13">
                  Manage classroom bookings, track attendance, and communicate
                  with students effectively.
                </p>
              </div>

              <div
                className="p-6 rounded-xl shadow-md transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                style={{ backgroundColor: veryLightBlueColor }}
              >
                <div className="flex items-center mb-3">
                  <div
                    className="flex items-center justify-center h-10 w-10 rounded-full mr-3"
                    style={{ backgroundColor: lightBlueColor }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      style={{ color: blueColor }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <h3
                    className="font-bold text-lg"
                    style={{ color: blueColor }}
                  >
                    For Administrators
                  </h3>
                </div>
                <p className="text-gray-700 leading-relaxed ml-13">
                  Oversee facility usage, approve requests, and maintain smooth
                  campus operations.
                </p>
              </div>
            </div>

            <div
              className="mt-10 p-6 rounded-xl"
              style={{
                backgroundColor: veryLightBlueColor,
                borderLeft: `4px solid ${blueColor}`,
              }}
            >
              <h2
                className="text-2xl font-bold mb-4"
                style={{ color: blueColor }}
              >
                Our Mission
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
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
