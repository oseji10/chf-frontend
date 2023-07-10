import { Link } from "react-router-dom";
import { connect } from "react-redux";
function HomeNav({user}){
    return (
        <nav className="navbar navbar-expand-sm navbar-dark">
        <div className="container under-line">
          <Link className="navbar-brand" to="/">
            <img src="./images/logo.png" className="logo" alt="" />
            <p>Federal Ministry of Health</p>
          </Link>
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
              <li className="nav-item active">
                <Link className="nav-link" to="/">
                  Home
                </Link>
              </li>

              <li className="nav-item active">
                <Link className="nav-link" to="/about">
                  About
                </Link>
              </li>

              {!user ? (
                <>
                  {" "}
                  <li className="nav-item active">
                    <Link className="nav-link" to="/enrol">
                      Apply now
                    </Link>
                  </li>
                  <li className="nav-item active">
                    <Link className="nav-link" to="/login">
                      Login
                    </Link>
                  </li>{" "}
                </>
              ) : (
                <li className="nav-item active">
                  <Link className="nav-link" to="/dashboard">
                    Dashboard
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>
    )
}

const mapStateToProps = (state) => {
    return {
      user: state.auth.user,
    };
  };
  
  export default connect(mapStateToProps)(HomeNav);