import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { aboutContent } from '../../content/aboutContent';
import { scaleIn } from '../../utils/animations';

export function AboutHeroImage() {
    const { i18n } = useTranslation();
    const name = aboutContent[i18n.language === 'ar' ? 'ar' : 'en'].hero.name;

    return (
        <motion.div
            className="relative group lg:ml-auto select-none"
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
        >
            {/* Main Image Container - Clear Oval (Ellipse) */}
            <div className="relative z-10 w-64 h-80 lg:w-[320px] lg:h-[420px] mx-auto overflow-hidden rounded-[50%_50%_50%_50%_/_50%_50%_50%_50%] border-4 border-white/10 shadow-[0_0_50px_rgba(59,130,246,0.3)] transition-transform duration-700 group-hover:scale-[1.03]">
                <img
                    src="/testwebsite/assets/images/about-profile.jpg"
                    alt={name}
                    className="w-full h-full object-cover object-center scale-110 group-hover:scale-105 transition-transform duration-700"
                />

                {/* Subtle scanning/glow line animation */}
                <div className="absolute inset-0 z-20 bg-gradient-to-b from-transparent via-blue-500/10 to-transparent h-20 -translate-y-full group-hover:animate-scan pointer-events-none" />
            </div>

            {/* Orbit / Orbiting halo effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] z-0">
                {/* Static Outer Glow */}
                <div className="absolute inset-0 bg-blue-600/20 rounded-full blur-[60px] opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />

                {/* Moving "Orbit" Rings */}
                <div className="absolute inset-0 border-2 border-blue-500/20 rounded-[50%_50%_50%_50%_/_50%_50%_50%_50%] animate-[spin_10s_linear_infinite]" />
                <div className="absolute inset-0 border border-purple-500/10 rounded-[50%_50%_50%_50%_/_50%_50%_50%_50%] scale-[1.15] animate-[spin_15s_linear_infinite_reverse]" />
            </div>

            {/* Futuristic floating accent */}
            <div className="absolute -right-4 top-1/4 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-x-4 group-hover:translate-x-0 hidden lg:flex">
                <div className="w-12 h-1 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,1)]" />
                <div className="w-8 h-1 bg-blue-400/50 rounded-full self-end" />
            </div>

            {/* Subtle Gradient Overlay on Image for blending */}
            <div className="absolute inset-0 z-11 pointer-events-none rounded-[50%] bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-60" />
        </motion.div>
    );
}
