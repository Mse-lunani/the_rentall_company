import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header id="header" className="header d-flex align-items-center sticky-top">
      <div className="container-fluid container-xl position-relative d-flex align-items-center">
        <Link href="/" className="logo d-flex align-items-center me-auto">
          <Image
            src="/assets/img/logo.png"
            alt="Rentall Logo"
            width={150}
            height={50}
          />
        </Link>

        <nav id="navmenu" className="navmenu">
          <ul>
            <li>
              <Link href="#hero" className="active">
                Home
              </Link>
            </li>
            <li>
              <Link href="#about">About</Link>
            </li>
            <li>
              <Link href="#about2">What We Do</Link>
            </li>
            <li>
              <Link href="#clients">Clients</Link>
            </li>
            <li>
              <Link href="#contact">Contact</Link>
            </li>
          </ul>
          <i className="mobile-nav-toggle d-xl-none bi bi-list"></i>
        </nav>

        <Link className="btn-getstarted" href="/login">
          Get Started
        </Link>
      </div>
    </header>
  );
}
