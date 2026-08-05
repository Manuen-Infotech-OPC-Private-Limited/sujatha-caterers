import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Player } from '@lottiefiles/react-lottie-player';
import orderSuccessAnimation from '../assets/lottie/order-placed.json';

const OrderPlacedAnimation = ({ duration = 3000, soundUrl }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Play sound if provided
    if (soundUrl) {
      const audio = new Audio(soundUrl);
      // Browsers reject autoplay without a prior gesture; the animation should
      // still run rather than throwing an unhandled rejection.
      audio.play().catch(() => {});
    }

    // Navigate to home after duration
    const timer = setTimeout(() => {
      navigate('/');
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, navigate, soundUrl]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-sand-50 font-sans"
    >
      <Player
        autoplay
        keepLastFrame
        src={orderSuccessAnimation}
        style={{ height: '300px', width: '300px' }}
      />
      <h2 className="mt-5 font-display text-3xl text-sand-900 sm:text-4xl">
        Order placed successfully
      </h2>
      <p className="mt-2 text-[1.0625rem] text-sand-600">
        Taking you back home…
      </p>
    </div>
  );
};

export default OrderPlacedAnimation;
