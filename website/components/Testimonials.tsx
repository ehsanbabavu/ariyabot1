import React from 'react';

const testimonialsData = [
    {
        quote: "این بهترین برنامه‌ای است که تا به حال استفاده کرده‌ام. طراحی تمیز و ویژگی‌ها فوق‌العاده کاربردی هستند. به شدت توصیه می‌شود!",
        name: "سارا رضایی",
        title: "مدیرعامل، شرکت",
        image: "https://picsum.photos/id/1011/100/100"
    },
    {
        quote: "یک تغییر دهنده بازی برای بهره‌وری تیم ما. ویژگی‌های همکاری یکپارچه و بصری هستند. یک ابزار ضروری.",
        name: "علی احمدی",
        title: "مدیر پروژه، راهکارهای فنی",
        image: "https://picsum.photos/id/1005/100/100"
    },
    {
        quote: "در ابتدا شک داشتم، اما این برنامه از تمام انتظارات من فراتر رفت. پشتیبانی مشتری نیز درجه یک است!",
        name: "مریم محمدی",
        title: "طراح فریلنسر",
        image: "https://picsum.photos/id/1027/100/100"
    },
];

const TestimonialCard: React.FC<typeof testimonialsData[0]> = ({ quote, name, title, image }) => (
    <div className="bg-white p-8 rounded-xl shadow-lg text-center">
        <p className="text-gray-600 italic mb-6">"{quote}"</p>
        <div className="flex items-center justify-center">
            <img src={image} alt={name} className="w-16 h-16 rounded-full ml-4" />
            <div className="text-right">
                <h4 className="font-bold text-gray-800">{name}</h4>
                <p className="text-sm text-gray-500">{title}</p>
            </div>
        </div>
    </div>
);

const Testimonials: React.FC = () => {
    return (
        <section id="testimonials" className="py-20 bg-gray-50">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-extrabold text-gray-800">مشتریان ما چه می‌گویند</h2>
                    <p className="text-lg text-gray-600 mt-2">از مشتریان راضی ما بشنوید و ببینید چگونه برنامه ما به آنها کمک کرده است.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonialsData.map((testimonial, index) => (
                        <TestimonialCard key={index} {...testimonial} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;