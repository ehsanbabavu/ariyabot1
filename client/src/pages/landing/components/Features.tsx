import React from 'react';
import { useQuery } from '@tanstack/react-query';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface ContentSection {
  id: string;
  sectionKey: string;
  title?: string;
  subtitle?: string;
  content?: string;
  isActive: boolean;
}

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
    const { data: section, isLoading } = useQuery<ContentSection>({
        queryKey: ['content-section', 'features'],
        queryFn: async () => {
            const response = await fetch('/api/content-sections/features');
            if (!response.ok) throw new Error('خطا در دریافت محتوا');
            return response.json();
        },
    });

    if (isLoading) {
        return (
            <section id="features" className="py-20 bg-gray-50">
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

    let features: Feature[] = [];
    try {
        features = section.content ? JSON.parse(section.content) : [];
    } catch (e) {
        console.error('Error parsing features content:', e);
        return null;
    }

    return (
        <section id="features" className="py-20 bg-gray-50">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-extrabold text-gray-800">{section.title || 'ویژگی‌های فوق‌العاده'}</h2>
                    <p className="text-lg text-gray-600 mt-2">{section.subtitle || 'ویژگی‌های شگفت‌انگیزی را که برنامه ما را به بهترین انتخاب برای شما تبدیل می‌کند، کشف کنید.'}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <FeatureCard key={index} {...feature} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
