import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import CheckIcon from './icons/CheckIcon';
import XIcon from './icons/XIcon';

interface PricingFeature {
  text: string;
  available: boolean;
}

interface PricingPlan {
  name: string;
  monthly: number;
  yearly: number;
  features: PricingFeature[];
  popular: boolean;
}

interface ContentSection {
  id: string;
  sectionKey: string;
  title?: string;
  subtitle?: string;
  content?: string;
  isActive: boolean;
}

const PricingCard: React.FC<{ plan: PricingPlan; isYearly: boolean }> = ({ plan, isYearly }) => (
    <div className={`relative bg-white rounded-xl shadow-lg p-8 text-center transform transition-transform duration-300 ${plan.popular ? 'scale-105 border-4 border-pink-500' : 'hover:-translate-y-2'}`}>
        {plan.popular && (
            <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold px-4 py-1 rounded-full uppercase">محبوب‌ترین</div>
        )}
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</h3>
        <div className="my-6">
            <span className="text-5xl font-extrabold text-gray-900">${isYearly ? plan.yearly : plan.monthly}</span>
            <span className="text-gray-500">/{isYearly ? 'سال' : 'ماه'}</span>
        </div>
        <ul className="space-y-4 mb-8 text-right">
            {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                    {feature.available ? <CheckIcon className="w-5 h-5 text-green-500 ml-2" /> : <XIcon className="w-5 h-5 text-red-500 ml-2" />}
                    <span className={feature.available ? 'text-gray-700' : 'text-gray-400 line-through'}>{feature.text}</span>
                </li>
            ))}
        </ul>
        <button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-3 px-6 rounded-full hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300">
            انتخاب پلن
        </button>
    </div>
);

const Pricing: React.FC = () => {
    const [isYearly, setIsYearly] = useState(false);

    const { data: section, isLoading } = useQuery<ContentSection>({
        queryKey: ['content-section', 'pricing'],
        queryFn: async () => {
            const response = await fetch('/api/content-sections/pricing');
            if (!response.ok) throw new Error('خطا در دریافت محتوا');
            return response.json();
        },
    });

    if (isLoading) {
        return (
            <section id="pricing" className="py-20 bg-white">
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

    let pricingPlans: PricingPlan[] = [];
    try {
        pricingPlans = section.content ? JSON.parse(section.content) : [];
    } catch (e) {
        console.error('Error parsing pricing content:', e);
        return null;
    }

    return (
        <section id="pricing" className="py-20 bg-white">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-extrabold text-gray-800">{section.title || 'پلن‌های قیمت‌گذاری'}</h2>
                    <p className="text-lg text-gray-600 mt-2">{section.subtitle || 'پلنی را انتخاب کنید که برای شما مناسب باشد. تمام پلن‌ها با ضمانت ۳۰ روزه بازگشت وجه ارائه می‌شوند.'}</p>
                </div>

                <div className="flex justify-center items-center mb-12">
                    <span className={`font-semibold ${!isYearly ? 'text-purple-600' : 'text-gray-500'}`}>ماهانه</span>
                    <label className="relative inline-flex items-center cursor-pointer mx-4">
                        <input type="checkbox" checked={isYearly} onChange={() => setIsYearly(!isYearly)} className="sr-only peer" />
                        <div className="w-14 h-7 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1/2 after:-translate-y-1/2 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                    <span className={`font-semibold ${isYearly ? 'text-purple-600' : 'text-gray-500'}`}>سالانه</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {pricingPlans.map((plan, index) => (
                        <PricingCard key={index} plan={plan} isYearly={isYearly} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Pricing;
