import React from 'react';
import Lottie from 'lottie-react';
import loadingAnimation from '../../../public/loadingAnimation.json'; // Adjust the path if needed

const LoadingAnimation = ({ size = '25%' }) => (
    <div style={{ position: 'fixed',      // Fixes the position relative to the viewport
        top: 0,                 // Aligns to the top of the screen
        left: 0,                // Aligns to the left of the screen
        width: '100%',          // Takes full width of the screen
        height: '100vh',        // Takes full height of the screen
        display: 'flex',        // Flexbox to center the animation
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Optional: Darkens the background to indicate a loading state
        zIndex: 9999    }}>
        <Lottie 
            animationData={loadingAnimation} 
            loop={true} 
            style={{ width: size, height: size }} // Customize size using the size prop
        />
    </div>
);

export default LoadingAnimation;