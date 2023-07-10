import Button from "../button";

function TermsAndConditions({ termsAndConditions, onAccept, onDecline }) {
  return (
    <div>
      <div className="jumbotron">
        <p>{termsAndConditions}</p>
      </div>
      <div className="d-flex justify-content-between">
        <div className="form-check form-check-inline">
          <Button
            btnClass={"btn btn-lg btn-success"}
            type={"button"}
            value="Accept"
            onClick={onAccept}
          />
        </div>
        <div className="form-check form-check-inline">
        <Button
            btnClass={"btn btn-lg btn-success"}
            type={"button"}
            value="Decline"
            onClick={onDecline}
          />    </div>
      </div>
    </div>
  );
}

export default TermsAndConditions;
