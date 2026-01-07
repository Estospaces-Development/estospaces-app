import React from 'react';

const AuthLayout = ({ image, children }) => {
    return (
        <div className="flex min-h-screen w-full overflow-hidden">
            {/* Left side - Image (hidden on mobile) */}
            <div
                className="hidden md:block w-0 md:w-1/2 min-h-screen bg-cover bg-center bg-no-repeat relative"
                style={{ backgroundImage: `url(${image})` }}
            >
                {/* Overlay for better visual effect */}
                <div className="absolute inset-0 bg-black/10"></div>
            </div>
            
            {/* Right side - Form */}
            <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-6 py-12 md:px-16 bg-white min-h-screen">
                <div className="w-full max-w-sm">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;

