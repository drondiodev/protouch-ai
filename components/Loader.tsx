
import React from 'react';
import { useTranslation } from '../context/i18n';

interface LoaderProps {
    small?: boolean;
    light?: boolean; // If true, spinner is for dark backgrounds (i.e., has light colors)
}

const Loader: React.FC<LoaderProps> = ({ small = false, light = false }) => {
  const { t } = useTranslation();
  if (small) {
    const colorClasses = light ? 'border-t-white border-slate-500/50' : 'border-t-slate-800 border-slate-200';
    return <div className={`w-5 h-5 border-2 ${colorClasses} rounded-full animate-spin`}></div>;
  }
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-2 border-t-slate-800 border-slate-200 rounded-full animate-spin"></div>
        <p className="text-slate-500">{t('loader.generating')}</p>
    </div>
  );
};

export const PulsingLoader: React.FC = () => (
    <div className="flex items-center justify-center space-x-2">
        <div className="w-3 h-3 bg-slate-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
        <div className="w-3 h-3 bg-slate-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
        <div className="w-3 h-3 bg-slate-500 rounded-full animate-pulse"></div>
    </div>
);


export default Loader;