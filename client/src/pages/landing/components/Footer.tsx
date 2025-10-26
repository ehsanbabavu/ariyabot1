import React from 'react';
import FacebookIcon from './icons/FacebookIcon';
import TwitterIcon from './icons/TwitterIcon';
import LinkedinIcon from './icons/LinkedinIcon';
import InstagramIcon from './icons/InstagramIcon';

const Footer: React.FC = () => {
    return (
        <footer className="bg-gray-800 text-white pt-16 pb-8 text-right">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    {/* Column 1 */}
                    <div>
                        <h3 className="text-2xl font-bold mb-4">آریا بات</h3>
                        <p className="text-gray-400 mb-4">
                            بهترین راه برای ارتباط با مشتریان و رشد کسب و کار شما.
                        </p>
                        <div className="flex space-x-4 space-x-reverse justify-end md:justify-start">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors"><FacebookIcon className="w-6 h-6" /></a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors"><TwitterIcon className="w-6 h-6" /></a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors"><LinkedinIcon className="w-6 h-6" /></a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors"><InstagramIcon className="w-6 h-6" /></a>
                        </div>
                    </div>

                    {/* Column 2 */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">درباره ما</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">درباره</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">خدمات</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">تیم</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">فرصت‌های شغلی</a></li>
                        </ul>
                    </div>

                    {/* Column 3 */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">لینک‌های سریع</h4>
                        <ul className="space-y-2">
                            <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">ویژگی‌ها</a></li>
                            <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors">قیمت‌گذاری</a></li>
                            <li><a href="#testimonials" className="text-gray-400 hover:text-white transition-colors">نظرات مشتریان</a></li>
                            <li><a href="#contact" className="text-gray-400 hover:text-white transition-colors">تماس</a></li>
                        </ul>
                    </div>
                    
                    {/* Column 4 */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">پشتیبانی</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">مرکز راهنمایی</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">سیاست حفظ حریم خصوصی</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">شرایط خدمات</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">سوالات متداول</a></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-500">
                    <p>&copy; {new Date().getFullYear()} آریا بات. تمامی حقوق محفوظ است.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;