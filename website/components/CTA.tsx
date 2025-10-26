import React from 'react';
import AppleIcon from './icons/AppleIcon';
import PlayStoreIcon from './icons/PlayStoreIcon';

const CTA: React.FC = () => {
    return (
        <section id="download" className="py-20 bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('https://picsum.photos/1920/1080?grayscale&blur=2')" }}>
            <div className="container mx-auto px-6 text-center bg-black bg-opacity-50 py-16 rounded-xl">
                <h2 className="text-4xl font-extrabold text-white mb-4">همین حالا برنامه را دانلود کنید</h2>
                <p className="text-lg text-gray-200 mb-8 max-w-3xl mx-auto">
                    همین امروز کار با برنامه ما را شروع کنید! در هر دو پلتفرم iOS و Android موجود است. به هزاران کاربر راضی بپیوندید و تجربه خود را متحول کنید.
                </p>
                <div className="flex justify-center space-x-4 space-x-reverse">
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
        </section>
    );
};

export default CTA;