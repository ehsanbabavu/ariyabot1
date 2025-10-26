import React from 'react';

const steps = [
    { icon: 'fa-solid fa-download', title: 'برنامه را دانلود کنید', description: 'با دانلود رایگان برنامه ما از اپ استور یا گوگل پلی شروع کنید.' },
    { icon: 'fa-solid fa-user-plus', title: 'حساب کاربری بسازید', description: 'برای شروع، تنها در چند مرحله ساده برای یک حساب کاربری جدید ثبت نام کنید.' },
    { icon: 'fa-solid fa-rocket', title: 'از برنامه لذت ببرید', description: 'همه چیز آماده است! تمام ویژگی‌ها را کاوش کنید و از تجربه خود لذت ببرید.' },
];

const HowItWorks: React.FC = () => {
    return (
        <section id="how-it-works" className="py-20 bg-white">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-extrabold text-gray-800">چگونه کار می‌کند</h2>
                    <p className="text-lg text-gray-600 mt-2">یک فرآیند ساده سه مرحله‌ای برای شروع کار با برنامه ما.</p>
                </div>
                <div className="flex flex-col lg:flex-row items-center justify-center space-y-12 lg:space-y-0 lg:space-x-12 lg:space-x-reverse">
                   <div className="w-full lg:w-1/3 flex justify-center">
                       <img src="https://atiyehahmadi.ir/apper-demo/all-demo/03-app-landing-page-wave-animation/images/how-it-works-mobile.png" alt="How it works" className="max-w-xs transform -rotate-12"/>
                   </div>
                   <div className="w-full lg:w-1/2">
                       <ul className="space-y-8">
                           {steps.map((step, index) => (
                               <li key={index} className="flex items-start">
                                   <div className="flex-shrink-0">
                                       <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg">
                                           <i className={`${step.icon} text-xl`}></i>
                                       </div>
                                   </div>
                                   <div className="mr-6 text-right">
                                       <h3 className="text-xl font-bold text-gray-800">{step.title}</h3>
                                       <p className="mt-1 text-gray-600">{step.description}</p>
                                   </div>
                               </li>
                           ))}
                       </ul>
                   </div>
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;