"use client";
import { useState } from "react";
import Image from "next/image";
import {
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhoneAlt,
  FaClock,
} from "react-icons/fa";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [formStatus, setFormStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus("loading");

    try {
      // Replace with your actual form submission logic
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setFormStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });

      // Reset status after 5 seconds
      setTimeout(() => setFormStatus(""), 5000);
    } catch (error) {
      setFormStatus("error");
      setTimeout(() => setFormStatus(""), 5000);
    }
  };

  return (
    <section id="contact" className="contact section">
      <div className="container section-title" data-aos="fade-up">
        <h2>Contact</h2>
        <p>Get in touch with our team for any inquiries</p>
      </div>

      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="contact-main-wrapper">
          <div className="map-wrapper">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d48389.78314118045!2d-74.006138!3d40.710059!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a22a3bda30d%3A0xb89d1fe6bc499443!2sDowntown%20Conference%20Center!5e0!3m2!1sen!2sus!4v1676961268712!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="contact-content">
            <div
              className="contact-cards-container"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              {[
                {
                  icon: <FaMapMarkerAlt />,
                  title: "Location",
                  text: "8721 Broadway Avenue, New York, NY 10023",
                },
                {
                  icon: <FaEnvelope />,
                  title: "Email",
                  text: "info@examplecompany.com",
                },
                {
                  icon: <FaPhoneAlt />,
                  title: "Call",
                  text: "+1 (212) 555-7890",
                },
                {
                  icon: <FaClock />,
                  title: "Open Hours",
                  text: "Monday-Friday: 9AM - 6PM",
                },
              ].map((item, index) => (
                <div key={index} className="contact-card">
                  <div className="icon-box">{item.icon}</div>
                  <div className="contact-text">
                    <h4>{item.title}</h4>
                    <p>{item.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div
              className="contact-form-container"
              data-aos="fade-up"
              data-aos-delay="400"
            >
              <h3>Get in Touch</h3>
              <p>Have questions? Reach out to our team for assistance.</p>

              <form onSubmit={handleSubmit} className="php-email-form">
                <div className="row">
                  <div className="col-md-6 form-group">
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      placeholder="Your Name"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-md-6 form-group mt-3 mt-md-0">
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      placeholder="Your Email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="form-group mt-3">
                  <input
                    type="text"
                    className="form-control"
                    name="subject"
                    placeholder="Subject"
                    required
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                  />
                </div>
                <div className="form-group mt-3">
                  <textarea
                    className="form-control"
                    name="message"
                    rows={5}
                    placeholder="Message"
                    required
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                  />
                </div>

                <div className="my-3">
                  {formStatus === "loading" && (
                    <div className="loading">Loading</div>
                  )}
                  {formStatus === "error" && (
                    <div className="error-message">Error sending message</div>
                  )}
                  {formStatus === "success" && (
                    <div className="sent-message">
                      Your message has been sent. Thank you!
                    </div>
                  )}
                </div>

                <div className="form-submit">
                  <button type="submit" disabled={formStatus === "loading"}>
                    {formStatus === "loading" ? "Sending..." : "Send Message"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
