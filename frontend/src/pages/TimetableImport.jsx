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
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!file) {
        setError('Please select a CSV file');
        return;
      }

      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);

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
      } catch (err) {
        console.error('TimetableImport: Error importing timetables:', err);
        console.error('TimetableImport: Error response:', err.response?.data);
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
        <div className="bg-gray-900 bg-opacity-70 rounded-lg p-6 max-w-lg mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Upload CSV File
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="w-full rounded-md bg-gray-800 border-gray-700 text-white py-2 px-3"
                disabled={loading}
              />
              <p className="text-sm text-gray-400 mt-2">
                CSV format: courseName,roomName,day,startTime,endTime,userEmails
                <br />
                Example: Mathematics 101,Seminar Room B,Monday,09:00,10:30,mfundomoloya19@gmail.com,lecturer1@scmp.com
              </p>
            </div>
            {error && (
              <div className="bg-red-900 text-white p-3 rounded">{error}</div>
            )}
            {success && (
              <div className="bg-green-900 text-white p-3 rounded">{success}</div>
            )}
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                disabled={loading || !file}
              >
                {loading ? 'Importing...' : 'Import'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  export default TimetableImport;