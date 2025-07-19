import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductCatalog from './components/ProductCatalog';
import AgentContact from './components/AgentContact';
import AboutUs from './components/AboutUs';
import Footer from './components/Footer';
import Cart from './components/Cart';
import { CartProvider } from './context/CartContext';

function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [isCartOpen, setIsCartOpen] = useState(false);

  const renderContent = () => {
    switch (activeSection) {
      case 'about':
        return <AboutUs />;
      case 'products':
        return <ProductCatalog />;
      case 'agents':
        return <AgentContact />;
      case 'home':
      default:
        return (
          <>
            <Hero setActiveSection={setActiveSection} />
            <ProductCatalog />
            <AgentContact />
          </>
        );
    }
  };

  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-50">
        <Header 
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          setIsCartOpen={setIsCartOpen}
        />
        <main>
          {renderContent()}
        </main>
        <Footer setActiveSection={setActiveSection} />
        <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </div>
    </CartProvider>
  );
}

export default App;