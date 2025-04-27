import React from "react";
import Header from "./Header";
import About from "./About";
import Services from "./Services";
import ContactUs from "./ContactUs";
import Footer from "./Footer";

const LandingPage = () => {
    return (
        <div className="w-full overflow-hidden">
            <Header />
            <About />
            <Services />
            <ContactUs />
            <Footer />
        </div>
    );
}

export default LandingPage;