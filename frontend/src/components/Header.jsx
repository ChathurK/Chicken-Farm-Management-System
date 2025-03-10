import React from 'react'
import Navbar from './navbar'
import { assets } from '../assets/assets'

const Header = () => {
  return (
    <div className='min-h-screen mb-4 bg-cover flex items-center w-full overflow-hidden' style={{ backgroundImage: `url(${assets.backgroundImage})` }} id='Header'>
      <Navbar />
      <div className='container text-center mx-auto py-4 px-6 md:px-20 lg:px-32 text-white'>
        <h1 className='text-5xl sm:text-6xl md:text-[72px] inline-block max-w-3xl font-semibold pt-20'>Welcome to KTM AGRI</h1>
        <p className='text-lg md:text-2xl mt-4'>For the Best Poultry Products</p>
        {/* <button className='bg-white px-8 py-2 rounded-full mt-4'>Get started</button> */}
        <div className='space-x-6 mt-16'>
          <a href="#Services" className='border border-white px-8 py-3 rounded-full hover:bg-gray-400 hover:bg-opacity-20 transition duration-200'>Services</a>
          <a href="#Contactus" className='bg-amber-400 px-8 py-3 rounded-full border border-white hover:bg-opacity-75 transition duration-200'>Contact Us</a>
        </div>
      </div>
    </div>
  )
}

export default Header
