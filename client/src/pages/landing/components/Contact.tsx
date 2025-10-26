import React from 'react';

const Contact: React.FC = () => {
    return (
        <section id="contact" className="py-20 bg-white">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-extrabold text-gray-800">تماس با ما</h2>
                    <p className="text-lg text-gray-600 mt-2">سوالی دارید؟ خوشحال می‌شویم از شما بشنویم.</p>
                </div>
                <div className="max-w-3xl mx-auto">
                    <form className="space-y-6">
                        <div className="flex flex-col md:flex-row md:space-x-6 md:space-x-reverse space-y-6 md:space-y-0">
                            <input type="text" placeholder="نام شما" className="w-full p-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow text-right" />
                            <input type="email" placeholder="ایمیل شما" className="w-full p-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow text-right" />
                        </div>
                        <div>
                            <input type="text" placeholder="موضوع" className="w-full p-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow text-right" />
                        </div>
                        <div>
                            <textarea placeholder="پیام شما" rows={5} className="w-full p-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow text-right"></textarea>
                        </div>
                        <div className="text-center">
                            <button type="submit" className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-3 px-10 rounded-full hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300">
                                ارسال پیام
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default Contact;