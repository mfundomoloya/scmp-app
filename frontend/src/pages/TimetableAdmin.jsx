import { useState, useEffect, useContext } from 'react';
  import { AuthContext } from '../context/AuthContext';
  import axios from 'axios';

  const TimetableAdmin = () => {
    const { user } = useContext(AuthContext);
    const [timetables, setTimetables] = useState([]);
    const [courses, setCourses] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(null);
    const [creating, setCreating] = useState(false);
    const [formData, setFormData] = useState({
      courseCode: '',
      subject: '',
      roomName: '',
      day: '',
      startTime: '',
      endTime: '',
      lecturerEmails: '',
    });

    console.log('TimetableAdmin: Component mounted');
    console.log('TimetableAdmin: User:', JSON.stringify(user, null, 2));

    useEffect(() => {
      const fetchData = async () => {
        setLoading(true);
        try {
          console.log('TimetableAdmin: Fetching timetables and courses');
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('No authentication token found');
          }
          const [timetableResponse, courseResponse] = await Promise.all([
            axios.get(`${import.meta.env.VITE_API_URL}/api/timetable/all`, {
              headers: { 'x-auth-token': token },
            }),
            axios.get(`${import.meta.env.VITE_API_URL}/api/courses`, {
              headers: { 'x-auth-token': token },
            }),
          ]);
          console.log('TimetableAdmin: Fetched timetables:', timetableResponse.data);
          console.log('TimetableAdmin: Fetched courses:', courseResponse.data);
          setTimetables(timetableResponse.data);
          setCourses(courseResponse.data);
          if (courseResponse.data.length === 0) {
            setError('No courses available. Please create courses first.');
          } else {
            setError(null);
          }
        } catch (err) {
          console.error('TimetableAdmin: Error fetching data:', err);
          setError(err.response?.data?.msg || err.message || 'Failed to load data. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      if (user && user.role === 'admin') {
        fetchData();
      }
    }, [user]);

    const handleCreate = () => {
      if (courses.length === 0) {
        setError('Cannot create timetable: No courses available.');
        return;
      }
      setCreating(true);
      setFormData({
        courseCode: '',
        subject: '',
        roomName: '',
        day: '',
        startTime: '',
        endTime: '',
        lecturerEmails: '',
      });
    };

    const handleEdit = (timetable) => {
      setEditing(timetable._id);
      setFormData({
        courseCode: timetable.courseId.code,
        subject: timetable.subject,
        roomName: timetable.roomId.name,
        day: timetable.day,
        startTime: new Date(timetable.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        endTime: new Date(timetable.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        lecturerEmails: timetable.userIds.filter(u => u.role === 'lecturer').map(u => u.email).join(', '),
      });
    };

    const handleCreateSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        console.log('TimetableAdmin: Creating timetable:', formData);
        const token = localStorage.getItem('token');
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/timetable`,
          formData,
          { headers: { 'x-auth-token': token } }
        );
        console.log('TimetableAdmin: Created timetable:', response.data);
        setTimetables([...timetables, response.data]);
        setCreating(false);
        setError(null);
      } catch (err) {
        console.error('TimetableAdmin: Error creating timetable:', err);
        setError(err.response?.data?.msg || 'Failed to create timetable. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    const handleUpdate = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        console.log('TimetableAdmin: Updating timetable:', editing, formData);
        const token = localStorage.getItem('token');
        const response = await axios.put(
          `${import.meta.env.VITE_API_URL}/api/timetable/${editing}`,
          formData,
          { headers: { 'x-auth-token': token } }
        );
        console.log('TimetableAdmin: Updated timetable:', response.data);
        setTimetables(timetables.map(t => (t._id === editing ? response.data : t)));
        setEditing(null);
        setError(null);
      } catch (err) {
        console.error('TimetableAdmin: Error updating timetable:', err);
        setError(err.response?.data?.msg || 'Failed to update timetable. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    const handleDelete = async (id) => {
      if (!window.confirm('Are you sure you want to delete this timetable?')) return;
      setLoading(true);
      try {
        console.log('TimetableAdmin: Deleting timetable:', id);
        const token = localStorage.getItem('token');
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/timetable/${id}`, {
          headers: { 'x-auth-token': token },
        });
        console.log('TimetableAdmin: Deleted timetable:', id);
        setTimetables(timetables.filter(t => t._id !== id));
        setError(null);
      } catch (err) {
        console.error('TimetableAdmin: Error deleting timetable:', err);
        setError(err.response?.data?.msg || 'Failed to delete timetable. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    const handleCourseChange = (e) => {
      const selectedCourse = courses.find(c => c.code === e.target.value);
      setFormData({
        ...formData,
        courseCode: e.target.value,
        subject: '',
      });
    };

    if (!user || user.role !== 'admin') {
      return <div className="text-white text-center mt-8">Access denied. Admins only.</div>;
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-white">Manage Timetables</h1>
        <div className="flex justify-end mb-4">
          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:bg-gray-600"
            disabled={loading || courses.length === 0}
          >
            Create Timetable
          </button>
        </div>
        {error && (
          <div className="bg-red-900 text-white p-3 rounded mb-4">{error}</div>
        )}
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : timetables.length === 0 ? (
          <div className="bg-gray-800 bg-opacity-70 rounded-lg p-8 text-center text-white">
            <p className="text-xl">No timetables found.</p>
          </div>
        ) : (
          <div className="bg-gray-900 bg-opacity-70 rounded-lg p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full bg-black bg-opacity-50 rounded-lg">
                <thead>
                  <tr className="bg-gray-800 text-left">
                    <th className="px-6 py-4 text-sm font-semibold text-gray-300">Course</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-300">Subject</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-300">Room</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-300">Day</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-300">Time</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-300">Users</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {timetables.map((timetable) => (
                    <tr key={timetable._id} className="hover:bg-gray-800">
                      <td className="px-6 py-4">{timetable.courseId?.code}</td>
                      <td className="px-6 py-4">{timetable.subject}</td>
                      <td className="px-6 py-4">{timetable.roomId?.name}</td>
                      <td className="px-6 py-4">{timetable.day}</td>
                      <td className="px-6 py-4">
                        {new Date(timetable.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                        {new Date(timetable.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4">{timetable.userIds.map(u => u.email).join(', ')}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleEdit(timetable)}
                          className="text-blue-500 hover:text-blue-700 mr-4"
                          disabled={loading}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(timetable._id)}
                          className="text-red-500 hover:text-red-700"
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {(editing || creating) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-gray-900 rounded-lg p-6 w-full max-w-lg">
              <h2 className="text-2xl font-bold mb-4 text-white">{editing ? 'Edit Timetable' : 'Create Timetable'}</h2>
              <form onSubmit={editing ? handleUpdate : handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Course Code</label>
                  <select
                    value={formData.courseCode}
                    onChange={handleCourseChange}
                    className="w-full rounded-md bg-gray-800 border-gray-700 text-white py-2 px-3"
                    required
                  >
                    <option value="">Select Course</option>
                    {courses.map(course => (
                      <option key={course._id} value={course.code}>{course.code} - {course.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Subject</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full rounded-md bg-gray-800 border-gray-700 text-white py-2 px-3"
                    required
                    disabled={!formData.courseCode}
                  >
                    <option value="">Select Subject</option>
                    {formData.courseCode && courses.find(c => c.code === formData.courseCode)?.subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Room Name</label>
                  <input
                    type="text"
                    value={formData.roomName}
                    onChange={(e) => setFormData({ ...formData, roomName: e.target.value })}
                    className="w-full rounded-md bg-gray-800 border-gray-700 text-white py-2 px-3"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Day</label>
                  <select
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                    className="w-full rounded-md bg-gray-800 border-gray-700 text-white py-2 px-3"
                    required
                  >
                    <option value="">Select Day</option>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Start Time (HH:MM)</label>
                  <input
                    type="text"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    placeholder="09:00"
                    className="w-full rounded-md bg-gray-800 border-gray-700 text-white py-2 px-3"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">End Time (HH:MM)</label>
                  <input
                    type="text"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    placeholder="10:30"
                    className="w-full rounded-md bg-gray-800 border-gray-700 text-white py-2 px-3"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Lecturer Emails (comma-separated, optional)</label>
                  <input
                    type="text"
                    value={formData.lecturerEmails}
                    onChange={(e) => setFormData({ ...formData, lecturerEmails: e.target.value })}
                    placeholder="lecturer1@scmp.com, lecturer2@scmp.com"
                    className="w-full rounded-md bg-gray-800 border-gray-700 text-white py-2 px-3"
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => { setEditing(null); setCreating(false); }}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    disabled={loading}
                  >
                    {loading ? (editing ? 'Updating...' : 'Creating...') : (editing ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  export default TimetableAdmin;