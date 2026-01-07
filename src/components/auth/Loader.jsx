import React from 'react';
import logo from '../../assets/auth/logo.jpg';

const Loader = () => {
    return (
        <div className="h-screen w-full flex flex-col justify-center items-center bg-white">
            <div className="flex items-center gap-3 animate-pulse">
                <img 
                    src={logo} 
                    alt="Estospaces" 
                    className="h-10"
                />
                <span className="text-primary font-semibold text-2xl">Estospaces</span>
            </div>
            <div className="mt-8 flex gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
        </div>
    );
};

export default Loader;

