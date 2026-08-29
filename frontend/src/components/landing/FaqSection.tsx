import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { t } = useTranslation();

  const faqs = [
    { question: t('landing.faq1Q'), answer: t('landing.faq1A') },
    { question: t('landing.faq2Q'), answer: t('landing.faq2A') },
    { question: t('landing.faq3Q'), answer: t('landing.faq3A') },
    { question: t('landing.faq4Q'), answer: t('landing.faq4A') },
    { question: t('landing.faq5Q'), answer: t('landing.faq5A') },
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-slate-950 border-t border-slate-800/80">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-xs font-semibold mb-3">
            <HelpCircle className="w-3.5 h-3.5" /> {t('landing.faqBadge')}
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            {t('landing.faqTitle')}
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            {t('landing.faqSubtitle')}
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden backdrop-blur-md transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-slate-200 text-sm hover:text-cyan-400 transition cursor-pointer"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-cyan-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-400 leading-relaxed border-t border-slate-800/50 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
