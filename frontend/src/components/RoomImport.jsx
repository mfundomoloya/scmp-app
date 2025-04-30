import { useState } from 'react';
  import { useNavigate } from 'react-router-dom';
  import axios from 'axios';
  import { toast } from 'react-toastify';

  const RoomImport = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
      setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !file.name.endsWith('.csv')) {
          toast.error('Please select a valid CSV file');
          return;
        }
        const formData = new FormData();
        formData.append('file', file);
        const token = localStorage.getItem('token');
        try {
          setLoading(true);
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/rooms/import`,
            formData,
            { headers: { 'x-auth-token': token, 'Content-Type': 'multipart/form-data' } }
          );
          console.log('RoomImport: Imported:', response.data);
          toast.success(response.data.message);
          if (response.data.errors?.length > 0) {
            response.data.errors.forEach((err) => {
              toast.warn(`Row error: ${err.error}`);
            });
          }
          navigate('/rooms');
        } catch (err) {
          console.error('RoomImport: Import error:', JSON.stringify(err.response?.data, null, 2));
          const errors = err.response?.data?.errors || [];
          // Check if all errors are due to duplicates
          const allDuplicates = errors.length > 0 && errors.every(e => e.error === 'Room already exists');
          if (allDuplicates) {
            const duplicateNames = errors.map(e => e.row.name).join(', ');
            toast.error(`Import failed: Rooms already exist: ${duplicateNames}`);
          } else {
            const errorMsg = err.response?.data?.msg || 'Failed to import rooms';
            toast.error(errorMsg);
          }
          if (errors.length > 0) {
            errors.forEach((err) => {
              toast.warn(`Row error: ${err.error}`);
            });
          }
        } finally {
          setLoading(false);
        }
      };

    return (
      <div className="container mx-auto px-4 py-8 min-h-screen bg-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Import Rooms</h2>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-md">
          <div className="mb-4">
            <label htmlFor="file" className="block text-gray-700 font-medium mb-2">
              Select CSV File
            </label>
            <input
              type="file"
              id="file"
              accept=".csv"
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !file}
            className={`w-full py-2 px-4 rounded transition duration-150 ${
              loading || !file
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#3b82f6] hover:bg-blue-700 text-white'
            }`}
          >
            {loading ? 'Importing...' : 'Import Rooms'}
          </button>
        </form>
      </div>
    );
  };

  export default RoomImport;