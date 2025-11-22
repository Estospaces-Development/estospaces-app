import React from 'react';
import { motion } from 'framer-motion';
import { TestimonialsColumn } from './ui/TestimonialsColumn';

const testimonials = [
    {
        name: "Sarah Jenkins",
        role: "Homebuyer",
        content: "Estospaces completely changed how I looked for a home. The virtual tours felt so real that I only visited two properties in person before buying one!",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
        name: "Michael Chen",
        role: "Real Estate Investor",
        content: "The verified broker network is a game-changer. I've wasted so much time with fake listings on other platforms. Estospaces is pure efficiency.",
        image: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
        name: "Priya Patel",
        role: "Tenant",
        content: "Found my dream apartment in Mumbai without leaving my couch in Bangalore. The 3D walkthroughs gave me the confidence to book instantly.",
        image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
        name: "David Wilson",
        role: "Property Manager",
        content: "Listing our properties here has reduced our site visit overhead by 70%. We only meet serious buyers now. Highly recommended!",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
        name: "Emily Rodriguez",
        role: "First-time Buyer",
        content: "I was overwhelmed by the process until I found Estospaces. The transparency and ease of use made buying my first condo a breeze.",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
        name: "James Carter",
        role: "Broker",
        content: "Finally, a platform that values professional brokers. The leads I get here are high-quality and actually ready to transact.",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
        name: "Anita Roy",
        role: "Architect",
        content: "The visual fidelity of the 3D tours is impressive. It captures the architectural details that usually get lost in standard photos.",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
        name: "Robert Fox",
        role: "Developer",
        content: "We launched our latest project exclusively on Estospaces and sold out 40% of units within the first week. The platform works.",
        image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
        name: "Lisa Wang",
        role: "Interior Designer",
        content: "I use Estospaces to show clients potential layouts. The immersive experience helps them visualize the potential of a space immediately.",
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

const Testimonials = () => {
    return (
        <section className="bg-gray-50 py-24 relative overflow-hidden">
            <div className="container z-10 mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center justify-center max-w-3xl mx-auto mb-16"
                >
                    <div className="flex justify-center mb-4">
                        <div className="border border-primary/30 bg-primary/5 text-primary py-1 px-4 rounded-full text-sm font-medium">
                            Testimonials
                        </div>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-bold text-secondary mb-4 font-serif text-center">
                        Loved by <span className="text-primary">Thousands</span>
                    </h2>
                    <p className="text-xl text-gray-600 text-center max-w-2xl">
                        See what buyers, renters, and brokers are saying about their experience with Estospaces.
                    </p>
                </motion.div>

                <div className="flex justify-center gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] max-h-[400px] overflow-hidden">
                    <TestimonialsColumn testimonials={firstColumn} duration={40} />
                    <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={50} />
                    <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={45} />
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
