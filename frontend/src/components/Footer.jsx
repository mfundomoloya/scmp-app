import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer>
      <div>
        <nav>
          <ul className=" list-none">
            <li>
              <Link to="/about" className="text-black no-underline">About</Link>
            </li>
            <li>
              <Link to="/contact" className="text-black no-underline">Contact</Link>
            </li>
            <li>
              <Link to="/privacy" className="text-black no-underline">Privacy Policy</Link>
            </li>
          </ul>
        </nav>
        <p>© 2025 Smart Campus Services Portal. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;