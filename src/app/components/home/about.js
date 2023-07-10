import { Link } from "react-router-dom";

function About() {
  return (
    <div className="p-5 icon-background">
      <div className="container">
        <div className="row">
          <div className="text-right col-lg-7">
            <h3 className="pb-2">
              Access up to 2M in cancer care, <br></br>from the federal
              governement and its partners
            </h3>
            <p>
              The Cancer Health Fund(CHF) program is an initiative of the
              federal ministry of health that commenced in 2021 with six pilot
              hospitals. Ahmadu Bello University teaching hospital (ABUTH),
              National Hospital Abuja (NHA),
            </p>
            <Link to="/about" className="btn btn-success">
              Read More
            </Link>
          </div>

          <div className="col-lg-5">
            <img src="./images/660.jpeg" className="img-fluid" alt="" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
