import React from 'react';
import { Leaf, Users, Award } from 'lucide-react';

interface HeroProps {
  setActiveSection: (section: string) => void;
}

const Hero: React.FC<HeroProps> = ({ setActiveSection }) => {
  return (
    <section className="bg-gradient-to-r from-green-800 to-green-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
            Premium Seeds for
            <span className="text-green-300 block sm:inline"> Exceptional Harvests</span>
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl mb-6 sm:mb-8 max-w-3xl mx-auto opacity-90 px-4">
            Discover high-quality seeds and connect with agricultural experts to maximize your crop yield and success
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <button 
              onClick={() => setActiveSection('products')}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-lg transition-colors text-base sm:text-lg"
            >
              Shop Seeds Now
            </button>
            <button 
              onClick={() => setActiveSection('agents')}
              className="border-2 border-white text-white hover:bg-white hover:text-green-600 font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-lg transition-colors text-base sm:text-lg"
            >
              Talk to an Expert
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white text-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Premium Quality</h3>
              <p className="text-gray-600 text-sm sm:text-base px-2">Hand-selected seeds with 95%+ germination rates for optimal growth</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Expert Support</h3>
              <p className="text-gray-600 text-sm sm:text-base px-2">Connect with certified agricultural specialists for personalized guidance</p>
            </div>
            <div className="text-center sm:col-span-2 lg:col-span-1">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Proven Results</h3>
              <p className="text-gray-600 text-sm sm:text-base px-2">Trusted by 10,000+ farmers with consistent crop success stories</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;