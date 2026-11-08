import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Home.css";

const mapPath = "/map";
const addStationPath = "/map?tab=add";

const BrandMark = () => (
  <Link className="home-brand" to="/" aria-label="SwapCharGo home">
    <span className="home-brand-icon" aria-hidden="true">
      <svg viewBox="0 0 32 32" focusable="false">
        <path d="M18.7 2.8 6.2 17.3h8.2l-1.1 11.9 12.5-15h-8.2l1.1-11.4Z" />
      </svg>
    </span>
    <span>SwapChar<span className="home-brand-accent">Go</span></span>
  </Link>
);

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M5 12h13M13 6l6 6-6 6" />
  </svg>
);

const Home = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [browseOpen, setBrowseOpen] = useState(false);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setBrowseOpen(false);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const closeMenus = () => {
    setMenuOpen(false);
    setBrowseOpen(false);
  };

  const goToAddStation = () => {
    closeMenus();
    navigate(addStationPath);
  };

  return (
    <main className="home-page">
      <header className="home-header">
        <div className="home-nav-shell">
          <BrandMark />
          <button
            className="home-menu-toggle"
            type="button"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="home-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
          <nav
            className={`home-navigation${menuOpen ? " is-open" : ""}`}
            id="home-navigation"
            aria-label="Main navigation"
          >
            <a className="home-nav-link is-current" href="#home" onClick={closeMenus}>Home</a>
            <a className="home-nav-link" href="#about" onClick={closeMenus}>About</a>
            <div className="home-browse-wrap">
              <button
                className="home-nav-link home-browse-trigger"
                type="button"
                aria-expanded={browseOpen}
                aria-controls="home-browse-menu"
                onClick={() => setBrowseOpen((open) => !open)}
              >
                Browse <span className="home-chevron" aria-hidden="true" />
              </button>
              {browseOpen && (
                <div className="home-browse-menu" id="home-browse-menu">
                  <Link to={mapPath} onClick={closeMenus}>Station map</Link>
                  <Link to={mapPath} onClick={closeMenus}>Charging stations <small>Shared map</small></Link>
                  <Link to={mapPath} onClick={closeMenus}>Swapping stations <small>Shared map</small></Link>
                </div>
              )}
            </div>
            <a className="home-nav-link" href="#contact" onClick={closeMenus}>Contact</a>
            <Link className="home-nav-cta" to={mapPath} onClick={closeMenus}>Explore map</Link>
          </nav>
        </div>
      </header>

      <section className="home-hero" id="home" aria-labelledby="home-hero-title">
        <img
          className="home-hero-image"
          src="/images/background_pic.jpeg"
          alt="Electric vehicle at a public charging station at dusk"
          fetchPriority="high"
        />
        <div className="home-hero-shade" />
        <div className="home-container home-hero-content">
          <p className="home-eyebrow"><span /> EV charging and battery swapping, connected</p>
          <h1 id="home-hero-title">Energize Your Drive,<br /><span>Anytime, Anywhere.</span></h1>
          <p className="home-hero-copy">Discover EV charging and battery swapping stations around you.</p>
          <div className="home-hero-actions">
            <Link className="home-button home-button-primary" to={mapPath}>
              Find Stations <ArrowIcon />
            </Link>
            <button className="home-button home-button-quiet" type="button" onClick={goToAddStation}>
              Add a Station <span aria-hidden="true">＋</span>
            </button>
          </div>
          <a className="home-scroll-cue" href="#services"><span aria-hidden="true" /> Explore the network</a>
        </div>
        <div className="home-hero-label" aria-hidden="true"><span>01</span> MOVE WITH MORE CHOICE</div>
      </section>

      <section className="home-section home-services" id="services" aria-labelledby="services-title">
        <div className="home-container">
          <div className="home-section-heading">
            <p className="home-eyebrow home-eyebrow-dark">CHOOSE YOUR WAY TO POWER</p>
            <h2 id="services-title">Two ways to power<br className="home-desktop-break" /> your journey.</h2>
            <p>Find the kind of EV support that fits the way you travel.</p>
          </div>
          <div className="home-service-grid">
            <article className="home-service-card">
              <div className="home-service-image-wrap">
                <img src="/images/charge.jpeg" alt="Public electric vehicle charging points" loading="lazy" />
                <span className="home-service-tag">BCS <span>·</span> CHARGING</span>
              </div>
              <div className="home-service-content">
                <div className="home-service-icon" aria-hidden="true">↗</div>
                <h3>Battery Charging Stations</h3>
                <p>Explore charging locations where electric vehicles can connect to charging infrastructure.</p>
                <Link to={mapPath} className="home-text-link">Explore charging stations <ArrowIcon /></Link>
              </div>
            </article>
            <article className="home-service-card">
              <div className="home-service-image-wrap">
                <img src="/images/ev-battery.jpg" alt="Battery swapping cabinet beside an electric scooter" loading="lazy" />
                <span className="home-service-tag">BSS <span>·</span> BATTERY SWAPPING</span>
              </div>
              <div className="home-service-content">
                <div className="home-service-icon home-service-icon-amber" aria-hidden="true">⟳</div>
                <h3>Battery Swapping Stations</h3>
                <p>Find places offering battery exchange for compatible EVs, where swapping services are available.</p>
                <Link to={mapPath} className="home-text-link">Explore swapping stations <ArrowIcon /></Link>
              </div>
            </article>
          </div>
          <p className="home-map-note">Both options currently open the shared station map; separate BCS and BSS map filters are not available yet.</p>
        </div>
      </section>

      <section className="home-section home-how" aria-labelledby="how-title">
        <div className="home-container home-how-layout">
          <div className="home-how-intro">
            <p className="home-eyebrow">A SIMPLE WAY FORWARD</p>
            <h2 id="how-title">From discovery<br />to your next stop.</h2>
            <p>SwapCharGo brings station discovery and reservations into one straightforward journey.</p>
            <Link className="home-text-link home-text-link-light" to={mapPath}>Open the station map <ArrowIcon /></Link>
          </div>
          <ol className="home-steps">
            <li><span className="home-step-number">01</span><div><h3>Discover</h3><p>Use the interactive map to explore station locations.</p></div></li>
            <li><span className="home-step-number">02</span><div><h3>Explore</h3><p>Review the station information and available booking capacity.</p></div></li>
            <li><span className="home-step-number">03</span><div><h3>Reserve</h3><p>Book an available slot. Reservations last 30 minutes and can be cancelled.</p></div></li>
            <li><span className="home-step-number">04</span><div><h3>Visit</h3><p>Head to the selected station for its charging or swapping service.</p></div></li>
          </ol>
        </div>
      </section>

      <section className="home-sustainability" id="about" aria-labelledby="about-title">
        <div className="home-sustainability-image">
          <img src="/images/background_pic.jpeg" alt="Electric car connected to charging infrastructure" loading="lazy" />
          <span className="home-image-caption">A connected network for electric mobility</span>
        </div>
        <div className="home-sustainability-copy">
          <p className="home-eyebrow home-eyebrow-dark">ABOUT SWAPCHARGO</p>
          <h2 id="about-title">Driving a more<br />sustainable future.</h2>
          <p>SwapCharGo is a community-minded platform for discovering both battery charging and battery swapping facilities. By making station information easier to find, we aim to support the everyday shift toward electric mobility.</p>
          <p>Charging infrastructure and battery exchange each offer another way to keep compatible electric vehicles moving.</p>
          <Link className="home-button home-button-outline" to={mapPath}>Discover stations <ArrowIcon /></Link>
        </div>
      </section>

      <section className="home-community" aria-labelledby="community-title">
        <div className="home-container home-community-inner">
          <div className="home-community-mark" aria-hidden="true"><span>SCG</span><i /></div>
          <div className="home-community-copy">
            <p className="home-eyebrow">COMMUNITY POWERED</p>
            <h2 id="community-title">Build the network<br />together.</h2>
            <p>Know a charging or swapping location? Share it with the SwapCharGo community through the station submission workflow.</p>
          </div>
          <button className="home-button home-button-primary" type="button" onClick={goToAddStation}>Add a Station <ArrowIcon /></button>
        </div>
      </section>

      <section className="home-final-cta" aria-labelledby="final-title">
        <div className="home-container home-final-inner">
          <p className="home-eyebrow">MAKE THE NEXT STOP COUNT</p>
          <h2 id="final-title">Your next journey<br /><span>starts here.</span></h2>
          <div className="home-hero-actions">
            <Link className="home-button home-button-primary" to={mapPath}>Find Stations <ArrowIcon /></Link>
            <button className="home-button home-button-quiet" type="button" onClick={goToAddStation}>Add a Station <span aria-hidden="true">＋</span></button>
          </div>
        </div>
      </section>

      <footer className="home-footer" id="contact">
        <div className="home-container">
          <div className="home-footer-main">
            <div className="home-footer-brand">
              <BrandMark />
              <p>Energize Your Drive, Anytime, Anywhere.</p>
            </div>
            <div className="home-footer-links">
              <div><h2>EXPLORE</h2><a href="#home">Home</a><a href="#about">About</a></div>
              <div><h2>STATIONS</h2><Link to={mapPath}>Map</Link><Link to={mapPath}>Charging stations</Link><Link to={mapPath}>Swapping stations</Link></div>
              <div><h2>CONTRIBUTE</h2><button type="button" onClick={goToAddStation}>Add a station</button><a href="#contact">Contact</a></div>
            </div>
          </div>
          <div className="home-footer-bottom"><span>© {new Date().getFullYear()} SwapCharGo</span><span>Charging · Swapping · Community</span></div>
        </div>
      </footer>
    </main>
  );
};

export default Home;
