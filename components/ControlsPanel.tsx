
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SliderControl from './SliderControl';
import NumberInputStepper from './NumberInputStepper';
import { ChevronDownIcon } from './icons/Icons';
import { useTranslation } from '../context/i18n';

type Settings = {
    scale: number;
    frameThickness: number;
    frameStartPosition: number;
    frameEndPosition: number;
    badgeText: string;
    badgeColor: string;
    badgeTextColor: string;
    fontSize: number;
    letterSpacing: number;
    textPlacement: number;
    backgroundColor: string;
    showBadge: boolean;
}

interface ControlsPanelProps {
    settings: Settings;
    onSettingChange: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
    onInstantSettingChange: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
    onCommit: () => void;
}

const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div 
            className="relative" 
            onMouseEnter={() => setIsHovered(true)} 
            onMouseLeave={() => setIsHovered(false)}
        >
            {children}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-md shadow-lg z-10"
                    >
                        {text}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const Section: React.FC<{title: string; children: React.ReactNode; defaultOpen?: boolean}> = ({ title, children, defaultOpen = false }) => (
    <details className="border-b border-slate-200 last:border-b-0" open={defaultOpen}>
        <summary className="py-4 cursor-pointer font-semibold text-slate-800 hover:text-slate-900 list-none flex justify-between items-center transition-colors">
            {title}
            <ChevronDownIcon className="transition-transform rotate-on-open text-slate-500" />
        </summary>
        <div className="pb-6 pt-2 space-y-4">
            {children}
        </div>
    </details>
);

const ToggleSwitch: React.FC<{label: string, checked: boolean, onChange: (checked: boolean) => void}> = ({ label, checked, onChange }) => (
    <label className="flex items-center justify-between cursor-pointer p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
        <span className="font-semibold text-slate-800">{label}</span>
        <div className="relative">
            <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
            <div className={`block w-11 h-6 rounded-full transition-colors ${checked ? 'bg-slate-800' : 'bg-slate-300'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'translate-x-5' : ''}`}></div>
        </div>
    </label>
);


const ControlsPanel: React.FC<ControlsPanelProps> = ({ settings, onSettingChange, onInstantSettingChange, onCommit }) => {
    const { t } = useTranslation();
    return (
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <div className="space-y-4">
                 <ToggleSwitch label={t('controls.showBadge')} checked={settings.showBadge} onChange={(v) => onInstantSettingChange('showBadge', v)} />

                <div className="divide-y divide-slate-200">
                    <Section title={t('controls.image')} defaultOpen={true}>
                        <Tooltip text={t('controls.tooltip_scale')}>
                            <SliderControl label={t('controls.scale')} value={settings.scale} onChange={(v) => onSettingChange('scale', v)} onCommit={onCommit} min={0.1} max={3} step={0.01} />
                        </Tooltip>
                        <ColorPicker label={t('controls.background')} color={settings.backgroundColor} setColor={(c) => onInstantSettingChange('backgroundColor', c)} />
                    </Section>

                    {settings.showBadge && (
                        <>
                        <Section title={t('controls.frame')} defaultOpen={true}>
                            <ColorPicker label={t('controls.color')} color={settings.badgeColor} setColor={(c) => onInstantSettingChange('badgeColor', c)} />
                            <Tooltip text={t('controls.tooltip_thickness')}>
                                <SliderControl label={t('controls.thickness')} value={settings.frameThickness} onChange={(v) => onSettingChange('frameThickness', v)} onCommit={onCommit} min={1} max={100} step={1} />
                            </Tooltip>
                            <Tooltip text={t('controls.tooltip_start')}>
                                <SliderControl label={t('controls.start')} value={settings.frameStartPosition} onChange={(v) => onSettingChange('frameStartPosition', v)} onCommit={onCommit} min={0} max={100} step={1} />
                            </Tooltip>
                            <Tooltip text={t('controls.tooltip_end')}>
                                <SliderControl label={t('controls.end')} value={settings.frameEndPosition} onChange={(v) => onSettingChange('frameEndPosition', v)} onCommit={onCommit} min={0} max={100} step={1} />
                            </Tooltip>
                        </Section>
                        <Section title={t('controls.text')} defaultOpen={true}>
                             <div className="space-y-1">
                                <label htmlFor="badgeText" className="text-xs font-medium text-slate-500">{t('controls.content')}</label>
                                <input 
                                    type="text" 
                                    id="badgeText"
                                    value={settings.badgeText}
                                    onChange={(e) => onInstantSettingChange('badgeText', e.target.value.toUpperCase())}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 text-slate-900 placeholder-slate-400 focus:ring-1 focus:ring-slate-500 focus:border-slate-500 focus:outline-none"
                                />
                            </div>
                            <ColorPicker label={t('controls.color')} color={settings.badgeTextColor} setColor={(c) => onInstantSettingChange('badgeTextColor', c)} />
                            <div className="grid grid-cols-2 gap-4">
                                <Tooltip text={t('controls.tooltip_fontSize')}>
                                    <NumberInputStepper label={t('controls.fontSize')} value={settings.fontSize} onChange={(v) => onInstantSettingChange('fontSize', v)} step={1} min={10} />
                                </Tooltip>
                                <Tooltip text={t('controls.tooltip_spacing')}>
                                    <NumberInputStepper label={t('controls.spacing')} value={settings.letterSpacing} onChange={(v) => onInstantSettingChange('letterSpacing', v)} step={0.5} />
                                </Tooltip>
                            </div>
                            <Tooltip text={t('controls.tooltip_placement')}>
                                <SliderControl label={t('controls.placement')} value={settings.textPlacement} onChange={(v) => onSettingChange('textPlacement', v)} onCommit={onCommit} min={0} max={200} step={1} />
                            </Tooltip>
                        </Section>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};


const ColorPicker: React.FC<{label: string, color: string, setColor: (c: string) => void}> = ({label, color, setColor}) => {
    return (
        <div className="space-y-2">
            <label className="text-xs font-medium text-slate-500">{label}</label>
            <div className="flex items-center gap-2">
                <div className="relative w-8 h-8 flex-shrink-0">
                    <input 
                        type="color" 
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="w-full h-full rounded-md border border-slate-300" style={{backgroundColor: color}}></div>
                </div>
                <input 
                    type="text" 
                    value={color.toUpperCase()}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 text-slate-900 placeholder-slate-400 focus:ring-1 focus:ring-slate-500 focus:border-slate-500 font-mono text-sm focus:outline-none"
                />
            </div>
        </div>
    )
}


export default ControlsPanel;