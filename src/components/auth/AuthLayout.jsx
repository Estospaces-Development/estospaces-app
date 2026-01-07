import React from 'react';

const AuthLayout = ({ image, children }) => {
    return (
        <div className="flex min-h-screen w-full">
            {/* Left side - Image */}
            <div
                className="hidden lg:block lg:w-1/2 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${image})` }}
            />
            
            {/* Right side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 py-12 lg:px-16 bg-white min-h-screen">
                <div className="w-full max-w-sm">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;

