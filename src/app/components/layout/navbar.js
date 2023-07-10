import { Link } from "react-router-dom";
import API from "./../../config/chfBackendApi";
import NavbarTop from "../../components/layout/navbarTop";
import SupportNav from "../home/supportNav";
import { logoutUser } from "../../redux/auth.action";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { formatAsMoney } from "../../utils/money.utils";
import Notifications from "../notification/notifications";

const NavBar = ({ user, toggleSidebarDisplay, logoutUser }) => {
  const logout = () => {
    API.post("/api/logout")
      .then((response) => {
        logoutUser();
      })
      .catch((err) => {
        console.log(err.response);
      });
  };

  return (
    <div className="full-navbar">
      <SupportNav />
      <NavbarTop />
      <nav
        className="navbar navbar-expand-sm navbar-dark"
        id="dashboard-header"
      >
        <div className="container">
          <span
            className="btn btn-lg"
            id="sidebarCollapse"
            onClick={toggleSidebarDisplay}
          >
            <i className="fa fa-bars text-white"></i>
          </span>

          <button
            className="navbar-toggler"
            type="button"
            data-toggle="collapse"
            data-target="#navbar1"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbar1">
            <ul className="navbar-nav ml-auto">
              <li className="nav-item"></li>
              {/* Wallet should show for patient only */}
              {user &&
                user.user.patient &&
                user.user.patient.application_review &&
                user.wallet ? (
                <li className="nav-item dropdown">
                  <Link
                    className="nav-link dropdown-toggle"
                    to="#"
                    role="button"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    <span>
                      <i className="fas fa-money-bill"></i>
                    </span>
                  </Link>
                  <div className="dropdown-menu">
                    <span className="dropdown-item">
                      <small>
                        <strong>
                          My Wallet: <del>N</del>
                          {`${formatAsMoney(parseFloat(user.wallet.balance))}`}
                        </strong>
                      </small>
                    </span>
                  </div>
                </li>
              ) : user && user.wallet ? (
                <li className="nav-item dropdown">
                  <Link
                    className="nav-link dropdown-toggle"
                    to="#"
                    role="button"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    <span>
                      <i className="fas fa-money-bill"></i>
                    </span>
                  </Link>
                  <div className="dropdown-menu">
                    <span className="dropdown-item">
                      <small>
                        <strong>
                          Wallet: <del>N</del>
                          {`${formatAsMoney(parseFloat(user.wallet.balance))}`}
                        </strong>
                      </small>
                    </span>
                  </div>
                </li>
              ) : (
                ""
              )}


              <Notifications />

              <li className="nav-item dropdown">
                <Link
                  className="nav-link dropdown-toggle"
                  to="#"
                  role="button"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <span>
                    <i className="fa fa-user"></i>
                  </span>
                </Link>
                <div className="dropdown-menu">
                  <span className="dropdown-item">
                    {user &&
                      user.user.patient &&
                      user.user.patient.application_review && (
                        <small>
                          <strong>
                            CHF Id:
                            {`${user.user.patient.chf_id}`}
                          </strong>
                        </small>
                      )}
                  </span>
                  <Link className="dropdown-item" to="/users/profile">
                    Profile
                  </Link>
                  <div className="dropdown-divider"></div>
                  <span className="dropdown-item" onClick={logout}>
                    Logout
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    user: state.auth.user,
  };
};

const matchDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      logoutUser,
    },
    dispatch
  );
};

export default connect(mapStateToProps, matchDispatchToProps)(NavBar);
