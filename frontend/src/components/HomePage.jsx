import React, { useEffect, useRef } from 'react';
import Hero from './Hero';
import Navbar from './Navbar';
import Lenis from 'lenis';
import Grainient from '@/components/Grainient';

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
  <Grainient
    color1="#ebe6ea"
    color2="#050505"
    color3="#141414"
    timeSpeed={1.35}
    colorBalance={-0.36}
    warpStrength={1}
    warpFrequency={3.8}
    warpSpeed={2}
    warpAmplitude={50}
    blendAngle={0}
    blendSoftness={0.05}
    rotationAmount={500}
    noiseScale={2}
    grainAmount={0.1}
    grainScale={2}
    grainAnimated={false}
    contrast={1.5}
    gamma={1}
    saturation={1}
    centerX={0}
    centerY={0}
    zoom={0.9}
    className='fixed top-0 -z-10 max-h-screen rounded-2xl'
  />
  <Hero/>
</div>
  );
};

export default HomePage;