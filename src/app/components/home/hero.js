function Hero() {
  return (
    <div className="container push-up">
      <div className="row">
        <div className="col pt-2 px-2 pb-4 m-5 text-center icon-background">
          <img src={"./images/edit.png"} className="p-5 img-fluid" alt="" />
          <span className="text-center bolder">
            <b>Register</b>
          </span>
          <div>Begin your application process from the apply now menu.</div>
        </div>

        <div className="col pt-2 px-2 pb-4 m-5 text-center icon-background">
          <img src={"./images/share.png"} className="p-5 img-fluid" alt="" />
          <span className="text-center bolder">
            <b>Get Approval</b>
          </span>
          <div>Login, complete your application and wait for approval</div>
        </div>

        <div className="col pt-2 px-2 pb-4 m-5 text-center icon-background">
          <img src={"./images/verify.png"} className="p-5 img-fluid" alt="" />
          <span className="text-center bolder">
            <b>Get Funded</b>
          </span>
          <div>Access up to N2m in drugs, radiotherapy and</div>
        </div>
      </div>
      <div className="row text-center pt-4 px-4">
        The Nigerian cancer health fund(CHF) is a social service aimed at
        providing funding and health care services to cancer patients. Upon
        successful application, cancer patients will access up to N2m in drugs,
        radiotherapy and chemotherapy. The federal government through the FMOH
        has partnered with many stakeholders to make this fund avaliable. At the
        same time, interested donors and partners are called to join and sustain
        the cancer health fund.
      </div>
    </div>
  );
}

export default Hero;
