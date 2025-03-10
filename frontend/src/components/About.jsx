import React from "react";
import { assets } from "../assets/assets";

const About = () => {
  return (
    <div className="flex flex-col items-center justify-center container mx-auto p-8 md:px-20 lg:px-32 w-full overflow-hidden"
      id="About">
      <h1 className="text-2xl sm:text-4xl font-semibold mb-2">
        About{" "}
        <span className="font-light">
          Us
        </span>
      </h1>
      <p className="text-gray-500 text-center text-balance mb-8">
        At <b>KTM Farm</b>, we are dedicated to revolutionizing the way small
        and medium-scale chicken farms operate. Founded by Mr. Tharindu
        Madhusanka, KTM AGRI has grown from a modest startup to a thriving
        medium-scale enterprise, specializing in the production and sale of
        high-quality country eggs and chicks. Located in Puwakpitiya, Sri Lanka,
        our farm is committed to delivering fresh, nutritious products to our
        local community.
      </p>
      <div className="w-full">
        <div className="flex flex-col md:flex-row items-center justify-center md:items-center md:gap-20">
          <img
            src={assets.aboutUs}
            alt="about-image"
            className="w-full xs:w-1/2 md:w-3/4 lg:w-full max-w-lg"
          />
          <div className="flex flex-col items-center md:items-start mt-10 text-gray-600">
            <div className="grid grid-cols-2 gap-6 md:gap-x-20 w-full">
              <div>
                <p className="text-4xl font-medium text-gray-800">3+</p>
                <p>Years in Operation</p>
              </div>
              <div>
                <p className="text-4xl font-medium text-gray-800">60-70</p>
                <p>Chickens Managed</p>
              </div>
              <div>
                <p className="text-4xl font-medium text-gray-800">250+</p>
                <p>Orders Completed</p>
              </div>
              <div>
                <p className="text-4xl font-medium text-gray-800">100+</p>
                <p>Happy Customers</p>
              </div>

            </div>
          </div>
        </div>
      </div>
      <p className="text-gray-500 text-center text-balance mt-8 ">
        <b>Our mission</b> is to provide sustainable and innovative farming
        solutions that empower local farmers and contribute to the overall
        well-being of our society. We believe in the importance of ethical
        farming practices and strive to maintain the highest standards of animal
        welfare and environmental stewardship.
      </p>
    </div>
  );
};

export default About;
