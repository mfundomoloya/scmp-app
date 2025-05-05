import { useState, useContext } from 'react';
  import { AuthContext } from '../context/AuthContext';
  import axios from 'axios';

  const TimetableImport = () => {
    const { user } = useContext(AuthContext);
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);

    console.log('TimetableImport: Component mounted');
    console.log('TimetableImport: User:', JSON.stringify(user, null, 2));

    const handleFileChange = (e) => {
      setFile(e.target.files[0]);
      setError(null);
      setSuccess(null);
      console.log('TimetableImport: File selected:', e.target.files[0]?.name);
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!file) {
        setError('Please select a CSV file.');
        console.error('TimetableImport: No file selected');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      setLoading(true);
      try {
        console.log('TimetableImport: Uploading file:', file.name);
        const token = localStorage.getItem('token');
        console.log('TimetableImport: Token:', token);
        console.log('TimetableImport: API URL:', `${import.meta.env.VITE_API_URL}/api/timetable/import`);

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/timetable/import`,
          formData,
          {
            headers: {
              'x-auth-token': token,
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        console.log('TimetableImport: Import response:', response.data);
        setSuccess(response.data.message);
        setError(response.data.errors ? response.data.errors.join('; ') : null);
        setFile(null);
        e.target.reset();
      } catch (err) {
        console.error('TimetableImport: Error importing timetables:', err);
        setError(err.response?.data?.msg || 'Failed to import timetables. Please try again.');
        setSuccess(null);
      } finally {
        setLoading(false);
      }
    };

    if (!user || user.role !== 'admin') {
      return <div className="text-white text-center mt-8">Access denied. Admins only.</div>;
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-white">Import Timetables</h1>
        <div className="max-w-md mx-auto bg-gray-900 bg-opacity-70 rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Upload CSV File
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="w-full text-white bg-gray-800 rounded-md p-2 border border-gray-700"
                disabled={loading}
              />
              <p className="mt-2 text-sm text-gray-400">
                CSV format: courseCode,subject,roomName,day,startTime,endTime,lecturerEmails
                <br />
                Example: CS101,Programming,Seminar Room B,Monday,09:00,10:30,lecturer1@scmp.com
              </p>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-blue-400"
              disabled={loading}
            >
              {loading ? 'Importing...' : 'Import Timetables'}
            </button>
          </form>
          {error && (
            <div className="mt-4 bg-red-900 text-white p-3 rounded">{error}</div>
          )}
          {success && (
            <div className="mt-4 bg-green-900 text-white p-3 rounded">{success}</div>
          )}
        </div>
      </div>
    );
  };

  export default TimetableImport;