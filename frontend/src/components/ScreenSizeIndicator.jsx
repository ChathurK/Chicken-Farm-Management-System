import React, { useState, useEffect } from 'react';

const ScreenSizeIndicator = () => {
  const [screenSize, setScreenSize] = useState('');

  const updateScreenSize = () => {
    if (window.matchMedia('(min-width: 1536px)').matches) {
      setScreenSize('2xl');
    } else if (window.matchMedia('(min-width: 1280px)').matches) {
      setScreenSize('xl');
    } else if (window.matchMedia('(min-width: 1024px)').matches) {
      setScreenSize('lg');
    } else if (window.matchMedia('(min-width: 768px)').matches) {
      setScreenSize('md');
    } else if (window.matchMedia('(min-width: 640px)').matches) {
      setScreenSize('sm');
    } else {
      setScreenSize('xs');
    }
  };

  useEffect(() => {
    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      left: '10px',
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
    }}>
      {screenSize}
    </div>
  );
};

export default ScreenSizeIndicator;
