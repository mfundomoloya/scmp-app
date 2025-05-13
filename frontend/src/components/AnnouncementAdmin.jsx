import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const AnnouncementAdmin = () => {
  const { user } = useContext(AuthContext);
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editAnnouncementId, setEditAnnouncementId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isPublished: false,
    publishDate: '',
    sendEmail: true,
  });

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching announcements for admin:', user?.email);
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/announcements`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        console.log('Announcements response:', res.data);
        setAnnouncements(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Fetch announcements error:', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        });
        setError(err.response?.data?.msg || 'Failed to fetch announcements');
      } finally {
        setIsLoading(false);
      }
    };
    if (user && user.role === 'admin') {
      fetchAnnouncements();
    } else {
      setIsLoading(false);
      setError('Unauthorized access');
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      isPublished: false,
      publishDate: '',
      sendEmail: true,
    });
    setEditMode(false);
    setEditAnnouncementId(null);
    setShowForm(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      setError('Title and content are required');
      setTimeout(() => setError(null), 3000);
      return;
    }
    try {
      console.log('Creating announcement:', formData);
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/announcements`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setAnnouncements([res.data, ...announcements]);
      setSuccess('Announcement created successfully');
      resetForm();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Create announcement error:', err);
      setError(err.response?.data?.msg || 'Failed to create announcement');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleEdit = (announcement) => {
    setFormData({
      title: announcement.title,
      content: announcement.content,
      isPublished: announcement.isPublished,
      publishDate: announcement.publishDate ? new Date(announcement.publishDate).toISOString().slice(0, 16) : '',
      sendEmail: true,
    });
    setEditMode(true);
    setEditAnnouncementId(announcement._id);
    setShowForm(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      setError('Title and content are required');
      setTimeout(() => setError(null), 3000);
      return;
    }
    try {
      console.log('Updating announcement:', editAnnouncementId, formData);
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/announcements/${editAnnouncementId}`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setAnnouncements(announcements.map(a => a._id === editAnnouncementId ? res.data : a));
      setSuccess('Announcement updated successfully');
      resetForm();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Update announcement error:', err);
      setError(err.response?.data?.msg || 'Failed to update announcement');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDelete = async (announcementId) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      console.log('Deleting announcement:', announcementId);
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/announcements/${announcementId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setAnnouncements(announcements.filter(a => a._id !== announcementId));
      setSuccess('Announcement deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Delete announcement error:', err);
      setError(err.response?.data?.msg || 'Failed to delete announcement');
      setTimeout(() => setError(null), 3000);
    }
  };

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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">Admin Announcement Management</h1>
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
        <div className="flex justify-end mb-6">
          <button
            onClick={() => { setShowForm(!showForm); if (editMode) resetForm(); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showForm ? 'Cancel' : 'Create Announcement'}
          </button>
        </div>
        {showForm && (
          <div className="bg-gray-900 p-6 rounded-lg shadow-xl mb-8">
            <h2 className="text-2xl font-semibold text-white mb-6">{editMode ? 'Edit Announcement' : 'Create Announcement'}</h2>
            <form onSubmit={editMode ? handleUpdate : handleCreate} className="space-y-6">
              <div>
                <label className="block text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter announcement title"
                  maxLength="100"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Content</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter announcement content"
                  rows="5"
                  maxLength="1000"
                  required
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-700 rounded bg-gray-800"
                />
                <label className="ml-2 text-gray-300">Publish immediately</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="sendEmail"
                  checked={formData.sendEmail}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-700 rounded bg-gray-800"
                />
                <label className="ml-2 text-gray-300">Send email notifications</label>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Schedule Publish Date (Optional)</label>
                <input
                  type="datetime-local"
                  name="publishDate"
                  value={formData.publishDate}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-4">
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
                  {editMode ? 'Update Announcement' : 'Create Announcement'}
                </button>
              </div>
            </form>
          </div>
        )}
        {announcements.length === 0 ? (
          <div className="bg-gray-900 p-6 rounded-lg text-gray-400 text-center">
            No announcements found. Create a new announcement to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map(announcement => (
              <div key={announcement._id} className="bg-gray-900 p-6 rounded-lg shadow-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{announcement.title}</h3>
                    <p className="text-gray-300 mt-2">{announcement.content}</p>
                    <p className="text-gray-400 text-sm mt-2">
                      Posted by: {announcement.createdBy.email} on{' '}
                      {new Date(announcement.createdAt).toLocaleString('en-ZA')}
                    </p>
                    <p className="text-gray-400 text-sm">
                      Status: {announcement.isPublished ? 'Published' : 'Draft'}
                      {announcement.publishDate && `, Scheduled: ${new Date(announcement.publishDate).toLocaleString('en-ZA')}`}
                    </p>
                  </div>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleEdit(announcement)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(announcement._id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementAdmin;