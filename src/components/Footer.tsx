import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white border-t mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text">About Us</h3>
            <p className="text-text-light">
              Empowering natural healing through community wisdom and expert guidance.
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/remedies" className="text-text-light hover:text-primary">
                  Natural Remedies
                </Link>
              </li>
              <li>
                <Link to="/experts" className="text-text-light hover:text-primary">
                  Our Experts
                </Link>
              </li>
              <li>
                <Link to="/news" className="text-text-light hover:text-primary">
                  Latest News
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text">Connect</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-text-light hover:text-primary">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-text-light hover:text-primary">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-text-light hover:text-primary">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-text-light hover:text-primary">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text">Newsletter</h3>
            <p className="text-text-light">
              Stay updated with our latest natural remedies and health tips.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button className="bg-primary text-white px-4 py-2 rounded-r hover:bg-primary-dark transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t text-center text-text-light">
          <p>&copy; {new Date().getFullYear()} BetterTogether. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;