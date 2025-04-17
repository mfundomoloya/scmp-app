import React from 'react';

const Button = ({ children, onClick, className }) => {
    return (
        <button
            onClick={onClick}
            className={`bg-blue-500 text-white rounded-lg py-2 px-4 hover:bg-blue-600 ${className}`}
        >
            {children}
        </button>
    );
};

export default Button;