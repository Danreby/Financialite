import React from 'react';

const AddIcon = ({ type = 1, size = 18, color = 'text-white' }) => {
    return (
        <>
            {type === 1 && (
                <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} className={color} fill="currentColor" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"/>
                </svg>
            )}
            {type === 2 && (
                <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} className={color} fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
                </svg>
            )}
            {type === 3 && (
                <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} className={color} fill="currentColor" viewBox="0 0 16 16">
                    <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/>
                </svg>
            )}
            {type === 4 && (
                <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} className={color} fill="currentColor" viewBox="0 0 16 16">
                    <path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5"/>
                </svg>
            )}
        </>
    );
};

export default AddIcon;
