import React from 'react';
import { useQuery } from '@tanstack/react-query';

interface ContentSection {
  id: string;
  sectionKey: string;
  title?: string;
  subtitle?: string;
  content?: string;
  isActive: boolean;
}

const Screenshots: React.FC = () => {
    const { data: section, isLoading } = useQuery<ContentSection>({
        queryKey: ['content-section', 'screenshots'],
        queryFn: async () => {
            const response = await fetch('/api/content-sections/screenshots');
            if (!response.ok) throw new Error('خطا در دریافت محتوا');
            return response.json();
        },
    });

    if (isLoading) {
        return (
            <section id="screenshots" className="py-20 bg-gray-50">
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

    let screenshots: string[] = [];
    try {
        screenshots = section.content ? JSON.parse(section.content) : [];
    } catch (e) {
        console.error('Error parsing screenshots content:', e);
        return null;
    }

    return (
        <section id="screenshots" className="py-20 bg-gray-50">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-extrabold text-gray-800">{section.title || 'اسکرین‌شات‌های برنامه'}</h2>
                    <p className="text-lg text-gray-600 mt-2">{section.subtitle || 'نگاهی به رابط کاربری زیبا و بصری برنامه ما بیندازید.'}</p>
                </div>
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
