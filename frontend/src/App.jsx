import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar';
import Header from './components/Header';
import About from './components/About';
import Services from './components/Services';
import ContactUs from './components/ContactUs';
import Footer from './components/Footer';
import ScreenSizeIndicator from './components/ScreenSizeIndicator';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';

const LandingPage = () => {
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

const App = () => {
  return (
    <Router>
      {/* <Navbar /> */}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path='/signup' element={<SignUp />} />
      </Routes>
    </Router>
  );
}

export default App