import Header from "./components/Header";
import Hero from "./components/Hero";
import About from "./components/About";
import Clients from "./components/Clients";
import Contact from "./components/ContactForm";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

export default function Home() {
  return (
    <>
      <Header />
      <main className="main">
        <Hero />
        <About />
        <Clients />
        <Contact />
      </main>
      <ScrollToTop />
      <Footer />
    </>
  );
}
