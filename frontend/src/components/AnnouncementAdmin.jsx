import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import announcementIcon from '../assets/announcement.png';
import backgroundImage from '../assets/AnnouncementB.jpeg';

const AnnouncementAdmin = () => {
  // Define colors explicitly to match Announcement component
  const blueColor = '#1d4ed8'; // blue-700 equivalent
  const lightBlueColor = '#dbeafe'; // blue-100 equivalent
  const veryLightBlueColor = '#eff6ff'; // blue-50 equivalent
  const mediumBlueColor = '#2563eb'; // blue-600 equivalent

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
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/announcements`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
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
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/announcements`,
        formData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
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
      publishDate: announcement.publishDate
        ? new Date(announcement.publishDate).toISOString().slice(0, 16)
        : '',
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
      const res = await axios.put(
        `${
          import.meta.env.VITE_API_URL
        }/api/announcements/${editAnnouncementId}`,
        formData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setAnnouncements(
        announcements.map((a) => (a._id === editAnnouncementId ? res.data : a))
      );
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
    if (!window.confirm('Are you sure you want to delete this announcement?'))
      return;
    try {
      console.log('Deleting announcement:', announcementId);
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/announcements/${announcementId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setAnnouncements(announcements.filter((a) => a._id !== announcementId));
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
      <div className="bg-white rounded-lg shadow-lg p-8 my-8 max-w-5xl mx-auto">
        <h2
          className="text-3xl font-bold mb-6 text-center"
          style={{ color: blueColor }}
        >
          Announcement Management
        </h2>
        <div className="flex justify-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
            style={{ borderColor: mediumBlueColor }}
          ></div>
        </div>
      </div>
    );
  }

  if (error && !showForm) {
    return (
      <div className="relative py-6">
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          <div className="absolute inset-0 bg-white bg-opacity-90"></div>
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-5xl mx-auto">
            <div
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4"
              role="alert"
            >
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative py-6">
      {/* Background with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-white bg-opacity-90"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 relative z-10">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="mr-4 w-16 h-16 flex-shrink-0">
                <img
                  src={announcementIcon}
                  alt="Announcements"
                  className="w-full h-full object-contain"
                />
              </div>
              <h2
                className="text-2xl font-bold pb-2"
                style={{
                  color: blueColor,
                  borderBottom: `1px solid ${lightBlueColor}`,
                }}
              >
                Announcement Management
              </h2>
            </div>
            <button
              onClick={() => {
                setShowForm(!showForm);
                if (editMode) resetForm();
              }}
              className="text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              style={{
                backgroundColor: mediumBlueColor,
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = blueColor)}
              onMouseOut={(e) =>
                (e.target.style.backgroundColor = mediumBlueColor)
              }
            >
              {showForm ? 'Cancel' : 'Create Announcement'}
            </button>
          </div>

          {success && (
            <div
              className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6"
              role="alert"
            >
              <p>{success}</p>
            </div>
          )}

          {error && (
            <div
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6"
              role="alert"
            >
              <p>{error}</p>
            </div>
          )}

          {showForm && (
            <div
              className="rounded-lg p-6 transition-all duration-300 shadow-md mb-8"
              style={{
                borderColor: lightBlueColor,
                backgroundColor: veryLightBlueColor,
                border: `1px solid ${lightBlueColor}`,
              }}
            >
              <h2
                className="text-xl font-semibold mb-6"
                style={{ color: blueColor }}
              >
                {editMode ? 'Edit Announcement' : 'Create Announcement'}
              </h2>
              <form
                onSubmit={editMode ? handleUpdate : handleCreate}
                className="space-y-6"
              >
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      borderColor: lightBlueColor,
                      boxShadow: 'none',
                      focusRing: mediumBlueColor,
                    }}
                    placeholder="Enter announcement title"
                    maxLength="100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Content
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      borderColor: lightBlueColor,
                      boxShadow: 'none',
                      focusRing: mediumBlueColor,
                    }}
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
                    className="h-5 w-5 rounded"
                    style={{ color: mediumBlueColor }}
                  />
                  <label className="ml-2 text-gray-700">
                    Publish immediately
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="sendEmail"
                    checked={formData.sendEmail}
                    onChange={handleInputChange}
                    className="h-5 w-5 rounded"
                    style={{ color: mediumBlueColor }}
                  />
                  <label className="ml-2 text-gray-700">
                    Send email notifications
                  </label>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Schedule Publish Date (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    name="publishDate"
                    value={formData.publishDate}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      borderColor: lightBlueColor,
                      boxShadow: 'none',
                      focusRing: mediumBlueColor,
                    }}
                  />
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition-colors"
                    style={{ borderColor: lightBlueColor, color: blueColor }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white font-medium rounded-lg transition-colors duration-200"
                    style={{ backgroundColor: mediumBlueColor }}
                    onMouseOver={(e) =>
                      (e.target.style.backgroundColor = blueColor)
                    }
                    onMouseOut={(e) =>
                      (e.target.style.backgroundColor = mediumBlueColor)
                    }
                  >
                    {editMode ? 'Update Announcement' : 'Create Announcement'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {announcements.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p className="text-lg">
                No announcements available. Create a new announcement to get
                started.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {announcements.map((announcement) => (
                <div
                  key={announcement._id}
                  className="border rounded-lg p-6 transition-all duration-300 hover:shadow-md"
                  style={{
                    borderColor: lightBlueColor,
                    backgroundColor: veryLightBlueColor,
                  }}
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3
                          className="text-xl font-semibold"
                          style={{ color: blueColor }}
                        >
                          {announcement.title}
                        </h3>
                        <span
                          className={`text-xs px-3 py-1 rounded-full border ${
                            announcement.isPublished
                              ? 'bg-green-100 text-green-800 border-green-300'
                              : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                          }`}
                        >
                          {announcement.isPublished ? 'Published' : 'Draft'}
                        </span>
                        {announcement.publishDate && (
                          <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                            Scheduled
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 mb-4">
                        {announcement.content}
                      </p>
                      <p className="text-gray-500 text-sm">
                        Posted by: {announcement.createdBy?.email} on{' '}
                        {new Date(announcement.createdAt).toLocaleDateString(
                          'en-US',
                          {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          }
                        )}
                      </p>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleEdit(announcement)}
                        className="px-3 py-1 text-white text-sm font-medium rounded transition-colors duration-200"
                        style={{ backgroundColor: mediumBlueColor }}
                        onMouseOver={(e) =>
                          (e.target.style.backgroundColor = blueColor)
                        }
                        onMouseOut={(e) =>
                          (e.target.style.backgroundColor = mediumBlueColor)
                        }
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(announcement._id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors duration-200"
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

        {/* Divider - Similar to Announcement component */}
        <div
          style={{
            borderTop: `1px solid ${lightBlueColor}`,
            marginTop: '2rem',
          }}
          className="relative z-10 max-w-5xl mx-auto"
        >
          <div
            style={{ backgroundColor: veryLightBlueColor }}
            className="py-3 px-8 rounded-b-lg text-center"
          >
            <p className="text-sm text-gray-600">
              Manage and publish campus announcements from this administration
              panel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementAdmin;
