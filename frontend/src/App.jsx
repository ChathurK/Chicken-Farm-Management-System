import React from 'react'
import Navbar from './components/navbar';
import Header from './components/Header';
import About from './components/About';
import Services from './components/Services';
import ContactUs from './components/ContactUs';
import Footer from './components/Footer';
import ScreenSizeIndicator from './components/ScreenSizeIndicator';

const App = () => {
  return (
    <div className='w-full overflow-hidden'>
      {/* <Navbar /> */}
      <Header />
      <About />
      <Services />
      <ContactUs />
      <Footer />
      <ScreenSizeIndicator />
    </div>
  );
}

export default App