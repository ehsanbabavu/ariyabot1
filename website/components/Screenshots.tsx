import React from 'react';

const screenshots = [
    "https://atiyehahmadi.ir/apper-demo/all-demo/03-app-landing-page-wave-animation/images/screenshots/1.jpg",
    "https://atiyehahmadi.ir/apper-demo/all-demo/03-app-landing-page-wave-animation/images/screenshots/2.jpg",
    "https://atiyehahmadi.ir/apper-demo/all-demo/03-app-landing-page-wave-animation/images/screenshots/3.jpg",
    "https://atiyehahmadi.ir/apper-demo/all-demo/03-app-landing-page-wave-animation/images/screenshots/4.jpg",
    "https://atiyehahmadi.ir/apper-demo/all-demo/03-app-landing-page-wave-animation/images/screenshots/5.jpg",
];

const Screenshots: React.FC = () => {
    return (
        <section id="screenshots" className="py-20 bg-gray-50">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-extrabold text-gray-800">اسکرین‌شات‌های برنامه</h2>
                    <p className="text-lg text-gray-600 mt-2">نگاهی به رابط کاربری زیبا و بصری برنامه ما بیندازید.</p>
                </div>
                {/* A simple grid for screenshots. A carousel would require a library. */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-8">
                    {screenshots.map((src, index) => (
                        <div key={index} className="rounded-lg overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300">
                             <img src={src} alt={`App Screenshot ${index + 1}`} className="w-full h-auto" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Screenshots;