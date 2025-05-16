import React, { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  // Color scheme variables
  const blueColor = '#1d4ed8';
  const lightBlueColor = '#dbeafe';
  const veryLightBlueColor = '#eff6ff';
  //const mediumBlueColor = '#2563eb';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // In a real app, you would send this data to your backend
    setSubmitted(true);
    // Reset form after submission
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: '',
    });
    // Reset submitted status after 5 seconds
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen relative">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: 'url(/images/campus-building.jpg)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue to-blue-900 bg-opacity-80"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div
          className="max-w-4xl mx-auto bg-white bg-opacity-95 p-8 md:p-10 rounded-xl shadow-2xl"
          //style={{ borderTop: `4px solid ${blueColor}` }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-black mb-8 pb-4 border-b border-gray-200">
            Contact Us
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <div>
              <div className="prose max-w-none mb-6">
                <p className="text-lg mb-6 leading-relaxed text-gray-700">
                  Need support or have a question? Reach out to our development
                  team:
                </p>

                <div className="flex items-center my-6">
                  <div
                    className="flex items-center justify-center h-10 w-10 rounded-full mr-4"
                    style={{ backgroundColor: lightBlueColor }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      style={{ color: blueColor }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <span className="text-lg font-semibold text-gray-800">
                    support@smartcampusportal.edu
                  </span>
                </div>

                <div className="flex items-center my-6">
                  <div
                    className="flex items-center justify-center h-10 w-10 rounded-full mr-4"
                    style={{ backgroundColor: lightBlueColor }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      style={{ color: blueColor }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <span className="text-lg text-gray-700">
                    Visit our Help Desk during campus hours
                  </span>
                </div>

                <div className="flex items-center my-6">
                  <div
                    className="flex items-center justify-center h-10 w-10 rounded-full mr-4"
                    style={{ backgroundColor: lightBlueColor }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      style={{ color: blueColor }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <span className="text-lg text-gray-700">
                    Monday-Friday: 8:00 AM - 5:00 PM
                  </span>
                </div>

                <div
                  className="mt-8 p-6 rounded-lg"
                  style={{ backgroundColor: veryLightBlueColor }}
                >
                  <p className="text-lg text-gray-700 leading-relaxed">
                    We're here to ensure your experience with the portal is
                    seamless and productive.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <form onSubmit={handleSubmit} className="space-y-5">
                {submitted && (
                  <div
                    className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-md shadow-md mb-6 animate-pulse"
                    role="alert"
                  >
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-green-500"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium">
                          Thank you! Your message has been sent successfully.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="name"
                    className="block text-gray-700 font-semibold mb-2"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-gray-700 font-semibold mb-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                    placeholder="Your email address"
                  />
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-gray-700 font-semibold mb-2"
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                    placeholder="Message subject"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-gray-700 font-semibold mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                    placeholder="Your message details"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  style={{ backgroundColor: blueColor }}
                  className="w-full py-3 px-6 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-all duration-200 transform hover:-translate-y-1"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
