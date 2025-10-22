// src/components/Footer.jsx
import Link from "next/link";
import Image from "next/image";
import { FaTwitter, FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  return (
    <footer id="footer" className="footer position-relative light-background">
      <div className="container footer-top">
        <div className="row gy-4">
          {/* Column 1: Logo & Contact */}
          <div className="col-lg-4 col-md-6 footer-about">
            <Link href="/" className="logo d-flex align-items-center">
              <Image
                src="/assets/img/logo.png"
                alt="Rentall Logo"
                width={150}
                height={50}
              />
            </Link>
            <div className="footer-contact pt-3">
              <p>Wu Yi Plaza, Galana Road</p>
              <p>Nairobi, Kenya</p>
              <p className="mt-3">
                <strong>Call:</strong>{" "}
                <a href="tel:+254723052500">+254 723 052 500</a>
              </p>
              <p>
                <strong>Email:</strong>{" "}
                <a href="mailto:info@therentallcompany.co.ke">
                  info@therentallcompany.co.ke
                </a>
              </p>
              <p>
                <strong>Open Hours:</strong>{" "}
                <span>Monday-Friday: 9AM - 6PM</span>
              </p>
            </div>
            <div className="social-links d-flex mt-4">
              <Link href="#">
                <FaTwitter />
              </Link>
              <Link href="#">
                <FaFacebook />
              </Link>
              <Link href="#">
                <FaInstagram />
              </Link>
              <Link href="#">
                <FaLinkedin />
              </Link>
            </div>
          </div>

          {/* Column 2: Useful Links */}
          <div className="col-lg-4 col-md-4 footer-links">
            <h4>Useful Links</h4>
            <ul>
              <li>
                <Link href="#">Home</Link>
              </li>
              <li>
                <Link href="#">About us</Link>
              </li>
              <li>
                <Link href="#">Services</Link>
              </li>
              <li>
                <Link href="#">Terms of service</Link>
              </li>
              <li>
                <Link href="#">Privacy policy</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Our Services */}
          <div className="col-lg-4 col-md-4 footer-links">
            <h4>Our Services</h4>
            <ul>
              <li>
                <Link href="#">Digital Property Management</Link>
              </li>
              <li>
                <Link href="#">Tenant & Lease Management</Link>
              </li>
              <li>
                <Link href="#">Analytics & Reporting</Link>
              </li>
              <li>
                <Link href="#">Maintenance Coordination</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="container copyright text-center mt-4">
        <p>
          © <span>Copyright</span>{" "}
          <strong className="px-1 sitename">Rentall</strong>{" "}
          <span>All Rights Reserved</span>
        </p>
      </div>
    </footer>
  );
}
