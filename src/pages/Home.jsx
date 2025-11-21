import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import BigPromise from '../components/BigPromise';
import SneakPeek from '../components/SneakPeek';
import Problem from '../components/Problem';
import Solution from '../components/Solution';
import SocialProof from '../components/SocialProof';
import WhyJoin from '../components/WhyJoin';
import Countdown from '../components/Countdown';
import FAQ from '../components/FAQ';
import FinalCTA from '../components/FinalCTA';
import Footer from '../components/Footer';

const Home = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Hero />
            <BigPromise />
            <SneakPeek />
            <Problem />
            <Solution />
            <SocialProof />
            <WhyJoin />
            <Countdown />
            <FAQ />
            <FinalCTA />
            <Footer />
        </div>
    );
};

export default Home;
