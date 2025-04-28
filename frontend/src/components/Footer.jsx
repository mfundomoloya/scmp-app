import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-footer text-white py-6">
      <div className="container mx-auto px-4">
        <nav className="mb-4">
          <ul className="flex flex-wrap justify-center gap-6">
            <li>
              <Link
                to="/about"
                className="text-white hover:text-silver transition duration-200"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="text-white hover:text-silver transition duration-200"
              >
                Contact
              </Link>
            </li>
            <li>
              <Link
                to="/privacy"
                className="text-white hover:text-silver transition duration-200"
              >
                Privacy Policy
              </Link>
            </li>
          </ul>
        </nav>
        <p className="text-center text-gray-300">
          © 2025 Smart Campus Services Portal. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
