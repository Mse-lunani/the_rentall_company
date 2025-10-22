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
                friction and headaches that come with running rental
                properties.We are a data-centric technological
                company,redefining real estate management through technology,
                transparency, and trust.We believe that property ownership,
                leasing, and tenant management should be seamless, efficient,
                and empowering for everyone involved. As a forward-thinking real
                estate management company, we leverage innovation to simplify
                how property owners, tenants, and administrators interact —
                creating an ecosystem where every stakeholder thrives.
              </p>
              <p>
                Our foundation is built on integrity, efficiency, and customer
                satisfaction. Whether it’s managing residential apartments,
                commercial spaces, or multi-unit properties, The Rentall Company
                stands for smart, data-driven real estate management that
                transforms everyday living into an elevated experience.
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
              <p style={{ textAlign: "left" }}>
                The Rentall Company provides an all-in-one platform that
                streamlines property management — connecting property owners,
                and tenants through a secure and intuitive digital experience.
                We help property owners manage listings, track payments, and
                monitor performance effortlessly, while giving tenants a
                convenient way to pay rent, request maintenance, and communicate
                with their landlords.
              </p>
              <p style={{ textAlign: "left" }}>
                Our comprehensive solutions include:
              </p>
              <ul style={{ textAlign: "left" }}>
                <li>
                  Digital Property Management: End-to-end automation of property
                  listings, occupancy, and rent collection analytics
                </li>
                <li>
                  Tenant & Lease Management: Simplified tools for onboarding,
                  tracking leases, and ensuring compliance.
                </li>
                <li>
                  Analytics & Reporting: Real-time insights that empower smarter
                  decisions for owners and managers.
                </li>
                <li>
                  Maintenance Coordination: Streamlined requests and vendor
                  management to ensure property quality.
                </li>
              </ul>
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
