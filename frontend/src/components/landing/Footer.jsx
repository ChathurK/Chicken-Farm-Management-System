import React from "react";
import { assets } from "../../assets/assets";
import { FacebookLogo, InstagramLogo, TwitterLogo, GithubLogo, YoutubeLogo } from "@phosphor-icons/react";

const Footer = () => {
  return (
    <footer className="bg-amber-50 text-gray-700 py-8">
      {/* Top Row: Logo and Name */}
      <div className="flex flex-col items-center">
        <img src={assets.faviconBlackFilled} alt="KTM AGRI Logo" className="h-10 mb-2" />
        <h2 className="text-xl font-semibold">KTM AGRI</h2>
      </div>

      {/* Second Row: Navigation Links */}
      <nav className="flex justify-center space-x-6 mt-4">
        <a href="#Header" className="hover:text-amber-500 transition duration-200">Home</a>
        <a href="#About" className="hover:text-amber-500 transition duration-200">About</a>
        <a href="#Services" className="hover:text-amber-500 transition duration-200">Services</a>
        <a href="#Contactus" className="hover:text-amber-500 transition duration-200">Contact Us</a>
      </nav>

      {/* Third Row: Social Media Icons */}
      <div className="flex justify-center space-x-6 mt-4">
        <a href="#" className="hover:text-amber-500  transition duration-200">
          <FacebookLogo size={24} weight="duotone" />
        </a>
        <a href="#" className="hover:text-amber-500 transition duration-200">
          <InstagramLogo size={24} weight="duotone" />
        </a>
        <a href="#" className="hover:text-amber-500 transition duration-200">
          <TwitterLogo size={24} weight="duotone" />
        </a>
        <a href="#" className="hover:text-amber-500 transition duration-200">
          <GithubLogo size={24} weight="duotone" />
        </a>
        <a href="#" className="hover:text-amber-500 transition duration-200">
          <YoutubeLogo size={24} weight="duotone" />
        </a>
      </div>

      {/* Fourth Row: Copyright Information */}
      <div className="text-center mt-4 text-sm">
        &copy; {new Date().getFullYear()} KTM AGRI. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;