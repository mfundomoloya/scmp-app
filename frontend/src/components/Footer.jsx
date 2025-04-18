const Footer = () => {
    return (
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <ul className="flex justify-center space-x-6 mb-4">
            <li>
              <a href="/about" className="hover:text-blue-300">About</a>
            </li>
            <li>
              <a href="/contact" className="hover:text-blue-300">Contact</a>
            </li>
            <li>
              <a href="/privacy" className="hover:text-blue-300">Privacy Policy</a>
            </li>
          </ul>
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Smart Campus Services Portal. All rights reserved.
          </p>
        </div>
      </footer>
    );
  };
  
  export default Footer;