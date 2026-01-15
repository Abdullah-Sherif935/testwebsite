import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { pageTransition } from '../utils/animations';
import { AboutHero } from '../components/About/AboutHero';
import { AboutBio } from '../components/About/AboutBio';
import { AboutSkills } from '../components/About/AboutSkills';
import { AboutTimeline } from '../components/About/AboutTimeline';
import { AboutProjects } from '../components/About/AboutProjects';
import { AboutServices } from '../components/About/AboutServices';
import { AboutContact } from '../components/About/AboutContact';
import { AboutNav } from '../components/About/AboutNav';

export function About() {
    const { t } = useTranslation();

    return (
        <motion.main
            className="pt-16"
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <Helmet>
                <title>{t('seo.about.title')}</title>
                <meta name="description" content={t('seo.about.description')} />
            </Helmet>
            <AboutHero />
            <AboutNav />
            <article>
                <div id="about"><AboutBio /></div>
                <div id="skills"><AboutSkills /></div>
                <div id="projects"><AboutProjects /></div>
                <div id="experience"><AboutTimeline /></div>
                <div id="services"><AboutServices /></div>
                <div id="contact"><AboutContact /></div>
            </article>
        </motion.main>
    );
}
