import { useState } from 'react';
  import { useNavigate } from 'react-router-dom';
  import axios from 'axios';
  import { toast } from 'react-toastify';

  const RoomImport = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [skipDuplicates, setSkipDuplicates] = useState(false);
    const navigate = useNavigate();

    const validateCSV = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target.result;
          const lines = text.split('\n').filter(line => line.trim() !== '');
          if (lines.length <= 1) {
            reject('CSV file contains only header or is empty');
          }
          if (!text.includes(',') && !text.includes(';')) {
            reject('CSV must use comma or semicolon delimiters');
          }
          resolve();
        };
        reader.onerror = () => reject('Error reading CSV file');
        reader.readAsText(file);
      });
    };

    const handleFileChange = (e) => {
      setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !file.name.endsWith('.csv')) {
          toast.error('Please select a valid CSV file');
          return;
        }

        try {
          await validateCSV(file);
        } catch (err) {
          toast.error(err);
          return;
        }

        const formData = new FormData();
        formData.append('file', file);
        const token = localStorage.getItem('token');
        try {
          setLoading(true);
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/rooms/import?skipDuplicates=${skipDuplicates}`,
            formData,
            { headers: 
              { 'x-auth-token': token, 
                'Content-Type': 'multipart/form-data' 
              } }
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
        const allDuplicates = errors.length > 0 && errors.every(e => e.error === 'Room already exists');
        if (err.response?.data?.msg) {
          toast.error(err.response.data.msg);
          if (!allDuplicates && errors.length > 0) {
            errors.forEach((err) => {
              toast.warn(`Row error: ${err.error}`);
            });
          }
        } else if (allDuplicates) {
          const duplicateNames = errors.map(e => e.row.name).join(', ');
          toast.error(`Import failed: Rooms already exist: ${duplicateNames}`);
        } else {
          toast.error('Failed to import rooms');
          if (errors.length > 0) {
            errors.forEach((err) => {
              toast.warn(`Row error: ${err.error}`);
            });
          }
        }
        } finally {
          setLoading(false);
        }
      };

    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Import Rooms</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="file">
            Upload CSV File
          </label>
          <input
            type="file"
            id="file"
            accept=".csv"
            onChange={handleFileChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={skipDuplicates}
              onChange={(e) => setSkipDuplicates(e.target.checked)}
              className="mr-2"
            />
            Skip existing rooms
          </label>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#3b82f6] text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Importing...' : 'Import Rooms'}
        </button>
      </form>
    </div>
  );
};

  export default RoomImport;