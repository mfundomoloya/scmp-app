import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const IssueReport = () => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    description: '',
    priority: 'medium',
    type: 'maintenance',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // In a real app, you would send this to your backend
      // const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/issues`, formData, {
      //   headers: { 'x-auth-token': localStorage.getItem('token') },
      // });

      // For demo purposes, we'll simulate a successful API call
      console.log('Issue report submitted:', formData);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Show success message
      setSubmitSuccess(true);

      // Reset form
      setFormData({
        title: '',
        location: '',
        description: '',
        priority: 'medium',
        type: 'maintenance',
      });

      // Hide success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    } catch (err) {
      console.error('Error submitting issue:', err);
      setError(
        err.response?.data?.msg || 'Failed to submit issue. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: 'url(/images/maintenance-bg.jpg)' }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-75"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-2xl mx-auto bg-white bg-opacity-95 p-8 rounded-lg shadow-xl">
          <h1 className="text-3xl font-bold text-black mb-6 border-b pb-3">
            Report an Issue
          </h1>

          {submitSuccess && (
            <div
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6"
              role="alert"
            >
              <strong className="font-bold">Success! </strong>
              <span className="block sm:inline">
                Your issue has been reported. We'll look into it shortly.
              </span>
            </div>
          )}

          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6"
              role="alert"
            >
              <strong className="font-bold">Error! </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-gray-700 font-semibold mb-2"
              >
                Issue Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief title describing the issue"
                required
              />
            </div>

            <div>
              <label
                htmlFor="location"
                className="block text-gray-700 font-semibold mb-2"
              >
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Building and room number"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="type"
                  className="block text-gray-700 font-semibold mb-2"
                >
                  Issue Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="maintenance">Maintenance</option>
                  <option value="it">IT Support</option>
                  <option value="security">Security</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="priority"
                  className="block text-gray-700 font-semibold mb-2"
                >
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-gray-700 font-semibold mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Please provide detailed information about the issue"
                required
              ></textarea>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-gray-600">
                <p>
                  Reported by:{' '}
                  <span className="font-semibold">
                    {user?.name || 'Anonymous'}
                  </span>
                </p>
                <p>
                  Date:{' '}
                  <span className="font-semibold">
                    {new Date().toLocaleDateString()}
                  </span>
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2 rounded-md text-white font-semibold transition duration-150 ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <h3 className="font-semibold text-gray-700 mb-2">
              Need immediate assistance?
            </h3>
            <p className="text-gray-600">
              For urgent issues requiring immediate attention, please contact
              the facilities helpdesk at
              <span className="font-semibold text-blue-600">
                {' '}
                facilities@smartcampus.edu
              </span>{' '}
              or call
              <span className="font-semibold text-blue-600">
                {' '}
                (555) 123-4567
              </span>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueReport;
