import React from 'react';
import { Sprout, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

interface FooterProps {
  setActiveSection: (section: string) => void;
}

const Footer: React.FC<FooterProps> = ({ setActiveSection }) => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <Sprout className="h-8 w-8 text-green-400" />
              <span className="ml-2 text-lg sm:text-xl font-bold">BestWayAgriculture</span>
            </div>
            <p className="text-gray-400 mb-4 text-sm sm:text-base">
              Your trusted partner in agriculture, providing premium seeds and expert guidance for successful farming.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Twitter className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Instagram className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => setActiveSection('about')}
                  className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base text-left"
                >
                  About Us
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveSection('products')}
                  className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base text-left"
                >
                  Our Seeds
                </button>
              </li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">Expert Advice</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">Growing Guides</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">FAQ</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">Shipping Info</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">Returns</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">Contact Support</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-2">
              <div className="flex items-center text-sm sm:text-base">
                <Phone className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-400">+1 (555) 123-AGRI</span>
              </div>
              <div className="flex items-center text-sm sm:text-base">
                <Mail className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-400">info@agriseeds.com</span>
              </div>
              <div className="flex items-center text-sm sm:text-base">
                <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-400">123 Farm Road, Agriculture City</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm sm:text-base">
            © 2025 BestWayAgriculture. All rights reserved. Growing success together.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;