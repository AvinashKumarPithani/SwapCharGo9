import React from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  return (
    <div>
      <section id="title">
        <div>
          {/* <!-- Nav Bar --> */}
          <nav className="navbar fixed-top navbar-expand-lg navbar-dark bg-dark">
            <div className="container-fluid">
              <a href="#" className="navbar-brand">
                <i className="fa-solid fa-charging-station"></i>SwapCharGo
              </a>
              <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarNavDarkDropdown"
                aria-controls="navbarNavDarkDropdown"
                aria-expanded="false"
                aria-label="Toggle navigation"
              >
                <span className="navbar-toggler-icon"></span>
              </button>
              <div
                className="collapse navbar-collapse"
                id="navbarNavDarkDropdown"
              >
                <ul className="navbar-nav ms-auto">
                  <li className="nav-item">
                    <a className="nav-link nav-txt" href="#title">
                      HOME
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link nav-txt" href="#about">
                      ABOUT
                    </a>
                  </li>
                  <li className="nav-item dropdown">
                    <a
                      className="nav-link dropdown-toggle nav-txt"
                      href="#"
                      role="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      BROWSE
                    </a>
                    <ul className="dropdown-menu dropdown-menu-dark">
                      <li>
                        <Link className="dropdown-item nav-txt" to="/map">
                          map
                        </Link>
                      </li>
                      <li>
                        <hr className="dropdown-divider" />
                      </li>
                      <li>
                        <a className="dropdown-item nav-txt" href="#browse">
                          charging points
                        </a>
                      </li>
                      <li>
                        <a className="dropdown-item nav-txt" href="#browse">
                          swapping stations
                        </a>
                      </li>
                    </ul>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link nav-txt" href="#footer">
                      CONTACT
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
          {/* </nav>   */}
        </div>

        <div className="home-content">
          <img
            className="title-img rounded"
            src="./images/background_pic.jpeg"
            alt="charge-station"
          />
          <div className="home-text">
            <h1 className="big-heading">Find Charging Fast</h1>
            <p className="home-info">
              Discover the public fast charging network near by— enabling you to
              charge in as little as 30 minutes.
            </p>
            <button
              onClick={() => navigate("/map")}
              className="btn btn-outline-light"
            >
              LOCATE A CHARGER
            </button>
          </div>
        </div>
        {/* </div> */}
      </section>

      <section id="browse">
        <div className="browse-text">
          <h2>
            Power Your EV Hassle-Free: Locate Convenient Charging and Swapping
            Stations Near You
          </h2>
        </div>

        <div className="row">
          <div className=" browse-column col-lg-6 col-md-6">
            <div className="card">
              <img
                src="images/charge.jpeg"
                className="card-img-top"
                alt="..."
              />

              <div className="card-div">
                <h2 className="browse-text">Charging Points</h2>
                <p>
                  Looking for a convenient way to charge your electric vehicle?
                </p>
                <p>
                  Find available charging points near you with real-time updates
                  on pricing, payment options, and charger availability
                </p>
                <p>
                  Our charging point map lets you filter results based on your
                  preferences, so you can easily find the perfect spot to charge
                  up.
                </p>
                <button
                  onClick={() => navigate("/map")}
                  className="btn btn-block btn-lg btn-outline-dark"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          <div className="browse-column col-lg-6 col-md-6">
            <div className="card">
              <img
                src="./images/ev-battery.jpg"
                className="card-img-top"
                alt="..."
              />

              <div className="card-div">
                <h2 className="browse-text">Swapping stations</h2>
                <p>
                  Swap out your EV battery and get back on the road in minutes,
                  without the wait time of traditional charging methods.
                </p>
                <p>
                  Our swapping station map lets you filter results based on
                  location, battery type, and pricing, so you can easily find a
                  convenient and affordable option.
                </p>
                <button
                  onClick={() => navigate("/map")}
                  className="btn btn-block btn-lg btn-block btn-outline-dark"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about">
        <h1>
          <i className="fa-solid fa-charging-station"></i>About Us
        </h1>
        <br />
        <p>
          SwapCharGo is an EV-battery swapping web application, describes a
          platform that provides users with information about available charging
          and swapping stations for electric vehicles. The application enables
          users to track the location of these stations and check the number of
          batteries available for use at each station.
        </p>
        <br />
        <p>
          It can be particularly useful for electric vehicle drivers who need to
          recharge their batteries on the go or plan their routes in advance.
          The web application aims to streamline the process of finding and
          accessing charging and swapping stations, making it easier for users
          to transition to electric vehicles.
        </p>
        <br />
        <p>
          Charge your EV with peace of mind, knowing you're making a positive
          impact on the environment and saving money in the long run.
        </p>
      </section>

      {/* <!-- Footer --> */}

      <footer id="footer">
        <i className="fa-brands fa-github footer-icons"></i>
        <i className="fa-solid fa-envelope footer-icons"></i>
        <i className="fa-brands fa-linkedin footer-icons"></i>

        <p>© Copyright 2023 SwapCharGo</p>
      </footer>
    </div>
  );
};

export default Home;
