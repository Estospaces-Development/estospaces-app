import React from 'react';
import { Eye, Shield, Zap, Bell, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import modernApartment from '../assets/modern-apartment.png';

const WhyJoin = () => {
    const benefits = [
        {
            icon: <Eye className="text-primary" size={24} />,
            text: 'First access to virtual property tours'
        },
        {
            icon: <Shield className="text-primary" size={24} />,
            text: 'Exclusive verified listings before public launch'
        },
        {
            icon: <Bell className="text-primary" size={24} />,
            text: 'Early notifications for new properties'
        },
        {
            icon: <Zap className="text-primary" size={24} />,
            text: 'Influence platform features as a founding user'
        },
        {
            icon: <Award className="text-primary" size={24} />,
            text: 'Founding member perks and priority support'
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
        <section id="join-waitlist" className="relative py-32 overflow-hidden min-h-[800px] flex items-center">
            {/* Parallax Background - Fixed Attachment for Robust Visibility */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: `url(${modernApartment})`,
                    backgroundAttachment: 'fixed',
                    backgroundPosition: 'center',
                    backgroundSize: 'cover'
                }}
            ></div>

            {/* Dark Gradient Overlay with Noise Texture for Realism */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-black/90 z-10"></div>

            {/* Optional: Radial Gradient for Spotlight Effect */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] z-10 pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
                className="container mx-auto px-4 relative z-20"
            >
                <div className="max-w-5xl mx-auto text-center">

                    {/* Header with 3D Text Shadow */}
                    <div className="mb-20 animate-fade-in-up">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.0, ease: [0.2, 0.8, 0.2, 1] }}
                            className="text-5xl md:text-7xl font-bold mb-6 text-white tracking-tight drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)]"
                        >
                            Join the <span className="text-primary relative inline-block">
                                Waitlist
                                <span className="absolute bottom-0 left-0 w-full h-2 bg-primary/30 blur-sm"></span>
                            </span>
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.0, delay: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
                            className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto font-light drop-shadow-md"
                        >
                            Be among the first to experience the future of real estate with exclusive access to virtual tours and verified listings.
                        </motion.p>
                    </div>

                    {/* Glassmorphism Benefits Grid with 3D Hover Effects */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 perspective-1000"
                    >
                        {benefits.slice(0, 3).map((benefit, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-3xl hover:bg-white/10 transition-all duration-500 group hover:-translate-y-4 hover:shadow-[0_10px_25px_-10px_rgba(249,115,22,0.2)] relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <motion.div
                                    animate={{ y: [0, -5, 0] }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: index * 0.5
                                    }}
                                    className="w-16 h-16 bg-gradient-to-br from-primary to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-500"
                                >
                                    {React.cloneElement(benefit.icon, { className: "text-white w-8 h-8" })}
                                </motion.div>
                                <p className="text-xl font-medium text-white relative z-10">
                                    {benefit.text}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* CTA Area with Glowing Effect */}
                    <div className="animate-fade-in-up delay-200 relative z-30">
                        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full transform scale-150 opacity-0 hover:opacity-100 transition-opacity duration-700"></div>
                        <button className="relative bg-gradient-to-r from-primary to-orange-600 text-white px-12 py-6 rounded-full font-bold text-xl hover:shadow-[0_0_30px_rgba(249,115,22,0.4)] transform hover:scale-105 transition-all duration-300 flex items-center gap-3 mx-auto border border-white/20">
                            Reserve Your Spot
                            <Zap size={24} className="fill-current animate-pulse" />
                        </button>
                        <p className="mt-8 text-gray-400 text-sm tracking-[0.2em] uppercase font-medium">
                            Limited Spots Available • No Commitment
                        </p>
                    </div>

                </div>
            </motion.div>
        </section>
    );
};

export default WhyJoin;
