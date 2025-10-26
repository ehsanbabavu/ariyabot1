import React from 'react';
import { useQuery } from '@tanstack/react-query';

interface Testimonial {
  quote: string;
  name: string;
  title: string;
  image: string;
}

interface ContentSection {
  id: string;
  sectionKey: string;
  title?: string;
  subtitle?: string;
  content?: string;
  isActive: boolean;
}

const TestimonialCard: React.FC<Testimonial> = ({ quote, name, title, image }) => (
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
    const { data: section, isLoading } = useQuery<ContentSection>({
        queryKey: ['content-section', 'testimonials'],
        queryFn: async () => {
            const response = await fetch('/api/content-sections/testimonials');
            if (!response.ok) throw new Error('خطا در دریافت محتوا');
            return response.json();
        },
    });

    if (isLoading) {
        return (
            <section id="testimonials" className="py-20 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    </div>
                </div>
            </section>
        );
    }

    if (!section || !section.isActive) {
        return null;
    }

    let testimonials: Testimonial[] = [];
    try {
        testimonials = section.content ? JSON.parse(section.content) : [];
    } catch (e) {
        console.error('Error parsing testimonials content:', e);
        return null;
    }

    return (
        <section id="testimonials" className="py-20 bg-gray-50">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-extrabold text-gray-800">{section.title || 'مشتریان ما چه می‌گویند'}</h2>
                    <p className="text-lg text-gray-600 mt-2">{section.subtitle || 'از مشتریان راضی ما بشنوید و ببینید چگونه برنامه ما به آنها کمک کرده است.'}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <TestimonialCard key={index} {...testimonial} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
