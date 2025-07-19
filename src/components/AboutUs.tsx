import React from 'react';
import { Leaf, Users, Award, Target, Heart, Globe } from 'lucide-react';

const AboutUs: React.FC = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            About BestWayAgriculture
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We are Sri Lanka's premier agricultural partner, dedicated to empowering farmers with 
            premium seeds and expert guidance for exceptional harvests.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="bg-green-50 rounded-xl p-6 sm:p-8">
            <div className="flex items-center mb-4">
              <Target className="h-8 w-8 text-green-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              To revolutionize Sri Lankan agriculture by providing farmers with the highest quality seeds, 
              cutting-edge agricultural knowledge, and personalized expert support to maximize crop yields 
              and ensure sustainable farming practices.
            </p>
          </div>
          <div className="bg-blue-50 rounded-xl p-6 sm:p-8">
            <div className="flex items-center mb-4">
              <Globe className="h-8 w-8 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Our Vision</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              To be the leading agricultural solutions provider in Sri Lanka, fostering food security, 
              economic growth, and environmental sustainability through innovative farming practices 
              and unwavering commitment to farmer success.
            </p>
          </div>
        </div>

        {/* Our Story */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Our Story</h2>
          <div className="bg-gray-50 rounded-xl p-6 sm:p-8">
            <p className="text-gray-700 leading-relaxed mb-4">
              Founded in 2010, BestWayAgriculture began as a small family business with a simple yet 
              powerful vision: to help Sri Lankan farmers achieve their full potential. What started 
              as a local seed supplier has grown into the island's most trusted agricultural partner.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Over the years, we've built strong relationships with international seed producers, 
              ensuring our farmers have access to the world's best varieties adapted for Sri Lankan 
              conditions. Our team of agricultural experts has grown from 3 to over 50 specialists, 
              each dedicated to supporting farmers across all provinces.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Today, we're proud to serve over 10,000 farmers nationwide, contributing to Sri Lanka's 
              agricultural development while maintaining our core values of quality, integrity, and 
              farmer-first service.
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Core Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Quality Excellence</h3>
              <p className="text-gray-600">
                We source only the highest quality seeds with proven germination rates and disease resistance.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Farmer Partnership</h3>
              <p className="text-gray-600">
                We build lasting relationships with farmers, providing ongoing support throughout their journey.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Innovation</h3>
              <p className="text-gray-600">
                We continuously adopt new technologies and methods to improve agricultural outcomes.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Integrity</h3>
              <p className="text-gray-600">
                We operate with complete transparency and honesty in all our business dealings.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Sustainability</h3>
              <p className="text-gray-600">
                We promote environmentally responsible farming practices for future generations.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Results-Driven</h3>
              <p className="text-gray-600">
                We measure our success by the success of the farmers we serve.
              </p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-green-600 rounded-xl p-6 sm:p-8 text-white">
          <h2 className="text-3xl font-bold text-center mb-8">Our Impact</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-bold mb-2">10,000+</div>
              <div className="text-green-100">Farmers Served</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold mb-2">15</div>
              <div className="text-green-100">Years of Experience</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold mb-2">95%+</div>
              <div className="text-green-100">Germination Rate</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold mb-2">9</div>
              <div className="text-green-100">Provinces Covered</div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Leadership Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <img
                src="https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="CEO"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-xl font-semibold mb-2">Rajesh Perera</h3>
              <p className="text-green-600 font-medium mb-2">Chief Executive Officer</p>
              <p className="text-gray-600 text-sm">
                20+ years in agricultural development with expertise in sustainable farming practices.
              </p>
            </div>
            <div className="text-center">
              <img
                src="https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="CTO"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-xl font-semibold mb-2">Dr. Kumari Silva</h3>
              <p className="text-green-600 font-medium mb-2">Chief Agricultural Officer</p>
              <p className="text-gray-600 text-sm">
                PhD in Plant Sciences with specialization in tropical crop development and disease management.
              </p>
            </div>
            <div className="text-center">
              <img
                src="https://images.pexels.com/photos/5327647/pexels-photo-5327647.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="COO"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-xl font-semibold mb-2">Nimal Fernando</h3>
              <p className="text-green-600 font-medium mb-2">Chief Operations Officer</p>
              <p className="text-gray-600 text-sm">
                Expert in supply chain management and farmer relationship development across Sri Lanka.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;