"use client";
import { useEffect } from "react";
import Image from "next/image";

export default function Hero() {
  useEffect(() => {
    // Initialize AOS when component mounts
    if (typeof window !== "undefined") {
      const AOS = require("aos");
      AOS.init();
    }
  }, []);

  return (
    <section id="hero" className="hero section dark-background">
      <div className="container" data-aos="fade-up">
        <div className="row align-items-center">
          <div className="col-lg-6">
            <div
              className="hero-content"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <div className="hero-tag">
                <i className="bi bi-house"></i>
                <span>Property Management Simplified</span>
              </div>
              <h1>
                Manage Your Properties with{" "}
                <span className="highlight">Ease & Efficiency</span>
              </h1>
              {/* Rest of hero content */}
            </div>
          </div>
          <div className="col-lg-6">
            <Image
              src="/assets/img/about/home.jpeg"
              alt="Rentall Dashboard"
              width={600}
              height={400}
              className="img-fluid hero-image"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
