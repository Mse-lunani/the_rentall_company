"use client";
import { useEffect } from "react";
import Swiper from "swiper";
import "swiper/css";
import "swiper/css/navigation";

export default function Clients() {
  useEffect(() => {
    // Initialize Swiper when component mounts
    const swiper1 = new Swiper(".track-1", {
      loop: true,
      autoplay: {
        delay: 0,
        disableOnInteraction: false,
      },
      speed: 5000,
      grabCursor: true,
      slidesPerView: "auto",
      spaceBetween: 30,
    });

    const swiper2 = new Swiper(".track-2", {
      loop: true,
      autoplay: {
        delay: 0,
        reverseDirection: true,
        disableOnInteraction: false,
      },
      speed: 5000,
      grabCursor: true,
      slidesPerView: "auto",
      spaceBetween: 30,
    });

    return () => {
      swiper1.destroy();
      swiper2.destroy();
    };
  }, []);

  const clients = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <section id="clients" className="clients section">
      <div className="container-fluid" data-aos="fade-up" data-aos-delay="100">
        <div className="clients-slider">
          <div
            className="clients-track track-1 swiper"
            data-aos="fade-right"
            data-aos-delay="200"
          >
            <div className="swiper-wrapper">
              {[...clients, ...clients].map((client, index) => (
                <div
                  key={`track1-${index}`}
                  className="clients-slide swiper-slide"
                >
                  <img
                    src={`/assets/img/clients/clients-${client}.webp`}
                    className="img-fluid"
                    alt={`Client ${client}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Second track with reverse direction */}
      </div>
    </section>
  );
}
