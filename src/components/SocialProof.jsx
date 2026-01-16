import React from 'react';
import { Users, Building2, Award, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

const SocialProof = () => {
    const stats = [
        {
            icon: <Building2 className="text-white" size={36} />,
            value: 'Virtual First',
            label: 'Platform'
        },
        {
            icon: <Award className="text-white" size={36} />,
            value: 'Verified',
            label: 'Brokers & Listings'
        },
        {
            icon: <Users className="text-white" size={36} />,
            value: 'Trusted',
            label: 'Broker Network'
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 1.4,
                ease: [0.2, 0.8, 0.2, 1]
            }
        }
    };

    return (
        <section className="py-32 bg-white text-gray-900 relative overflow-hidden">
            {/* Decorative Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[20%] left-[10%] w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
                className="container mx-auto px-4 relative z-10"
            >
                {/* Section Header */}
                <div className="text-center mb-20 max-w-4xl mx-auto">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.0, ease: [0.2, 0.8, 0.2, 1] }}
                        className="text-5xl md:text-6xl font-bold mb-6 tracking-tight leading-tight"
                    >
                        <span className="text-gray-900">Built for the Future of</span>{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-orange-600">
                            Real Estate
                        </span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.0, delay: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
                        className="text-xl text-gray-600 leading-relaxed"
                    >
                        Estospaces brings together cutting-edge virtual technology, verified brokers, and a trusted ecosystem.
                    </motion.p>
                </div>

                {/* Stats Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
                >
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            whileHover={{ 
                                y: -8,
                                scale: 1.02,
                                transition: { duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }
                            }}
                            className="relative bg-gradient-to-br from-white to-gray-50 border-2 border-gray-100 p-10 rounded-3xl text-center transition-all duration-500 transform group shadow-lg hover:shadow-2xl hover:border-primary/30 overflow-hidden"
                        >
                            {/* Animated gradient overlay on hover */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                            
                            {/* Decorative corner accent */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            
                            <div className="relative z-10">
                                <motion.div
                                    animate={{ y: [0, -8, 0] }}
                                    transition={{
                                        duration: 3.5,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: index * 0.5
                                    }}
                                    className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary via-orange-500 to-orange-600 rounded-2xl mb-8 shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 group-hover:shadow-2xl"
                                >
                                    <div className="group-hover:scale-110 transition-transform duration-300">
                                        {stat.icon}
                                    </div>
                                </motion.div>
                                <h3 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent group-hover:from-primary group-hover:via-orange-500 group-hover:to-orange-600 transition-all duration-500">
                                    {stat.value}
                                </h3>
                                <p className="text-lg font-medium text-gray-600 group-hover:text-gray-800 transition-colors duration-300">
                                    {stat.label}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>
        </section>
    );
};

export default SocialProof;
