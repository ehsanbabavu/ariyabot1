
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Screenshots from './components/Screenshots';
import Pricing from './components/Pricing';
import Testimonials from './components/Testimonials';
import CTA from './components/CTA';
import Contact from './components/Contact';
import Footer from './components/Footer';

const App: React.FC = () => {
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
};

export default App;
