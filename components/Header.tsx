
import React from 'react';

export const Header: React.FC = () => {
    return (
        <header className="text-center mb-8 md:mb-12">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
                Logo Animator Studio
            </h1>
            <p className="mt-2 text-lg text-gray-400">
                Bring your brand to life. From concept to animation.
            </p>
        </header>
    );
};
