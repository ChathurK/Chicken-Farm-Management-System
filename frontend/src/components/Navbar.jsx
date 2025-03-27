import React from 'react'
import { assets } from '../assets/assets'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Navbar = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const navigate = useNavigate()

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [showMobileMenu])

  // Change navbar background color on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className={`fixed top-0 left-0 w-full z-10 ${isScrolled ? 'bg-gradient-to-t from-transparent to-amber-400' : 'bg-transparent'}`}>
      <div className='container min-w-full mx-auto flex justify-between items-center py-4 px-6 md:px-20 lg:px-32'>
        <img src={assets.faviconWhiteFilled} alt='logo' className='h-10 w-10' />
        <ul className='hidden md:flex gap-7 text-white'>
          <a href="#Header" className='cursor-pointer hover:text-gray-400 transition duration-200'>Home</a>
          <a href="#About" className='cursor-pointer hover:text-gray-400 transition duration-200'>About</a>
          <a href="#Services" className='cursor-pointer hover:text-gray-400 transition duration-200'>Services</a>
          <a href="#Contactus" className='cursor-pointer hover:text-gray-400 transition duration-200'>Contact Us</a>
        </ul>
        <button onClick={() => navigate('/signin')} className='hidden md:block bg-white px-8 py-2 rounded-full hover:bg-amber-400 transition duration-300'>Sign in</button>
        <img onClick={() => setShowMobileMenu(true)} src='https://img.icons8.com/?size=100&id=aflTW0mA9OBv&format=png&color=FFFFFF' className='md:hidden w-7 hover:bg-neutral-500 hover:bg-opacity-30 rounded-md cursor-pointer' alt="menu-icon"></img>
      </div>


      {/* -------- mobile menu -------- */}
      <div className={`md:hidden ${showMobileMenu ? 'fixed w-full' : 'h-0 w-0'} right-0 top-0 bg-white overflow-hidden transition-all duration-300`}>
        <div className='flex justify-end'>
          <img onClick={() => setShowMobileMenu(false)} src='https://img.icons8.com/?size=100&id=7FSknHLAHdnP&format=png&color=000000' className='w-6 mt-5 mr-7 cursor-pointer' alt='close-icon' />
        </div>
        <ul className='flex flex-col items-center text-base font-medium'>
          <a onClick={() => setShowMobileMenu(false)} href='#Header' className='px-4 py-2 inline-block'>Home</a>
          <a onClick={() => setShowMobileMenu(false)} href='#About' className='px-4 py-2 inline-block'>About</a>
          <a onClick={() => setShowMobileMenu(false)} href='#Services' className='px-4 py-2 inline-block'>Services</a>
          <a onClick={() => setShowMobileMenu(false)} href='#Contactus' className='px-4 py-2 inline-block'>Contact Us</a>
        </ul>
      </div>
    </div>
  )
}

export default Navbar
