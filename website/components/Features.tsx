import React from 'react';

const featuresData = [
    { icon: 'fa-regular fa-comments', title: 'استفاده آسان', description: 'برنامه ما با در نظر گرفتن سادگی طراحی شده است. کنترل‌های بصری و رابط کاربری تمیز.' },
    { icon: 'fa-solid fa-mobile-screen-button', title: 'کاملاً واکنش‌گرا', description: 'در هر اندازه صفحه‌نمایشی، از دسکتاپ تا تلفن‌های همراه، عالی به نظر می‌رسد.' },
    { icon: 'fa-regular fa-lightbulb', title: 'طراحی خلاقانه', description: 'طراحی جذاب بصری که تجربه کاربری و تعامل را افزایش می‌دهد.' },
    { icon: 'fa-solid fa-shield-halved', title: 'امنیت بالا', description: 'حفاظت از داده‌های شما با امنیت پیشرفته، اولویت اصلی ماست.' },
    { icon: 'fa-solid fa-headset', title: 'پشتیبانی ۲۴/۷', description: 'تیم پشتیبانی اختصاصی ما برای کمک به شما به صورت شبانه‌روزی آماده است.' },
    { icon: 'fa-solid fa-cloud-arrow-up', title: 'به‌روزرسانی رایگان', description: 'جدیدترین ویژگی‌ها و بهبودها را با به‌روزرسانی‌های منظم و رایگان دریافت کنید.' },
];

const FeatureCard: React.FC<{ icon: string; title: string; description: string; }> = ({ icon, title, description }) => (
    <div className="group bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer text-right">
        <div className="text-4xl text-pink-500 mb-4 group-hover:text-purple-600 transition-colors duration-300">
            <i className={icon}></i>
        </div>
        <h3 className="text-xl font-bold mb-2 text-gray-800">{title}</h3>
        <p className="text-gray-600">{description}</p>
    </div>
);

const Features: React.FC = () => {
    return (
        <section id="features" className="py-20 bg-gray-50">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-extrabold text-gray-800">ویژگی‌های فوق‌العاده</h2>
                    <p className="text-lg text-gray-600 mt-2">ویژگی‌های شگفت‌انگیزی را که برنامه ما را به بهترین انتخاب برای شما تبدیل می‌کند، کشف کنید.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featuresData.map((feature, index) => (
                        <FeatureCard key={index} {...feature} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;