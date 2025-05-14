import { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const StudentRequestForm = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [formData, setFormData] = useState({
    type: '',
    courseId: '',
    lecturerId: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const coursesRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/courses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourses(coursesRes.data);

        const lecturersRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/lecturers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLecturers(lecturersRes.data);
      } catch (err) {
        toast.error('Failed to fetch data');
        console.error('StudentRequestForm: Fetch error:', err);
      }
    };
    if (user?.role === 'student') {
      fetchData();
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.type || !formData.courseId || !formData.lecturerId) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/api/requests`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Request submitted successfully!');
      setFormData({ type: '', courseId: '', lecturerId: '' });
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-black mb-4 flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="#2563EB"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
          />
        </svg>
        Submit a Request
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Request Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select Type</option>
            <option value="Room Extension">Room Extension</option>
            <option value="Assignment Extension">Assignment Extension</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Course</label>
          <select
            name="courseId"
            value={formData.courseId}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select Course</option>
            {courses.map(course => (
              <option key={course._id} value={course._id}>
                {course.code} - {course.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Lecturer</label>
          <select
            name="lecturerId"
            value={formData.lecturerId}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select Lecturer</option>
            {lecturers.map(lecturer => (
              <option key={lecturer._id} value={lecturer._id}>
                {lecturer.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
          style={{ backgroundColor: loading ? '#9CA3AF' : '#2563EB' }}
        >
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
};

export default StudentRequestForm;