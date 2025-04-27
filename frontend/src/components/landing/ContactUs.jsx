import React from "react";

const ContactUs = () => {
    return (
        <div className="container mx-auto p-8 md:px-20 lg:px-32 w-full overflow-hidden" id="Contactus">
            <h1 className="text-2xl sm:text-4xl font-semibold mb-4 text-center">
                Contact <span className="font-light">Us</span>
            </h1>
            <p className="text-gray-500 text-center mb-10">
                We are here to assist you with any inquiries or support you may need.
                Feel free to reach out to us through any of the contact methods listed below.
                Our team is dedicated to providing prompt and helpful responses to ensure your satisfaction.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 bg-gray-100 p-10 rounded-lg shadow-md">
                <div className="flex flex-col items-center">
                    <h2 className="text-lg font-semibold mb-2">Address</h2>
                    <p className="text-gray-600 text-center">501/2, Eswaththa North, <br /> Puwakpitiya, Sri Lanka</p>
                </div>

                <div className="flex flex-col items-center border-y-2 border-y-gray-300 md:border-x-2 md:border-x-gray-300 md:border-y-0">
                    <h2 className="text-lg font-semibold mb-2">Phone</h2>
                    <p className="text-gray-600">+94 71 234 5678</p>
                    <p className="text-gray-600">+94 76 987 6543</p>
                </div>

                <div className="flex flex-col items-center">
                    <h2 className="text-lg font-semibold mb-2">Email</h2>
                    <p className="text-gray-600">infoktmfarm@gmail.com</p>
                    <p className="text-gray-600">supportktmfarm@gmail.com</p>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;