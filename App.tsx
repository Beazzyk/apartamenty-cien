
import React, { useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SEOSection from './components/SEOSection';
import Features from './components/Features';
import Gallery from './components/Gallery';
import Amenities from './components/Amenities';
import TrailRitual from './components/TrailRitual';
import Location from './components/Location';
import AttractionsBanner from './components/AttractionsBanner';
import BookSection from './components/BookSection';
import AboutUs from './components/AboutUs';
import BookingSection from './components/BookingSection';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
// CookieBanner zastąpiony przez Cookiebot (index.html) — pełna zgodność RODO

const App: React.FC = () => {
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen font-sans selection:bg-cappuccino selection:text-white">
      <Navbar />
      <main>
        <Hero />
        <SEOSection />
        <Features />
        <Gallery />
        <Amenities />
        <TrailRitual />
        <Location />
        <AttractionsBanner />
        <BookSection />
        <AboutUs />
        <div id="rezerwacja">
            <BookingSection />
        </div>
        <FAQ />
      </main>
      <Footer />
      {/* Cookiebot renderowany przez index.html */}
    </div>
  );
};

export default App;
