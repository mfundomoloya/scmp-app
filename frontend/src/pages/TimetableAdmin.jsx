import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const TimetableAdmin = () => {
  const { user } = useContext(AuthContext);
  const [timetables, setTimetables] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [courses, setCourses] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editTimetableId, setEditTimetableId] = useState(null);
  const [filterCourse, setFilterCourse] = useState('');
  const [formData, setFormData] = useState({
    courseCode: '',
    subject: '',
    roomName: '',
    day: 'Monday',
    startTime: '09:00',
    endTime: '11:00',
    lecturerEmails: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [timetablesRes, coursesRes, roomsRes, lecturersRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/timetable/all`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/courses`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/rooms`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/users?role=lecturer`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
        ]);
        setTimetables(Array.isArray(timetablesRes.data.timetables) ? timetablesRes.data.timetables : []);
        setConflicts(Array.isArray(timetablesRes.data.conflicts) ? timetablesRes.data.conflicts : []);
        setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : []);
        setRooms(Array.isArray(roomsRes.data) ? roomsRes.data : []);
        setLecturers(Array.isArray(lecturersRes.data) ? lecturersRes.data : []);
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };
    if (user && user.role === 'admin') {
      fetchData();
    } else {
      setIsLoading(false);
      setError('Unauthorized access');
    }
  }, [user]);

  // Auto-select the only lecturer when form is shown and not in edit mode
  useEffect(() => {
    if (
      showForm &&
      !editMode &&
      lecturers.length === 1 &&
      formData.lecturerEmails.length === 0
    ) {
      setFormData(prev => ({
        ...prev,
        lecturerEmails: [lecturers[0].email],
      }));
    }
  }, [lecturers, showForm, editMode, formData.lecturerEmails.length]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'courseCode') {
      setFormData({ ...formData, courseCode: value, subject: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleLecturerChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map((option) => option.value);
    setFormData({ ...formData, lecturerEmails: selectedOptions });
  };

  const resetForm = () => {
    setFormData({
      courseCode: '',
      subject: '',
      roomName: '',
      day: 'Monday',
      startTime: '09:00',
      endTime: '11:00',
      lecturerEmails: [],
    });
    setEditMode(false);
    setEditTimetableId(null);
    setShowForm(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.lecturerEmails || formData.lecturerEmails.length === 0) {
      setError('Please select at least one lecturer.');
      setTimeout(() => setError(null), 3000);
      return;
    }
    if (new Date(`1970-01-01T${formData.endTime}:00`) <= new Date(`1970-01-01T${formData.startTime}:00`)) {
      setError('End time must be after start time');
      setTimeout(() => setError(null), 3000);
      return;
    }
    try {
      const payload = {
        ...formData,
        lecturerEmails: formData.lecturerEmails,
      };
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/timetable`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTimetables([...timetables, res.data]);
      setSuccess('Timetable created successfully');
      resetForm();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to create timetable');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleEdit = (timetable) => {
    setFormData({
      courseCode: timetable.courseId.code,
      subject: timetable.subject,
      roomName: timetable.roomId.name,
      day: timetable.day,
      startTime: new Date(timetable.startTime).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      endTime: new Date(timetable.endTime).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      lecturerEmails: timetable.userIds.filter(u => u.role === 'lecturer').map(u => u.email),
    });
    setEditMode(true);
    setEditTimetableId(timetable._id);
    setShowForm(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (new Date(`1970-01-01T${formData.endTime}:00`) <= new Date(`1970-01-01T${formData.startTime}:00`)) {
      setError('End time must be after start time');
      setTimeout(() => setError(null), 3000);
      return;
    }
    try {
      const payload = {
        ...formData,
        lecturerEmails: formData.lecturerEmails,
      };
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/timetable/${editTimetableId}`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTimetables(timetables.map(t => t._id === editTimetableId ? res.data : t));
      setSuccess('Timetable updated successfully');
      resetForm();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update timetable');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDelete = async (timetableId) => {
    if (!window.confirm('Are you sure you want to delete this timetable?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/timetable/${timetableId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTimetables(timetables.filter(t => t._id !== timetableId));
      setSuccess('Timetable deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to delete timetable');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleFilter = async () => {
    if (!filterCourse) {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/timetable/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTimetables(res.data.timetables);
      setConflicts(res.data.conflicts);
      return;
    }
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/timetable/filter`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        params: { courseCode: filterCourse },
      });
      setTimetables(res.data.timetables);
      setConflicts(res.data.conflicts);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to filter timetables');
      setTimeout(() => setError(null), 3000);
    }
  };

  const selectedCourse = courses.find(course => course.code === formData.courseCode);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-800 flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (error && !showForm) {
    return (
      <div className="min-h-screen bg-gray-800 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="bg-red-600 text-white p-4 rounded-lg max-w-3xl w-full">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">Admin Timetable Management</h1>
        {success && (
          <div className="bg-green-600 text-white p-4 rounded-lg mb-6 animate-fade-in">
            <p>{success}</p>
          </div>
        )}
        {error && (
          <div className="bg-red-600 text-white p-4 rounded-lg mb-6 animate-fade-in">
            <p>{error}</p>
          </div>
        )}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="p-2 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Courses</option>
              {courses.map(course => (
                <option key={course._id} value={course.code}>{course.code}</option>
              ))}
            </select>
            <button
              onClick={handleFilter}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Filter
            </button>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); if (editMode) resetForm(); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showForm ? 'Cancel' : 'Create Timetable'}
          </button>
        </div>
        {showForm && (
          <div className="bg-gray-900 p-6 rounded-lg shadow-xl mb-8">
            <h2 className="text-2xl font-semibold text-white mb-6">{editMode ? 'Edit Timetable' : 'Create Timetable'}</h2>
            <form onSubmit={editMode ? handleUpdate : handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 mb-2">Course</label>
                <select
                  name="courseCode"
                  value={formData.courseCode}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Course</option>
                  {courses.map(course => (
                    <option key={course._id} value={course.code}>{course.code} - {course.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Subject</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={!selectedCourse}
                >
                  <option value="">Select Subject</option>
                  {selectedCourse?.subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Room</label>
                <select
                  name="roomName"
                  value={formData.roomName}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Room</option>
                  {rooms.map(room => (
                    <option key={room._id} value={room.name}>{room.name} (Capacity: {room.capacity})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Day</label>
                <select
                  name="day"
                  value={formData.day}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Start Time</label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">End Time</label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-300 mb-2">Lecturers</label>
                <select
                  name="lecturerEmails"
                  multiple
                  value={formData.lecturerEmails}
                  onChange={handleLecturerChange}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {lecturers.map(lecturer => (
                    <option key={lecturer._id} value={lecturer.email}>{lecturer.email}</option>
                  ))}
                </select>
                <p className="text-gray-400 text-sm mt-1">Hold Ctrl/Cmd to select multiple lecturers</p>
              </div>
              <div className="md:col-span-2 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {editMode ? 'Update Timetable' : 'Create Timetable'}
                </button>
              </div>
            </form>
          </div>
        )}
        {conflicts.length > 0 && (
          <div className="bg-yellow-600 text-white p-6 rounded-lg mb-8">
            <h3 className="text-xl font-semibold mb-4">Timetable Conflicts</h3>
            {conflicts.map((conflict, index) => (
              <div key={index} className="mb-2">
                <p>
                  Conflict between{' '}
                  <button
                    onClick={() => handleEdit(timetables.find(t => t._id === conflict.timetable1.id))}
                    className="text-blue-300 hover:text-blue-100 underline"
                  >
                    {conflict.timetable1.course} ({conflict.timetable1.subject})
                  </button>{' '}
                  and{' '}
                  <button
                    onClick={() => handleEdit(timetables.find(t => t._id === conflict.timetable2.id))}
                    className="text-blue-300 hover:text-blue-100 underline"
                  >
                    {conflict.timetable2.course} ({conflict.timetable2.subject})
                  </button>{' '}
                  on {conflict.timetable1.day} from{' '}
                  {new Date(conflict.timetable1.startTime).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })} to{' '}
                  {new Date(conflict.timetable1.endTime).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}.
                </p>
              </div>
            ))}
          </div>
        )}
        {timetables.length === 0 ? (
          <div className="bg-gray-900 p-6 rounded-lg text-gray-400 text-center">
            No timetables found. Create a new timetable to get started.
          </div>
        ) : (
          <div className="overflow-x-auto bg-gray-900 rounded-lg shadow-xl">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-800 text-gray-300 uppercase text-sm">
                  <th className="px-6 py-4 text-left">Course</th>
                  <th className="px-6 py-4 text-left">Subject</th>
                  <th className="px-6 py-4 text-left">Room</th>
                  <th className="px-6 py-4 text-left">Day</th>
                  <th className="px-6 py-4 text-left">Time</th>
                  <th className="px-6 py-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {timetables.map(timetable => (
                  <tr key={timetable._id} className="hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 text-white">{timetable.courseId?.code || 'N/A'}</td>
                    <td className="px-6 py-4 text-white">{timetable.subject || 'N/A'}</td>
                    <td className="px-6 py-4 text-white">{timetable.roomId?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-white">{timetable.day || 'N/A'}</td>
                    <td className="px-6 py-4 text-white">
                      {new Date(timetable.startTime).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })} -{' '}
                      {new Date(timetable.endTime).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 text-white">
                      <button
                        onClick={() => handleEdit(timetable)}
                        className="text-blue-400 hover:text-blue-300 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(timetable._id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimetableAdmin;