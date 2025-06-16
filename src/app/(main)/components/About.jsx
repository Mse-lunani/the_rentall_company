// src/components/About.jsx
"use client";
import Image from "next/image";
import { useEffect } from "react";

export default function About() {
  // Initialize AOS animations
  useEffect(() => {
    if (typeof window !== "undefined") {
      const AOS = require("aos");
      AOS.init();
    }
  }, []);

  return (
    <>
      {/* Who We Are Section */}
      <section id="about" className="about section">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row justify-content-center mb-5">
            <div
              className="col-lg-8 text-center"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <h2 className="section-heading">WHO WE ARE</h2>
            </div>
          </div>

          <div className="row align-items-center mb-5">
            <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
              <Image
                src="/assets/img/about/who.png"
                alt="Who We Are"
                width={400}
                height={300}
                style={{ maxWidth: "100%", height: "auto" }}
              />
            </div>
            <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
              <p>
                Rentall is a dynamic software company born from the intersection
                of real-estate know-how and cutting-edge technology. Our
                founding team—seasoned landlords, property managers, and
                engineers—came together with a shared vision: to remove the
                friction and headaches that come with running rental properties.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section id="about2" className="about section light-background">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row justify-content-center mb-5">
            <div
              className="col-lg-8 text-center"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <h2 className="section-heading">WHAT WE DO</h2>
            </div>
          </div>

          <div className="row justify-content-between align-items-center mb-5">
            <div className="col-md-5" data-aos="fade-up" data-aos-delay="100">
              <p style={{ textAlign: "right" }}>
                At Rentall, we deliver a comprehensive, cloud-based platform
                that unifies every facet of property management into one
                intuitive interface. We automate rent collections with secure
                online payments and reminders.
              </p>
            </div>
            <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
              <Image
                src="/assets/img/about/what.png"
                alt="What We Do"
                width={600}
                height={400}
                style={{ maxWidth: "100%", height: "auto" }}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
