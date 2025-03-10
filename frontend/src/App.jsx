import React from 'react'
import Navbar from './components/navbar';
import Header from './components/Header';
import About from './components/About';
import Services from './components/Services';
import ContactUs from './components/ContactUs';

const App = () => {
  return (
    <div className='w-full overflow-hidden'>
      {/* <Navbar /> */}
      <Header />
      <About />
      <Services />
      <ContactUs />
    </div>
  );
}

export default App