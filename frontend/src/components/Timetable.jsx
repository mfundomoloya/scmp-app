import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';

const Timetable = () => {
  const { user } = useContext(AuthContext);
  const [selectedDay, setSelectedDay] = useState('monday');
  const [isLoading, setIsLoading] = useState(true);
  const [timetableData, setTimetableData] = useState([]);
  const [currentWeek, setCurrentWeek] = useState('current');

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const timeSlots = [
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
  ];

  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    // Simulate API call
    setIsLoading(true);

    setTimeout(() => {
      const mockData = {
        monday: [
          {
            id: 1,
            courseName: 'Introduction to Computer Science',
            room: 'Lab 101',
            startTime: '09:00',
            endTime: '11:00',
            lecturer: 'Dr. Alan Smith',
          },
          {
            id: 2,
            courseName: 'Calculus I',
            room: 'Lecture Hall B',
            startTime: '13:00',
            endTime: '15:00',
            lecturer: 'Prof. Maria Johnson',
          },
        ],
        tuesday: [
          {
            id: 3,
            courseName: 'Physics for Engineers',
            room: 'Lab 203',
            startTime: '10:00',
            endTime: '12:00',
            lecturer: 'Dr. Robert Chen',
          },
          {
            id: 4,
            courseName: 'Database Design',
            room: 'Computer Lab 3',
            startTime: '14:00',
            endTime: '16:00',
            lecturer: 'Dr. Sarah Williams',
          },
        ],
        wednesday: [
          {
            id: 5,
            courseName: 'Web Development',
            room: 'Lab 101',
            startTime: '09:00',
            endTime: '11:00',
            lecturer: 'Prof. James Wilson',
          },
        ],
        thursday: [
          {
            id: 6,
            courseName: 'Data Structures',
            room: 'Lecture Hall A',
            startTime: '11:00',
            endTime: '13:00',
            lecturer: 'Dr. Alan Smith',
          },
          {
            id: 7,
            courseName: 'Mobile App Development',
            room: 'Computer Lab 3',
            startTime: '15:00',
            endTime: '17:00',
            lecturer: 'Dr. Lisa Zhang',
          },
        ],
        friday: [
          {
            id: 8,
            courseName: 'Professional Ethics',
            room: 'Lecture Hall C',
            startTime: '10:00',
            endTime: '11:00',
            lecturer: 'Prof. Carol Davis',
          },
          {
            id: 9,
            courseName: 'Project Planning',
            room: 'Seminar Room 2',
            startTime: '14:00',
            endTime: '16:00',
            lecturer: 'Dr. Michael Brown',
          },
        ],
      };

      setTimetableData(mockData);
      setIsLoading(false);
    }, 1500);
  }, [currentWeek]);

  const calculateSessionHeight = (startTime, endTime) => {
    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = parseInt(endTime.split(':')[0]);
    const duration = endHour - startHour;

    // Each hour is 6rem (96px) tall
    return `${duration * 6}rem`;
  };

  const calculateSessionTop = (startTime) => {
    const startHour = parseInt(startTime.split(':')[0]);
    const firstHour = parseInt(timeSlots[0].split(':')[0]);
    const hourOffset = startHour - firstHour;

    // Each hour is 6rem (96px) tall
    return `${hourOffset * 6}rem`;
  };

  // Get current week's date range
  const getCurrentWeekDates = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust when day is Sunday

    const monday = new Date(now.setDate(diff));
    const friday = new Date(now);
    friday.setDate(monday.getDate() + 4);

    return {
      monday: monday.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      friday: friday.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    };
  };

  const weekDates = getCurrentWeekDates();

  return (
    <div className="min-h-screen relative">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: 'url(/images/timetable-bg.jpg)' }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-75"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="bg-white bg-opacity-95 p-6 md:p-8 rounded-lg shadow-xl">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b pb-4">
            <h1 className="text-3xl font-bold text-black">
              Timetable
              {user && (
                <span className="text-xl text-gray-600 ml-2 font-normal">
                  for {user.name}
                </span>
              )}
            </h1>

            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <button
                onClick={() => setCurrentWeek('previous')}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              <span className="font-medium text-gray-700">
                {currentWeek === 'current'
                  ? `Week of ${weekDates.monday} - ${weekDates.friday}`
                  : currentWeek === 'previous'
                  ? 'Previous Week'
                  : 'Next Week'}
              </span>

              <button
                onClick={() => setCurrentWeek('next')}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Day tabs */}
          <div className="mb-6 border-b">
            <div className="flex overflow-x-auto">
              {days.map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-4 py-2 font-medium text-sm transition-colors whitespace-nowrap capitalize ${
                    selectedDay === day
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Timetable display */}
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
            </div>
          ) : (
            <div className="relative overflow-x-auto">
              {/* Time indicators */}
              <div className="flex">
                <div className="w-24 shrink-0">
                  <div className="h-6"></div> {/* Header spacer */}
                  {timeSlots.map((time) => (
                    <div
                      key={time}
                      className="h-24 flex items-start border-t pr-2 text-right text-gray-500 text-sm relative"
                    >
                      <span className="absolute -top-3 right-2">{time}</span>
                    </div>
                  ))}
                </div>

                {/* Classes display */}
                <div className="grow relative min-h-[40rem]">
                  {/* Empty state */}
                  {timetableData[selectedDay]?.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-12 w-12 text-gray-400 mx-auto mb-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-600 mb-1">
                          No Classes Scheduled
                        </h3>
                        <p className="text-gray-500">
                          You have no classes scheduled for {selectedDay}.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Session blocks */}
                  {timetableData[selectedDay]?.map((session) => (
                    <div
                      key={session.id}
                      className="absolute left-0 right-0 mx-4 rounded-md shadow-sm overflow-hidden bg-blue-100 border-l-4 border-blue-600"
                      style={{
                        top: calculateSessionTop(session.startTime),
                        height: calculateSessionHeight(
                          session.startTime,
                          session.endTime
                        ),
                      }}
                    >
                      <div className="p-3 h-full flex flex-col">
                        <h3 className="font-bold text-blue-800 truncate">
                          {session.courseName}
                        </h3>
                        <div className="mt-1 text-sm text-blue-700">
                          <div className="flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            {session.room}
                          </div>
                          <div className="flex items-center mt-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {session.startTime} - {session.endTime}
                          </div>
                          <div className="flex items-center mt-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
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
                            {session.lecturer}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="mt-8 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2">
              Legend
            </h3>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-100 border-l-4 border-blue-600 mr-2"></div>
                <span className="text-sm text-gray-600">Scheduled Class</span>
              </div>

              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-100 border-l-4 border-green-600 mr-2"></div>
                <span className="text-sm text-gray-600">Office Hours</span>
              </div>

              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-100 border-l-4 border-yellow-600 mr-2"></div>
                <span className="text-sm text-gray-600">Lab Sessions</span>
              </div>

              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-100 border-l-4 border-red-600 mr-2"></div>
                <span className="text-sm text-gray-600">Exams/Assessments</span>
              </div>
            </div>
          </div>

          {/* Export buttons */}
          <div className="mt-8 flex justify-end space-x-3">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">
              Download PDF
            </button>

            <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
              Add to Calendar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timetable;
