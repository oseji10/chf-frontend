import { connect } from "react-redux";
import { Link } from "react-router-dom";
import SupportNav from "../components/home/supportNav";
import HomeNav from "../components/home/homeNav";

const About = (props) => {
  return (
    <header>
      <SupportNav />
      <HomeNav />
      <div className="container about-header">
        <h1 className="header-title">About CHF</h1>
        <p className="mt-2 mb-3 text-sm">
          The Nigerian cancer health fund(CHF) is a social service aimed at
          providing funding and health care services to indigent cancer
          patients.</p>
          <p>The CHF program is an initiative of the federal ministry of
          health that commenced in 2021 with six pilot hospitals. Ahmadu Bello
          University teaching hospital (ABUTH), National Hospital Abuja
          (NHA), University of Benin Teaching Hospital, Benin (UBTH), Federal
          Teaching Hospital Gombe (FTH), University of Nigeria Teaching Hospital
          (UNTH), University College Hospital (UCH). </p>
          <p>It involves partners such
          as American Cancer society, ROCHE, PFIZER, MYLAN, Clinton Health
          Access Initiative, WWCV, BICON and EMGE resources who is mandated to
          implement the CHF initiative on behalf of the federal government.
        </p>
        {!props.user && (
          <Link className="btn btn-success btn-lg text-center" to="/enrol">
            Click here to register as a patient
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

export default connect(mapStateToProps)(About);
