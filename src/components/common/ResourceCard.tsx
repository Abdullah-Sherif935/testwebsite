import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { buttonHover, buttonTap } from '../../utils/animations';

interface ResourceCardProps {
    title: string;
    description: string;
    icon?: ReactNode;
    action: {
        label: string;
        onClick: () => void;
    };
    backgroundImage?: string;
}

export function ResourceCard({ title, description, icon, action, backgroundImage }: ResourceCardProps) {
    return (
        <motion.div
            className="group relative overflow-hidden rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-blue-500/50 transition-colors duration-300 hover:shadow-lg hover:shadow-blue-500/10"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
        >
            {/* Background with overlay */}
            <div className="absolute inset-0 z-0">
                {backgroundImage && (
                    <img
                        src={backgroundImage}
                        alt=""
                        className="w-full h-full object-cover opacity-20 group-hover:scale-105 transition-transform duration-500"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/0 to-slate-900/90" />
            </div>

            {/* Content */}
            <div className="relative z-10 p-6 flex flex-col h-full">
                <div className="mb-4 inline-flex p-3 rounded-lg bg-blue-500/10 text-blue-400 w-fit group-hover:text-blue-300 transition-colors">
                    {icon}
                </div>

                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                    {title}
                </h3>

                <p className="text-slate-400 mb-6 flex-grow line-clamp-3">
                    {description}
                </p>

                <motion.button
                    onClick={action.onClick}
                    className="w-full py-2.5 rounded-lg bg-slate-800 text-slate-300 font-medium hover:bg-blue-600 hover:text-white"
                    whileHover={buttonHover}
                    whileTap={buttonTap}
                >
                    {action.label}
                </motion.button>
            </div>
        </motion.div>
    );
}
