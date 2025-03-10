import React from 'react'
import Navbar from './components/navbar';
import Header from './components/Header';
import About from './components/About';
import Services from './components/Services';

const App = () => {
  return (
    <div className='w-full overflow-hidden'>
      {/* <Navbar /> */}
      <Header />
      <About />
      <Services />
    </div>
  );
}

export default App