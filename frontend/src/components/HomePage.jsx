import React, { useEffect, useRef } from 'react';
import Hero from './Hero';
import Navbar from './Navbar';
import Lenis from 'lenis';

const HomePage = () => {
  const lenisRef = useRef(null);

  useEffect(() => {
    lenisRef.current = new Lenis({
      duration: 1.2,
      easing: (t) => t, 
      smooth: true,
    });

    function raf(time) {
      lenisRef.current.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenisRef.current.destroy();
    };
  }, []);

  return (
    <div className='w-full h-[200vh] relative'>
      <Navbar />
      <Hero />
    </div>
  );
};

export default HomePage;