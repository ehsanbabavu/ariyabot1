import React from 'react';
import AppleIcon from './icons/AppleIcon';
import PlayStoreIcon from './icons/PlayStoreIcon';

const Hero: React.FC = () => {
    return (
        <section id="home" className="relative bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 text-white min-h-screen flex items-center overflow-hidden">
            <div className="container mx-auto px-6 text-center z-10">
                <div className="flex flex-wrap items-center">
                    <div className="w-full lg:w-1/2 text-right">
                        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 animate-fade-in-down" style={{lineHeight: '1.4'}}>
                            بهترین راه برای ارتباط با مشتریان شما
                        </h1>
                        <p className="text-lg md:text-xl mb-8 opacity-90 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                            یک لندینگ پیج قدرتمند و زیبا برای نمایش محصول شما و تبدیل بازدیدکنندگان به کاربران راضی.
                        </p>
                        <div className="flex justify-start space-x-4 space-x-reverse animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                            <a href="#" className="flex items-center bg-white text-gray-800 font-semibold py-3 px-6 rounded-full shadow-lg transform hover:scale-105 transition-transform duration-300">
                                <div className="text-right">
                                    <p className="text-xs">دانلود از</p>
                                    <p className="text-lg leading-tight">اپ استور</p>
                                </div>
                                <AppleIcon className="w-6 h-6 ml-2" />
                            </a>
                            <a href="#" className="flex items-center bg-white text-gray-800 font-semibold py-3 px-6 rounded-full shadow-lg transform hover:scale-105 transition-transform duration-300">
                                <div className="text-right">
                                    <p className="text-xs">دریافت از</p>
                                    <p className="text-lg leading-tight">گوگل پلی</p>
                                </div>
                                <PlayStoreIcon className="w-6 h-6 ml-2" />
                            </a>
                        </div>
                    </div>
                    <div className="w-full lg:w-1/2 mt-10 lg:mt-0 flex justify-center">
                       <img src="https://atiyehahmadi.ir/apper-demo/all-demo/03-app-landing-page-wave-animation/images/header-mobile.png" alt="App Screenshot" className="max-w-xs md:max-w-sm transform animate-float" />
                    </div>
                </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-48">
                <svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg" className="absolute bottom-0 w-full h-auto" style={{ transform: 'translateY(1px)' }}>
                    <path fill="rgba(255,255,255,0.2)" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,245.3C672,267,768,277,864,256C960,235,1056,181,1152,149.3C1248,117,1344,107,1392,101.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    <path fill="#ffffff" fillOpacity="1" d="M0,288L48,272C96,256,192,224,288,208C384,192,480,192,576,208C672,224,768,256,864,245.3C960,235,1056,181,1152,170.7C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                </svg>
            </div>
            <style jsx="true">{`
                @keyframes fade-in-down {
                    0% { opacity: 0; transform: translateY(-20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes fade-in-up {
                    0% { opacity: 0; transform: translateY(20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes float {
                    0% { transform: translateY(0px) rotate(-5deg); }
                    50% { transform: translateY(-20px) rotate(-5deg); }
                    100% { transform: translateY(0px) rotate(-5deg); }
                }
                .animate-fade-in-down { animation: fade-in-down 0.8s ease-out forwards; }
                .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
                .animate-float { animation: float 6s ease-in-out infinite; }
            `}</style>
        </section>
    );
};

export default Hero;