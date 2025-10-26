import React from 'react';
import { useQuery } from '@tanstack/react-query';

interface Step {
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
  imageUrl?: string;
  isActive: boolean;
}

const HowItWorks: React.FC = () => {
    const { data: section, isLoading } = useQuery<ContentSection>({
        queryKey: ['content-section', 'how-it-works'],
        queryFn: async () => {
            const response = await fetch('/api/content-sections/how-it-works');
            if (!response.ok) throw new Error('خطا در دریافت محتوا');
            return response.json();
        },
    });

    if (isLoading) {
        return (
            <section id="how-it-works" className="py-20 bg-white">
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

    let steps: Step[] = [];
    try {
        steps = section.content ? JSON.parse(section.content) : [];
    } catch (e) {
        console.error('Error parsing how-it-works content:', e);
        return null;
    }

    const imageUrl = section.imageUrl || 'https://atiyehahmadi.ir/apper-demo/all-demo/03-app-landing-page-wave-animation/images/how-it-works-mobile.png';

    return (
        <section id="how-it-works" className="py-20 bg-white">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-extrabold text-gray-800">{section.title || 'چگونه کار می‌کند'}</h2>
                    <p className="text-lg text-gray-600 mt-2">{section.subtitle || 'یک فرآیند ساده سه مرحله‌ای برای شروع کار با برنامه ما.'}</p>
                </div>
                <div className="flex flex-col lg:flex-row items-center justify-center space-y-12 lg:space-y-0 lg:space-x-12 lg:space-x-reverse">
                   <div className="w-full lg:w-1/3 flex justify-center">
                       <img src={imageUrl} alt="How it works" className="max-w-xs transform -rotate-12"/>
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
