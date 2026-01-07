import React from 'react';
import { ChatProvider } from '../contexts/ChatContext';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import BigPromise from '../components/BigPromise';
import SneakPeek from '../components/SneakPeek';
import Problem from '../components/Problem';
import Solution from '../components/Solution';
import SocialProof from '../components/SocialProof';
import Testimonials from '../components/Testimonials';
import WhyJoin from '../components/WhyJoin';
import Countdown from '../components/Countdown';
import FAQ from '../components/FAQ';
import FinalCTA from '../components/FinalCTA';
import Footer from '../components/Footer';
import ChatWidget from '../components/LiveChat/ChatWidget';

const Home = () => {
    return (
        <ChatProvider>
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <Hero />
                <BigPromise />
                <SneakPeek />
                <Problem />
                <Solution />
                <SocialProof />
                <Testimonials />
                <WhyJoin />
                <Countdown />
                <FAQ />
                <FinalCTA />
                <Footer />
                <ChatWidget />
            </div>
        </ChatProvider>
    );
};

export default Home;
