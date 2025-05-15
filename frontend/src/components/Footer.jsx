import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  // Define colors explicitly
  const blueColor = '#1d4ed8'; // blue-700 equivalent
  const lightBlueColor = '#dbeafe'; // blue-100 equivalent
  const veryLightBlueColor = '#eff6ff'; // blue-50 equivalent
  const mediumBlueColor = '#2563eb'; // blue-600 equivalent

  // Dynamic current year
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative py-12">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: 'url(/images/books-background.jpg)' }}
      >
        <div className="absolute inset-0 bg-white bg-opacity-90"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Column 1: About */}
          <div className="space-y-4">
            <h2
              style={{
                color: blueColor,
                borderBottom: `1px solid ${lightBlueColor}`,
              }}
              className="text-2xl font-bold pb-2 mb-4"
            >
              Smart Campus Portal
            </h2>
            <p className="text-gray-700 mb-4">
              Empowering education through technology. Manage your campus
              services efficiently.
            </p>
            <div className="flex items-center space-x-2 text-gray-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                style={{ color: mediumBlueColor }}
                className="h-5 w-5"
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
              <a
                href="mailto:info@smartcampus.edu"
                style={{ transition: 'color 0.3s' }}
                onMouseOver={(e) => (e.target.style.color = blueColor)}
                onMouseOut={(e) => (e.target.style.color = '')}
              >
                info@smartcampus.edu
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h2
              style={{
                color: blueColor,
                borderBottom: `1px solid ${lightBlueColor}`,
              }}
              className="text-2xl font-bold pb-2 mb-4"
            >
              Quick Links
            </h2>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/about"
                  className="inline-flex items-center text-gray-700"
                  style={{ transition: 'color 0.3s' }}
                  onMouseOver={(e) => (e.target.style.color = blueColor)}
                  onMouseOut={(e) => (e.target.style.color = '')}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ color: mediumBlueColor }}
                    className="h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="inline-flex items-center text-gray-700"
                  style={{ transition: 'color 0.3s' }}
                  onMouseOver={(e) => (e.target.style.color = blueColor)}
                  onMouseOut={(e) => (e.target.style.color = '')}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ color: mediumBlueColor }}
                    className="h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="inline-flex items-center text-gray-700"
                  style={{ transition: 'color 0.3s' }}
                  onMouseOver={(e) => (e.target.style.color = blueColor)}
                  onMouseOut={(e) => (e.target.style.color = '')}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ color: mediumBlueColor }}
                    className="h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="inline-flex items-center text-gray-700"
                  style={{ transition: 'color 0.3s' }}
                  onMouseOver={(e) => (e.target.style.color = blueColor)}
                  onMouseOut={(e) => (e.target.style.color = '')}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ color: mediumBlueColor }}
                    className="h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Connect */}
          <div className="space-y-4">
            <h2
              style={{
                color: blueColor,
                borderBottom: `1px solid ${lightBlueColor}`,
              }}
              className="text-2xl font-bold pb-2 mb-4"
            >
              Connect With Us
            </h2>

            {/* Social Icons */}
            <div className="flex space-x-4">
              <a
                href="#"
                style={{
                  backgroundColor: lightBlueColor,
                  color: blueColor,
                  borderRadius: '9999px',
                  padding: '0.5rem',
                }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = '#bfdbfe')
                }
                onMouseOut={(e) =>
                  (e.target.style.backgroundColor = lightBlueColor)
                }
              >
                {/* Facebook icon */}
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </a>
              <a
                href="#"
                style={{
                  backgroundColor: lightBlueColor,
                  color: blueColor,
                  borderRadius: '9999px',
                  padding: '0.5rem',
                }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = '#bfdbfe')
                }
                onMouseOut={(e) =>
                  (e.target.style.backgroundColor = lightBlueColor)
                }
              >
                {/* Twitter icon */}
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                </svg>
              </a>
              <a
                href="#"
                style={{
                  backgroundColor: lightBlueColor,
                  color: blueColor,
                  borderRadius: '9999px',
                  padding: '0.5rem',
                }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = '#bfdbfe')
                }
                onMouseOut={(e) =>
                  (e.target.style.backgroundColor = lightBlueColor)
                }
              >
                {/* Instagram icon */}
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </a>
            </div>

            {/* Hours */}
            <div className="mt-4">
              <h3
                style={{ color: blueColor }}
                className="text-lg font-semibold"
              >
                Hours
              </h3>
              <p className="text-gray-700 flex items-center mt-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ color: mediumBlueColor }}
                  className="h-5 w-5 mr-2 text-gray-600"
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
                Monday-Friday: 8:00 AM - 5:00 PM
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Divider and Copyright Bar */}
      <div
        style={{ borderTop: `1px solid ${lightBlueColor}`, marginTop: '2rem' }}
        className="relative z-10"
      >
        <div style={{ backgroundColor: veryLightBlueColor }} className="py-4">
          <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-600">
              © {currentYear} Smart Campus Services Portal. All rights reserved.
            </div>
            <div className="mt-2 md:mt-0 text-sm text-gray-600 flex items-center">
              Designed with
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mx-1 text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clipRule="evenodd"
                />
              </svg>
              for students and faculty
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
