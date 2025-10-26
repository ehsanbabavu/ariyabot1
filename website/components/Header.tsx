import React from 'react';

interface HeaderProps {
    scrolled: boolean;
}

const Header: React.FC<HeaderProps> = ({ scrolled }) => {
    const navLinks = [
        { name: "خانه", href: "home" },
        { name: "ویژگی‌ها", href: "features" },
        { name: "چگونه کار می‌کند", href: "how-it-works" },
        { name: "اسکرین‌شات‌ها", href: "screenshots" },
        { name: "قیمت‌گذاری", href: "pricing" },
        { name: "نظرات مشتریان", href: "testimonials" },
        { name: "تماس با ما", href: "contact" }
    ];


    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-4' : 'bg-transparent py-6'}`}>
            <div className="container mx-auto px-6 flex justify-between items-center">
                <div className="text-2xl font-bold text-gray-800">
                    <a href="#home" className="hover:text-pink-500 transition-colors">Apper</a>
                </div>
                <nav className="hidden lg:flex items-center space-x-8 space-x-reverse">
                    {navLinks.map(link => (
                        <a key={link.name} href={`#${link.href}`} className="text-gray-600 hover:text-pink-500 transition-colors font-medium">
                            {link.name}
                        </a>
                    ))}
                </nav>
                <a href="#download" className="hidden lg:inline-block bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-2 px-6 rounded-full hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300">
                    دانلود
                </a>
                <button className="lg:hidden text-gray-800">
                    <i className="fas fa-bars text-2xl"></i>
                </button>
            </div>
        </header>
    );
};

export default Header;