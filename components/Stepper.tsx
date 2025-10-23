import React from 'react';
import { motion } from 'framer-motion';
import { CheckIcon } from './icons/Icons';

interface StepperProps {
  steps: { title: string; description: string }[];
  currentStep: number;
}

const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
  return (
    <div className="w-full flex items-center">
      {steps.map((step, stepIdx) => {
        const stepNumber = stepIdx + 1;
        const isCompleted = currentStep > stepNumber;
        const isCurrent = currentStep === stepNumber;

        return (
          <React.Fragment key={step.title}>
            {/* Step Item */}
            <motion.div
              animate={isCurrent ? { scale: 1.03 } : { scale: 1 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={`relative flex items-center gap-4 p-3 rounded-lg transition-colors duration-300 -m-3
                ${isCurrent ? 'bg-white/5' : ''}`
              }
            >
              <motion.div
                className="absolute inset-0 border border-transparent rounded-lg"
                animate={isCurrent ? { borderColor: 'rgba(255, 255, 255, 0.1)' } : { borderColor: 'rgba(255, 255, 255, 0)' }}
                transition={{ duration: 0.3 }}
              ></motion.div>

              {/* Step Circle */}
              <div
                className={`relative z-10 flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg transition-all duration-300
                  ${isCompleted ? 'bg-white text-zinc-900' : ''}
                  ${isCurrent ? 'bg-white text-zinc-900' : ''}
                  ${!isCompleted && !isCurrent ? 'bg-zinc-700 text-zinc-400' : ''}
                `}
              >
                {isCompleted ? <CheckIcon className="w-6 h-6" /> : stepNumber}
              </div>
              {/* Step Text */}
              <div className="hidden md:block">
                <h3 className="font-bold text-white whitespace-nowrap">{step.title}</h3>
                <p className="text-sm text-zinc-400 whitespace-nowrap">{step.description}</p>
              </div>
            </motion.div>

            {/* Connector */}
            {stepIdx < steps.length - 1 && (
              <div className="flex-1 h-1 mx-4 sm:mx-6 bg-zinc-700/75 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white"
                  initial={{ width: '0%' }}
                  animate={{ width: isCompleted ? '100%' : '0%' }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default Stepper;
