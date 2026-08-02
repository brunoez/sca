import React from 'react';
import { HeroSection } from './HeroSection';
import { SecurityFeatures } from './SecurityFeatures';
import { ValueProps } from './ValueProps';
import { HowItWorks } from './HowItWorks';
import { FaqSection } from './FaqSection';

export const LandingPage: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col justify-between">
      <div>
        <HeroSection />
        <SecurityFeatures />
        <ValueProps />
        <HowItWorks />
        <FaqSection />
      </div>
    </div>
  );
};
