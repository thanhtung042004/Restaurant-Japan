import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Hero from '../components/landing/Hero';
import About from '../components/landing/About';
import SignatureDishes from '../components/landing/SignatureDishes';
import SpaceGallery from '../components/landing/SpaceGallery';
import MenuHighlights from '../components/landing/MenuHighlights';
import ChefPhilosophy from '../components/landing/ChefPhilosophy';
import BookingSection from '../components/landing/BookingSection';
import AIChatBot from '../features/ai/components/AIChatBot';
import Testimonials from '../components/landing/Testimonials';
import Footer from '../components/layout/Footer';
import LoginModal from '../components/auth/LoginModal';
import { ArrowUp } from 'lucide-react';

export default function LandingPage({
  user,
  onLogout,
  onOpenLogin,
  showLoginModal,
  onCloseLogin,
  onLoginSuccess
}) {
  const [showBackTop, setShowBackTop] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Reveal animation using IntersectionObserver
    const revealEls = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // Animates only once
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach((el) => observer.observe(el));

    // Show/hide Back-to-Top Button
    const handleScroll = () => {
      setShowBackTop(window.scrollY > 450);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-bg text-cream font-sans font-light select-default min-h-screen relative">
      
      {/* Navbar */}
      <Navbar user={user} onLogout={onLogout} onOpenLogin={onOpenLogin} />

      {/* Landing Sections */}
      <Hero />
      <About />
      <SignatureDishes />
      <SpaceGallery />
      <MenuHighlights />
      <ChefPhilosophy />
      <BookingSection user={user} onOpenLogin={onOpenLogin} />
      <AIChatBot user={user} onOpenLogin={onOpenLogin} />
      <Testimonials />
      <Footer />

      {/* Login / Register Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={onCloseLogin} 
        onLoginSuccess={(token, data) => {
          onLoginSuccess(token, data);
          navigate('/dashboard');
        }} 
      />

      {/* Floating Back to Top Button */}
      <button
        onClick={handleBackToTop}
        className={`fixed bottom-8 right-8 w-11 h-11 bg-glass border border-glass-border flex items-center justify-center text-gold backdrop-blur-md z-50 transition-all duration-300 ${
          showBackTop ? 'opacity-100 translate-y-0 hover:border-gold hover:bg-gold/10' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
        aria-label="Trở về đầu trang"
      >
        <ArrowUp size={16} />
      </button>
    </div>
  );
}
