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
              <p>A108 Adam Street</p>
              <p>New York, NY 535022</p>
              <p className="mt-3">
                <strong>Phone:</strong> <span>+1 5589 55488 55</span>
              </p>
              <p>
                <strong>Email:</strong> <span>info@example.com</span>
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
          <div className="col-lg-2 col-md-3 footer-links">
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
          <div className="col-lg-2 col-md-3 footer-links">
            <h4>Our Services</h4>
            <ul>
              <li>
                <Link href="#">Web Design</Link>
              </li>
              <li>
                <Link href="#">Web Development</Link>
              </li>
              <li>
                <Link href="#">Product Management</Link>
              </li>
              <li>
                <Link href="#">Marketing</Link>
              </li>
              <li>
                <Link href="#">Graphic Design</Link>
              </li>
            </ul>
          </div>

          {/* Columns 4 & 5: Additional Links */}
          {[
            {
              title: "Hic solutasetp",
              links: [
                "Molestiae accusamus iure",
                "Excepturi dignissimos",
                "Suscipit distinctio",
                "Dilecta",
                "Sit quas consectetur",
              ],
            },
            {
              title: "Nobis illum",
              links: [
                "Ipsam",
                "Laudantium dolorum",
                "Dinera",
                "Trodelas",
                "Flexo",
              ],
            },
          ].map((column, index) => (
            <div key={index} className="col-lg-2 col-md-3 footer-links">
              <h4>{column.title}</h4>
              <ul>
                {column.links.map((link, i) => (
                  <li key={i}>
                    <Link href="#">{link}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
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
