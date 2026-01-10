import React from 'react';
import { UserCheck, Eye, Users, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Solution = () => {
    const steps = [
        {
            icon: <UserCheck className="text-white" size={32} />,
            number: '01',
            title: 'Brokers Verify & Create',
            description: 'Verified brokers create immersive virtual tours of their properties.'
        },
        {
            icon: <Eye className="text-white" size={32} />,
            number: '02',
            title: 'You Explore Virtually',
            description: 'Discover and tour properties from anywhere—no travel required.'
        },
        {
            icon: <Users className="text-white" size={32} />,
            number: '03',
            title: 'Connect & Close',
            description: 'Reach out to brokers, finalize details, and close deals seamlessly.'
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: [0.25, 0.1, 0.25, 1]
            }
        }
    };

    return (
        <section id="how-it-works" className="py-32 bg-gradient-to-b from-gray-50 dark:from-gray-900 to-white dark:to-gray-900 relative overflow-hidden">
            {/* Decorative Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[15%] left-[5%] w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[15%] right-[5%] w-96 h-96 bg-orange-200/10 rounded-full blur-3xl"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
                >
                    {/* Section Header */}
                    <div className="text-center mb-20 max-w-3xl mx-auto">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                            className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6 tracking-tight"
                        >
                            How <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-600">Estospaces</span> Works
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                            className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed"
                        >
                            A simple, transparent process powered by verified brokers and virtual technology.
                        </motion.p>
                    </div>

                    {/* Steps */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto"
                    >
                        {steps.map((step, index) => (
                            <motion.div key={index} variants={itemVariants} className="relative group">
                                {/* Connector Arrow (hidden on mobile) */}
                                {index < steps.length - 1 && (
                                    <div className="hidden md:flex absolute top-20 left-[60%] w-[80%] items-center justify-center z-0">
                                        <div className="w-full h-0.5 bg-gradient-to-r from-primary/30 to-transparent"></div>
                                        <ArrowRight className="text-primary/30 absolute right-0" size={24} />
                                    </div>
                                )}

                                <div className="relative z-10 text-center bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 h-full flex flex-col items-center">
                                    {/* Icon Circle with Gradient & Floating Animation */}
                                    <motion.div
                                        animate={{ y: [0, -10, 0] }}
                                        transition={{
                                            duration: 4,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                            delay: index * 1 // Stagger the floating animation
                                        }}
                                        className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-primary to-orange-600 rounded-2xl mb-6 shadow-xl relative"
                                    >
                                        {step.icon}
                                        {/* Step Number Badge */}
                                        <div className="absolute -top-3 -right-3 w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center border-2 border-primary/20 dark:border-primary/40">
                                            <span className="text-primary font-bold text-lg">{step.number}</span>
                                        </div>
                                    </motion.div>

                                    {/* Content */}
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 group-hover:text-primary transition-colors duration-300">
                                        {step.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                        {step.description}
                                    </p>

                                    {/* Decorative Bottom Border */}
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-3xl"></div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Bottom CTA */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 1, duration: 1 }}
                        className="text-center mt-16"
                    >
                        <p className="text-gray-500 dark:text-gray-400 text-sm tracking-wider uppercase mb-4">
                            Simple • Transparent • Effective
                        </p>
                        <div className="flex justify-center gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce delay-100"></div>
                            <div className="w-2 h-2 bg-primary/30 rounded-full animate-bounce delay-200"></div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default Solution;
