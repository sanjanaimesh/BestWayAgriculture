import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductCatalog from './components/ProductCatalog';
import AgentContact from './components/AgentContact';
import AboutUs from './components/AboutUs';
import Footer from './components/Footer';
import Cart from './components/Cart';
import { CartProvider } from './context/CartContext';
import SideNav from './components/Admin';
import AdminLogin from './components/Auth/AdminLogin';
import UserLogin from './components/Auth/UserLogin';
import ProtectedRoute from './../src/components/Routes/ProtectRoutes';
import { AuthProvider } from '../src/components/Auth/Providers/AuthProvider';

type SectionType = 'home' | 'about' | 'products' | 'agents';

function App(): JSX.Element {
  const [activeSection, setActiveSection] = useState<SectionType>('home');
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Header activeSection={activeSection} setActiveSection={setActiveSection} setIsCartOpen={setIsCartOpen} />
            <main>
              <Routes>
                {/* Public Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/login" element={<UserLogin />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/products" element={<ProductCatalog />} />
                <Route path="/agents" element={<AgentContact />} />
                <Route path="/" element={
                  <>
                    <Hero setActiveSection={setActiveSection} />
                    <ProductCatalog />
                    <AgentContact />
                  </>
                } />
                
                {/* Protected Admin Routes */}
                <Route path="/admin" element={
                  <ProtectedRoute requireAdmin={true}>
                    <SideNav />
                  </ProtectedRoute>
                } />
                
                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer setActiveSection={setActiveSection} />
            <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;