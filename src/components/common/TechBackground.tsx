import { useTranslation } from 'react-i18next';

export function TechBackground({ className = '' }: { className?: string }) {
    const { i18n } = useTranslation();
    const isRTL = i18n.dir() === 'rtl';

    return (
        <div className={`absolute inset-0 z-0 bg-slate-100 dark:bg-[#020617] overflow-hidden transition-colors duration-300 ${className}`}>
            {/* Dotted Pattern */}
            <div className="absolute inset-0 opacity-[0.15] dark:opacity-[0.2]"
                style={{
                    backgroundImage: `radial-gradient(#3b82f6 1px, transparent 1px)`,
                    backgroundSize: '24px 24px'
                }}
            />

            {/* Radial Gradient Base for depth */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(59,130,246,0.05),_transparent)] dark:bg-[radial-gradient(circle_at_50%_50%,_rgba(59,130,246,0.1),_transparent)]" />

            {/* Circuit Background Image */}
            <div
                className={`absolute inset-0 opacity-10 dark:opacity-40 mix-blend-multiply dark:mix-blend-screen bg-no-repeat bg-cover bg-right-top transition-transform duration-500 ${isRTL ? 'scale-x-[-1]' : ''}`}
                style={{
                    backgroundImage: 'url(/assets/images/bg-tech-circuit.png)',
                }}
            />

            {/* Overlay Gradient to fade out the left/right side (for text readability) */}
            <div className={`absolute inset-0 bg-gradient-to-r ${isRTL ? 'from-transparent via-slate-100/90 dark:via-[#0f172a]/80 to-slate-100 dark:to-[#0f172a]' : 'from-slate-100 dark:from-[#0f172a] via-slate-100/90 dark:via-[#0f172a]/80 to-transparent'}`} />
        </div>
    );
}
