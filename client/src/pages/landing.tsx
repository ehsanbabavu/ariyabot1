import React, { useState, useEffect } from 'react';
import Header from './landing/components/Header';
import Hero from './landing/components/Hero';
import Features from './landing/components/Features';
import HowItWorks from './landing/components/HowItWorks';
import Screenshots from './landing/components/Screenshots';
import Pricing from './landing/components/Pricing';
import Testimonials from './landing/components/Testimonials';
import CTA from './landing/components/CTA';
import Contact from './landing/components/Contact';
import Footer from './landing/components/Footer';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    document.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  return (
    <div className="bg-white text-gray-700 font-sans leading-normal tracking-normal">
      <Header scrolled={scrolled} />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Screenshots />
        <Pricing />
        <Testimonials />
        <CTA />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
