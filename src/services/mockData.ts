import type { Article } from '../types/article';
import type { Resource } from '../types/resource';

export interface Profile {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
}

export const MOCK_PROFILE: Profile = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    username: 'abdullah_sherif',
    full_name: 'Abdullah Sherif',
    avatar_url: 'https://github.com/shadcn.png',
};

export const MOCK_RESOURCES: Resource[] = [
    {
        id: '1',
        title: 'Project Circuit Schematics',
        url: '#',
        type: 'pdf',
        related_article_slug: 'building-6-dof-robot-arm',
        created_at: new Date().toISOString()
    },
    {
        id: '2',
        title: 'Arduino Source Code',
        url: 'https://github.com/abdullah-sherif',
        type: 'code',
        related_article_slug: 'understanding-pid-control',
        created_at: new Date().toISOString()
    },
    {
        id: '3',
        title: '3D Printing Assets',
        url: '#',
        type: 'link',
        related_article_slug: 'building-6-dof-robot-arm',
        created_at: new Date().toISOString()
    }
];

export const MOCK_ARTICLES: Article[] = [
    {
        id: '1',
        title: 'Building a 6-DOF Robot Arm from Scratch',
        slug: 'building-6-dof-robot-arm',
        excerpt: 'In this comprehensive guide, we explore the mechanical design and kinematic analysis required to build a custom 6-degree-of-freedom robotic arm...',
        content: '',
        content_md: '# Building a 6-DOF Robot Arm\n\nIn this comprehensive guide, we explore the mechanical design and kinematic analysis required to build a custom 6-degree-of-freedom robotic arm using 3D printed parts and stepper motors.\n\n## Mechanical Design\n\nThe arm consists of...',
        content_rich: null,
        category: 'Robotics',
        status: 'published',
        language: 'ar',
        created_at: new Date().toISOString(),
        image_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1000'
    },
    {
        id: '2',
        title: 'Understanding PID Control Systems',
        slug: 'understanding-pid-control',
        excerpt: 'PID controllers are the backbone of industrial automation. This article breaks down the Proportional, Integral, and Derivative terms...',
        content: '',
        content_md: '# Understanding PID Control\n\nPID controllers are the backbone of industrial automation. This article breaks down the Proportional, Integral, and Derivative terms with practical tuning examples.\n\n## The Three Terms\n\n* **P** - Proportional\n* **I** - Integral\n* **D** - Derivative',
        content_rich: null,
        category: 'Control Systems',
        status: 'published',
        language: 'ar',
        created_at: new Date().toISOString(),
        image_url: 'https://images.unsplash.com/photo-1555421689-d68471e189f2?auto=format&fit=crop&q=80&w=1000'
    },
    {
        id: '3',
        title: 'Getting Started with Industrial PLC Programming',
        slug: 'industrial-plc-programming-basics',
        excerpt: 'Ladder Logic vs Structured Text: A deep dive into modern PLC programming paradigms using Siemens TIA Portal.',
        content: '',
        content_md: '# PLC Programming Basics\n\nLadder Logic vs Structured Text: A deep dive into modern PLC programming paradigms using Siemens TIA Portal.\n\n## Why PLCs?\n\nPLCs are robust, reliable, and designed for harsh industrial environments.',
        content_rich: null,
        category: 'Automation',
        status: 'published',
        language: 'ar',
        created_at: new Date().toISOString(),
        image_url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=1000'
    }
];

export const getProfile = async (): Promise<Profile> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return MOCK_PROFILE;
};
