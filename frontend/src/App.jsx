import React from 'react'
import Navbar from './components/navbar';
import Header from './components/Header';
import About from './components/About';

const App = () => {
  return (
    <div className='w-full overflow-hidden'>
      {/* <Navbar /> */}
      <Header />
      <About />
    </div>
  );
}

export default App