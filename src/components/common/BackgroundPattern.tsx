import { useTranslation } from 'react-i18next';

export function BackgroundPattern({ className = '' }: { className?: string }) {
    const { i18n } = useTranslation();
    const isRTL = i18n.dir() === 'rtl';

    return (
        <div className={`absolute inset-0 z-0 opacity-20 pointer-events-none ${isRTL ? 'scale-x-[-1]' : ''} ${className}`}>
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:40px_40px]" />
        </div>
    );
}
