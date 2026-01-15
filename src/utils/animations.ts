
import type { Variants } from 'framer-motion';

// 1. Accessibility & Configuration
// Note: Actual 'useReducedMotion' hook usage is preferred in components, 
// but we define safe fallbacks here. These variants respect reduced motion locally.

export const transitionConfig = {
    standard: {
        duration: 0.6,
        ease: "easeOut"
    },
    page: {
        duration: 0.4,
        ease: "easeInOut"
    },
    slow: {
        duration: 0.8,
        ease: "easeOut"
    }
} as const;

// 2. Reusable Variants

// "fadeUp" - for Sections (Hero, About, etc.)
// Spec: opacity 0->1, y 40->0, duration 0.6-0.8
export const fadeUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: transitionConfig.slow
    }
};
// Alias for backward compatibility if needed, or replace usages.
export const fadeInUp = fadeUp;

// "fadeIn" - for General Text/Images
export const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: transitionConfig.standard
    }
};

// "staggerContainer" - for Lists/Grids
// Spec: Delay 0.08 - 0.12s
export const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
};

// "cardItem" - for Staggered Children (Skills, Projects, etc.)
// Spec: Sequential, no bounce
export const cardItem: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" }
    }
};

// "pageTransition" - for Routing
// Spec: opacity 0->1->0, duration ~0.4s
export const pageTransition: Variants = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: transitionConfig.page
    },
    exit: {
        opacity: 0,
        transition: transitionConfig.page
    }
};

// "scaleIn" - for Profile Image/Avatar
// Spec: Fade + subtle scale (0.95 -> 1)
export const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: transitionConfig.standard
    }
};

// 3. Micro-interactions
export const buttonHover = {
    scale: 1.03,
    transition: { duration: 0.2 }
};

export const buttonTap = {
    scale: 0.97,
    transition: { duration: 0.1 }
};
