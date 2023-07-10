import { Link } from "react-router-dom";
import logo from "../../../assets/images/logo.png";

function NavbarTop() {
  return (
      <div className="header-inner">
        <nav className="navbar navbar-expand-sm navbar-dark">
          <div className="container">
            <Link className="navbar-brand" to="#">
              <img
                src={logo}
                className="logo"
                alt=""
              />
            <p>Federal Ministry of Health</p>
            </Link>

            <div className="">
              <ul className="navbar-nav ml-auto">
                <li className="nav-item active">
                  <Link className="nav-link" to="/dashboard">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </div>
  );
}

export default NavbarTop;
