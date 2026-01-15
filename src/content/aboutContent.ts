
export const aboutContent = {
    en: {
        hero: {
            name: "Abdullah Sherif",
            title: "Robotics & Automation Engineer",
            summary: "Mechatronics Engineer specialized in building intelligent robotic systems and industrial automation solutions. Passionate about bridging the gap between software and hardware through hands-on engineering.",
            cta: {
                projects: "/resources",
                contact: "mailto:eng.abdullah.sherif@gmail.com",
                cv: "#",
                labels: {
                    projects: "View Projects",
                    contact: "Contact Me",
                    cv: "Download CV"
                }
            },
            socials: {
                github: "https://github.com/Abdullah-Sherif935",
                linkedin: "https://www.linkedin.com/in/abdullah-sherif-abdulraouf",
                youtube: "https://www.youtube.com/@EngAbdullah-Sherif",
                facebook: "https://www.facebook.com/Abdullahsherif935/"
            }
        },
        bio: {
            sectionTitle: "About Me",
            headline: {
                prefix: "Engineering with a",
                highlight: "Hands-on",
                suffix: "Mindset"
            },
            education: {
                title: "Education",
                university: "Ain Shams University",
                degree: "B.Sc. in Mechatronics Engineering",
                location: "Cairo, Egypt",
                labels: {
                    period: "Degree Period",
                    major: "Major Focus"
                },
                periodRaw: "2021-2026",
                grade: "B+"
            },
            description: [
                "I am a Mechatronics Engineer with a deep passion for robotics and automation. My journey started with a fascination for how machines think and move, which led me to Ain Shams University, where I honed my skills in mechanical development, electronics, and control systems.",
                "I believe in a 'hands-on' approach to engineering. Whether it's designing a custom PCB, writing low-level firmware, or orchestrating high-level robot navigation using ROS, I enjoy being involved in every step of the development cycle.",
                "Beyond technical work, I am committed to sharing what I learn. I document my projects on GitHub and YouTube to help others in the community and to provide a transparent look into my engineering process."
            ],
            nav: {
                about: "About",
                skills: "Skills",
                projects: "Projects",
                experience: "Experience",
                services: "Services",
                contact: "Contact"
            }
        },
        skills: {
            title: "Technical Expertise",
            subtitle: "A multidisciplinary skill set across robotics middleware, embedded systems, and industrial automation.",
            list: [
                {
                    domain: "Robotics & Middleware",
                    items: ["ROS / ROS2", "MoveIt", "Gazebo Sim", "Navigation Stack", "OpenCV"]
                },
                {
                    domain: "Embedded & Hardware",
                    items: ["Arduino / ESP32", "STM32", "Raspberry Pi", "PCB Design", "Circuit Simulation"]
                },
                {
                    domain: "Programming",
                    items: ["Python", "C++", "TypeScript", "JavaScript", "Linux / Bash"]
                },
                {
                    domain: "Automation & Control",
                    items: ["PLC Programming", "SCADA / HMI", "Industrial Control", "PID Tuning", "IoT"]
                }
            ]
        },
        experience: {
            objective: "I am currently looking for junior roles in robotics, automation, or mechatronics engineering, as well as freelance projects that involve end-to-end system design and delivery.",
            focus: "My primary goal is to apply my interdisciplinary skills to solve real-world problems and contribute to the next generation of automation technology.",
            labels: {
                status: "Status",
                available: "Available",
                openFor: "Open For",
                freelance: "Freelance",
                workStyle: "Work Style",
                global: "Global"
            }
        },
        timeline: {
            title: "Engineering Journey",
            items: [
                {
                    year: "2024 - 2025",
                    title: "Graduation Project – Autonomous Automobile Robot Arm",
                    description: "Developed a 5-DOF robotic arm integrated with an autonomous vehicle. Focused on kinematic modeling, trajectory planning, and integration with ROS2 for intelligent task execution.",
                    icon: "🤖"
                },
                {
                    year: "2023 - 2024",
                    title: "Inspection Robot Arm Project",
                    description: "Designed and implemented a robotic system for industrial inspection tasks. Integrated computer vision for defect detection and used STM32 for precise motor control.",
                    icon: "🔍"
                },
                {
                    year: "2022 - 2023",
                    title: "Computer Vision Labs / Coursework",
                    description: "Completed advanced labs in image processing, object tracking, and spatial mapping using OpenCV and Python. Implemented real-time detection for manufacturing applications.",
                    icon: "👁️"
                }
            ]
        },
        featuredProjects: {
            title: "Featured Projects",
            subtitle: "A showcase of mechatronic systems, robotics automation, and computer vision implementation.",
            previewText: "Project Preview",
            labels: {
                demo: "Watch Demo",
                repo: "Repository"
            },
            items: [
                {
                    title: "Autonomous Automobile Robot Arm",
                    description: "A complete mechatronic system combining mobility and manipulation. Features ROS2 navigation and MoveIt for motion planning.",
                    tags: ["ROS2", "MoveIt", "C++", "Kinematics"],
                    image: "/assets/images/projects/robot-arm-auto.jpg",
                    links: { demo: "#", repo: "#" }
                },
                {
                    title: "Inspection Robot Arm",
                    description: "Industrial-grade inspection arm with integrated camera and defect analysis software. Built with STM32 and Python.",
                    tags: ["STM32", "Computer Vision", "Python", "CAD"],
                    image: "/assets/images/projects/inspection-arm.jpg",
                    links: { demo: "#", repo: "#" }
                },
                {
                    title: "Computer Vision Lab Tasks",
                    description: "A collection of CV algorithms for industrial automation, including barcode reading, part counting, and color sorting.",
                    tags: ["OpenCV", "Python", "Image Processing"],
                    image: "/assets/images/projects/cv-labs.jpg",
                    links: { demo: "#", repo: "#" }
                },
                {
                    title: "Robotics / Automation Mini Projects",
                    description: "Portfolio of various small-scale projects: PID-controlled balancing robots, IoT monitoring systems, and PLC automation.",
                    tags: ["Arduino", "PLC", "IoT", "Control"],
                    image: "/assets/images/projects/mini-projects.jpg",
                    links: { demo: "#", repo: "#" }
                }
            ]
        },
        services: {
            title: "My Services",
            titleHighlight: "Services",
            subtitle: "Professional engineering solutions tailored to robotics, automation, and industrial systems.",
            items: [
                {
                    title: "Robotics Prototyping",
                    description: "End-to-end design and assembly of robotic systems, from custom frame fabrication to actuator integration and sensor calibration.",
                    icon: "🤖"
                },
                {
                    title: "Embedded Systems",
                    description: "Low-level firmware development (C/C++) for STM32, Arduino, and ESP32. Real-time control and hardware-software optimization.",
                    icon: "📟"
                },
                {
                    title: "Automation Logic",
                    description: "Industrial control systems using PLC, SCADA, and PID tuning. Optimizing workflows for manufacturing and process control.",
                    icon: "⚙️"
                },
                {
                    title: "Technical Documentation",
                    description: "Detailed system architecture, CAD modeling reports, and comprehensive project guides for educational or industrial use.",
                    icon: "📝"
                }
            ]
        },
        contactSection: {
            title: "Get In Touch",
            subtitle: "Have a project idea or just want to say hi? Send me a message!",
            email: "eng.abdullah.sherif@gmail.com",
            labels: {
                emailMe: "Email Me",
                followMe: "Follow My Work"
            },
            form: {
                name: "Name",
                namePlaceholder: "Your full name",
                email: "Email",
                emailPlaceholder: "your@email.com",
                message: "Message",
                messagePlaceholder: "Tell me about your project...",
                button: "Send Message"
            }
        }
    },
    ar: {
        hero: {
            name: "عبد الله شريف",
            title: "مهندس ميكاترونيكس وأنظمة تحكم",
            summary: "مهندس ميكاترونيكس متخصص في بناء الأنظمة الروبوتية الذكية وحلول الأتمتة الصناعية. شغوف بسد الفجوة بين البرمجيات والهاردوير من خلال الهندسة التطبيقية والتصميم المتكامل.",
            cta: {
                projects: "/resources",
                contact: "mailto:eng.abdullah.sherif@gmail.com",
                cv: "#",
                labels: {
                    projects: "عرض المشاريع",
                    contact: "تواصل معي",
                    cv: "تحميل السيرة الذاتية"
                }
            },
            socials: {
                github: "https://github.com/Abdullah-Sherif935",
                linkedin: "https://www.linkedin.com/in/abdullah-sherif-abdulraouf",
                youtube: "https://www.youtube.com/@EngAbdullah-Sherif",
                facebook: "https://www.facebook.com/Abdullahsherif935/"
            }
        },
        bio: {
            sectionTitle: "من أنا",
            headline: {
                prefix: "هندسة تطبيقية بعقلية",
                highlight: "عملية ومبتكرة",
                suffix: ""
            },
            education: {
                title: "التعليم",
                university: "جامعة عين شمس",
                degree: "بكالوريوس هندسة الميكاترونيكس",
                location: "القاهرة، مصر",
                labels: {
                    period: "فترة الدراسة",
                    major: "التخصص الرئيسي"
                },
                periodRaw: "2021-2026",
                grade: "جيد جداً"
            },
            description: [
                "أنا مهندس ميكاترونيكس لدي شغف عميق بمجالات الروبوتات والأتمتة. بدأت رحلتي بالانبهار بكيفية عمل الآلات وتفكيرها، مما قادني إلى جامعة عين شمس، حيث صقلت مهاراتي في التصميم الميكانيكي، الإلكترونيات، وأنظمة التحكم.",
                "أؤمن بنهج 'التطبيق العملي' في الهندسة. سواء كان ذلك تصميم لوحات دوائر مطبوعة (PCB)، كتابة أكواد Firmware منخفضة المستوى، أو برمجة أنظمة الملاحة للروبوتات باستخدام ROS، فإنني أستمتع بالمشاركة في كل خطوة من دورة التطوير.",
                "بجانب العمل التقني، أنا ملتزم بمشاركة ما أتعلمه. أقوم بتوثيق مشاريعي على GitHub و YouTube لمساعدة الآخرين في المجتمع ولتقديم نظرة شفافة واحترافية لعمليتي الهندسية."
            ],
            nav: {
                about: "عنّي",
                skills: "المهارات",
                projects: "المشاريع",
                experience: "الخبرة",
                services: "الخدمات",
                contact: "تواصل"
            }
        },
        skills: {
            title: "الخبرات التقنية",
            subtitle: "مجموعة مهارات متعددة التخصصات عبر الروبوتات، الأنظمة المدمجة، والأتمتة الصناعية.",
            list: [
                {
                    domain: "الروبوتات والأنظمة الوسيطة",
                    items: ["ROS / ROS2", "MoveIt", "Gazebo Sim", "Navigation Stack", "OpenCV"]
                },
                {
                    domain: "الأنظمة المدمجة والهاردوير",
                    items: ["Arduino / ESP32", "STM32", "Raspberry Pi", "PCB Design", "Circuit Simulation"]
                },
                {
                    domain: "البرمجة والتطوير",
                    items: ["Python", "C++", "TypeScript", "JavaScript", "Linux / Bash"]
                },
                {
                    domain: "الأتمتة والتحكم الصناعي",
                    items: ["PLC Programming", "SCADA / HMI", "Industrial Control", "PID Tuning", "IoT"]
                }
            ]
        },
        experience: {
            objective: "أبحث حاليًا عن فرص عمل كمهندس مبتدئ (Junior) في مجالات الروبوتات، الأتمتة، أو الميكاترونيكس، بالإضافة إلى مشاريع العمل الحر التي تتضمن تصميم وتنفيذ الأنظمة الكاملة.",
            focus: "هدفي الأساسي هو تطبيق مهاراتي متعددة التخصصات لحل مشاكل واقعية والمساهمة في الجيل القادم من تكنولوجيا الأتمتة.",
            labels: {
                status: "الحالة",
                available: "متاح",
                openFor: "متاح لـ",
                freelance: "عمل حر",
                workStyle: "نظام العمل",
                global: "عن بعد / عالمي"
            }
        },
        timeline: {
            title: "رحلتي الهندسية",
            items: [
                {
                    year: "2024 - 2025",
                    title: "مشروع التخرج – ذراع روبوتية لمركبة ذاتية القيادة",
                    description: "تطوير ذراع روبوتية بـ 5 درجات حرية مدمجة مع مركبة ذاتية القيادة. التركيز على النمذجة الكينماتيكية، تخطيط المسار، والتكامل مع ROS2 لتنفيذ المهام الذكية.",
                    icon: "🤖"
                },
                {
                    year: "2023 - 2024",
                    title: "مشروع ذراع روبوت الفحص الصناعي",
                    description: "تصميم وتنفيذ نظام روبوتي لمهام الفحص الصناعي. دمج الرؤية الحاسوبية لاكتشاف العيوب واستخدام STM32 للتحكم الدقيق في المحركات.",
                    icon: "🔍"
                },
                {
                    year: "2022 - 2023",
                    title: "معامل ومشاريع الرؤية الحاسوبية",
                    description: "إتمام معامل متقدمة في معالجة الصور، تتبع الكائنات، والمسح المكاني باستخدام OpenCV و Python. تطبيق الكشف الفوري لأنظمة التصنيع.",
                    icon: "👁️"
                }
            ]
        },
        featuredProjects: {
            title: "مشاريع مميزة",
            subtitle: "معرض لأنظمة الميكاترونيكس، أتمتة الروبوتات، وتطبيقات الرؤية الحاسوبية.",
            previewText: "معاينة المشروع",
            labels: {
                demo: "شاهد العرض",
                repo: "الكود المصدري"
            },
            items: [
                {
                    title: "ذراع روبوتية لمركبة ذاتية القيادة",
                    description: "نظام ميكاترونيكس متكامل يجمع بين التنقل والمعالجة. يتميز بنظام ملاحة ROS2 و MoveIt لتخطيط الحركة.",
                    tags: ["ROS2", "MoveIt", "C++", "Kinematics"],
                    image: "/assets/images/projects/robot-arm-auto.jpg",
                    links: { demo: "#", repo: "#" }
                },
                {
                    title: "روبوت الفحص الصناعي",
                    description: "ذراع فحص صناعي مزود بكاميرا مدمجة وبرمجيات تحليل العيوب. مبني باستخدام STM32 و Python.",
                    tags: ["STM32", "Computer Vision", "Python", "CAD"],
                    image: "/assets/images/projects/inspection-arm.jpg",
                    links: { demo: "#", repo: "#" }
                },
                {
                    title: "تطبيقات الرؤية الحاسوبية الصناعية",
                    description: "مجموعة من خوارزميات الرؤية الحاسوبية للأتمتة الصناعية، تشمل قراءة الباركود، عد القطع، وفرز الألوان.",
                    tags: ["OpenCV", "Python", "Image Processing"],
                    image: "/assets/images/projects/cv-labs.jpg",
                    links: { demo: "#", repo: "#" }
                },
                {
                    title: "مشاريع الروبوتات والأتمتة المصغرة",
                    description: "مجموعة متنوعة من المشاريع الصغيرة: روبوتات التوازن (PID)، أنظمة مراقبة IoT، وأتمتة PLC.",
                    tags: ["Arduino", "PLC", "IoT", "Control"],
                    image: "/assets/images/projects/mini-projects.jpg",
                    links: { demo: "#", repo: "#" }
                }
            ]
        },
        services: {
            title: "خدماتي",
            titleHighlight: "الهندسية",
            subtitle: "حلول هندسية احترافية مصممة خصيصًا للروبوتات، الأتمتة، والأنظمة الصناعية.",
            items: [
                {
                    title: "نماذج الروبوتات الأولية",
                    description: "تصميم وتجميع شامل للأنظمة الروبوتية، من تصنيع الهياكل المخصصة إلى دمج المحركات ومعايرة المستشعرات.",
                    icon: "🤖"
                },
                {
                    title: "الأنظمة المدمجة (Embedded)",
                    description: "تطوير البرمجيات الثابتة (C/C++) لـ STM32 و Arduino و ESP32. التحكم في الوقت الفعلي وتحسين التكامل بين الهاردوير والسوفتوير.",
                    icon: "📟"
                },
                {
                    title: "منطق الأتمتة والتحكم",
                    description: "أنظمة التحكم الصناعي باستخدام PLC و SCADA وضبط PID. تحسين سير العمل للتصنيع والتحكم في العمليات.",
                    icon: "⚙️"
                },
                {
                    title: "التوثيق التقني والهندسي",
                    description: "هيكلية النظام التفصيلية، تقارير النمذجة (CAD)، وأدلة المشاريع الشاملة للاستخدام التعليمي أو الصناعي.",
                    icon: "📝"
                }
            ]
        },
        contactSection: {
            title: "تواصل معي",
            subtitle: "لديك فكرة مشروع أو ترغب في استشارة؟ لا تتردد في مراسلتي!",
            email: "eng.abdullah.sherif@gmail.com",
            labels: {
                emailMe: "راسلني",
                followMe: "تابع أعمالي"
            },
            form: {
                name: "الاسم",
                namePlaceholder: "الاسم بالكامل",
                email: "البريد الإلكتروني",
                emailPlaceholder: "your@email.com",
                message: "الرسالة",
                messagePlaceholder: "حدثني عن مشروعك...",
                button: "إرسال الرسالة"
            }
        }
    }
};
