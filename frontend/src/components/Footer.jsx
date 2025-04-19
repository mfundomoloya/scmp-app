import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white p-4 mt-auto">
      <div className="container mx-auto flex flex-col items-center space-y-2">
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link to="/about" className="hover:underline">About</Link>
            </li>
            <li>
              <Link to="/contact" className="hover:underline">Contact</Link>
            </li>
            <li>
              <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
            </li>
          </ul>
        </nav>
        <p>© 2025 Smart Campus Services Portal. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;