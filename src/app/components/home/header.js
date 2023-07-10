import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import SupportNav from "./supportNav";
import HomeNav from "./homeNav";

const Header = ({ user }) => {
  return (
    <header>
      <SupportNav />
      <HomeNav />
      <div className="call-to-action">
        <h1 className="header-title text-center">
          CANNOT AFFORD CANCER <br></br>MEDICAL BILLS?
        </h1>
        <p className="mt-2 mb-3 text-sm">
          The Federal Government through the FMOH and its partners are here to
          help. Apply in 3 easy steps:{" "}
        </p>
        {!user && (
          <Link className="btn btn-success btn-lg text-center" to="/enrol">
            Start Here
          </Link>
        )}
      </div>
    </header>
  );
};
const mapStateToProps = (state) => {
  return {
    user: state.auth.user,
  };
};

export default connect(mapStateToProps)(Header);
