import { connect, useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PageTitle from "../../../components/pageTitle/pageTitle";
import HTable from "../../../components/table/HTable";
import { timestampToRegularTime } from "../../../utils/date.util";
import Button from "../../../components/button";
import Label from "../../../components/form2/label/label";
import Input from "../../../components/form2/input/input";
import Card from "../../../components/card/card";
import PageSpinner from "../../../components/spinner/pageSpinner";
import { formatErrors } from "../../../utils/error.utils";
import { propagatePopup } from "../../../redux/popup/popup.action";
import API, { CAPBackendAPI } from "../../../config/chfBackendApi";
import ModalMessage from "../../../components/message/ModalMessage";
import Text from "../../../components/form2/text/text";
import Modal from '../../../components/modal/modal';
import ModalHeader from '../../../components/modal/modalHeader';
import ModalBody from '../../../components/modal/modalBody';
import ModalFooter from '../../../components/modal/modalFooter';
import Icon from '../../../components/icon/icon';
import {ACTIVE, APPROVED, DECLINED} from '../../../utils/constant.util'
import {formatName} from '../../../utils/dataFormat.util';
import {propagateAlert} from '../../../redux/alertActions'

const initial_state = {
  isLoading: true,
  patientApplications: [],
  searchValue: "",
  isSubmitting: false,
  showViewModal: false,
  currentAssessment: {},
  showReviewPatientModal: false,
  isReviewingPatient: false,
};

const tableHeaders = [
  { value: "CHF ID" },
  { value: "NAME" },
  { value: "NHIS NO" },
  { value: "APPLICATION DATE" },
  { value: "STATUS" },
];

function SocailWorkerApplications(props) {
  const dispatch = useDispatch();
  const { user, propagatePopup } = props;
  const [state, setState] = useState(initial_state);

  const setStateValue = (name, value) => {
    setState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const showError = content => {
    return propagatePopup({
      content,
      title: "Warning",
      type: "danger",
      timeout: 5000,
    });
  }

  const handleSearch = async (e) => {
    try {
      e.preventDefault();
      setStateValue("isSubmitting", true);

      // Submit form
      if (!state.searchValue) {
        return propagatePopup({
          content: "Provide a search value",
          title: "Empty value",
          type: "danger",
          timeout: 5000,
        });
      }

      const res = await API.get(
        `/api/application/reviews/${user.user.coe_id}/${state.searchValue}`
      );

      console.log(res)

      if (!res.data.data.length) {
        return showError("Patient does not have an application")
      }

      if(!res.data.data[0].primaryPhysician){
        return showError("Patient has not completed their profile. No primary physician attached.")
      }

      setStateValue("patientApplications", res.data.data);
    } catch (e) {
      showError(formatErrors(e))
    } finally {
      setStateValue("isSubmitting", false);
    }
  };

  const showActiveAssessment = (assessment) => {
    setStateValue("showViewModal", true);
    setStateValue("currentAssessment", assessment);
  };

  const handleReviewPatient = async status => {
    try{
      setStateValue('isReviewingPatient', true)
      const res = await API.post('/api/patient/application/social-worker-assessment/review',{
        status,
        patient_id: state.patientApplications[0].patient.id,
      });
      dispatch(propagateAlert({
        variant: 'success',
        alert: "Patient reviewed successfully"
      }));
      
      return setState(prevState => ({
        ...prevState,
        showReviewPatientModal: false,
        patientApplications: prevState.patientApplications.map((data, index) => {
          return {
            ...data,
            patient: {
              ...data.patient,
              social_worker_reviewed_on: res.data.data.social_worker_reviewed_on,
              social_worker_reviewer_id: res.data.data.social_worker_reviewer_id,
              social_worker_status: res.data.data.social_worker_status
            }
          }
        })
      }))
    }catch(error){
      console.log(error)
    }finally{
      setStateValue('isReviewingPatient', false)      
    }
  }

  const renderAssessmentButton = data => {
    /* PREVENT SOCIAL WORKER FROM GIVING REVIEW WHEN PRIMARY PHYSICIAN HAS NOT */
    if (!data.patient.primary_physician_reviewed_on) {
      return <p className='text-danger'>Primary physician must verify patient. Please direct them to {formatName(data.primaryPhysician)}</p>  
    }
    
    if(!data.socialWorkerAssessment || (data.socialWorkerAssessment.hasOwnProperty("status") && data.socialWorkerAssessment.status.toUpperCase() === ACTIVE)){
      return <Link to={`/social-worker/add/applications?patient_app=${data.applicationReview.id}`}>
          <Button
            btnClass={"btn btn-success"}
            type={"button"}
            value="+ Social Assessment"
          />
        </Link>
    }

    return <Button
          btnClass={"btn btn-success"}
          type={"button"}
          value="View"
          onClick={() => {
            showActiveAssessment(data.socialWorkerAssessment);
          }}
        />
  }
  
  return (
    <div className="container">
      <div className="row">
        <div className="col-sm-12">
          {(state.isSubmitting || state.pageLoading) && <PageSpinner />}
          <PageTitle title="Patient Applications" />

          <ModalMessage
            title={`Social Assessment`}
            show={state.showViewModal}
            onHide={() => setStateValue("showViewModal", false)}
            dismissible={true}
          >
            <div>
              <Label label="Appearance: " />
              <Text value={state.currentAssessment.appearance} />
            </div>
            <div>
              <Label label="BMI (wt/ht2)" />
              <Text value={state.currentAssessment.bmi} />
            </div>
            <div>
              <Label label="Home visit report. Comments on the followings:  " />
            </div>
            <div>
              <Label label="Home facilities: " />
              <Text value={state.currentAssessment.comment_on_home} />
            </div>
            <div>
              <Label label="Environment/facilities: " />
              <Text value={state.currentAssessment.comment_on_environment} />
            </div>
            <div>
              <Label label="Family relationship: " />
              <Text value={state.currentAssessment.comment_on_fammily} />
            </div>
            <div>
              <Label label="Other comments: " />
              <Text value={state.currentAssessment.general_comment} />
            </div>
            <div className="d-flex my-4">
              <Button
                btnClass={"btn btn-success"}
                type={"button"}
                value="CLose"
                onClick={() => setStateValue("showViewModal", false)}
              />
            </div>
          </ModalMessage>
          {/* SHOW JUMBOTROM TO SEARCH PATIENT */}
          <Card>
            <form onSubmit={handleSearch}>
              <div className="d-flex w-100 flex-column align-items-center justify-content-center">
                <Label label="Provide a patient's CHF ID/ NHIS NO/ EMAIL" />
                <Input
                  name="searchValue"
                  type={"text"}
                  value={state.searchValue}
                  placeholder={"search patient"}
                  onChange={(e) => setStateValue(e.target.name, e.target.value)}
                />
                <div className="mt-3 d-flex w-100 align-items-center justify-content-center">
                  <Button
                    btnClass={"btn btn-success"}
                    type={"submit"}
                    value="Search"
                  />
                </div>
              </div>
            </form>
          </Card>

          {/* RENDER TABLE OF APPLICATION */}
          {state.patientApplications.length ? (
            <HTable>
              <thead>
                <tr>
                  <th>SN</th>
                  {tableHeaders &&
                    tableHeaders.map((header, index) => (
                      <th key={`h-${index}`}>{header.value}</th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {state.patientApplications &&
                  state.patientApplications.map((data, index) => (
                    <tr key={index}>
                      <td>{++index}</td>
                      <td>{data.patient.chf_id}</td>
                      <td>{formatName(data.user)}</td>
                      <td>{data.patient.nhis_no}</td>
                      <td>
                        {timestampToRegularTime(
                          data.applicationReview.created_at
                        )}
                      </td>
                      <td>
                        {
                          !data.patient.social_worker_reviewed_on && data.patient.primary_physician_reviewer_id  && <Button 
                            onClick={() => setStateValue('showReviewPatientModal',true)}
                            btnClass={'btn btn-success mr-2'} type='button' value="Review" />
                        }
                        {
                          renderAssessmentButton(data)
                        }
                        
                      </td>
                    </tr>
                  ))}
              </tbody>
            </HTable>
          ) : (
            ""
          )}
        </div>
      </div>

      {
        state.showReviewPatientModal && <Modal>
          <ModalHeader modalTitle="Review Patient" onModalClose={() => setStateValue('showReviewPatientModal',false)} />
          <ModalBody>
            <p>Do you consider this patient to be indigent and needs the Cancer Health Fund to start or continue their cancer treatment?</p>
          </ModalBody>
          <ModalFooter>
            {!state.isReviewingPatient && <><Button
              onClick={() => handleReviewPatient(APPROVED)} 
              btnClass='btn btn-success mr-2' >YES <Icon icon='fa fa-check-circle' /></Button>
            <Button
              onClick={() => handleReviewPatient(DECLINED)} 
              btnClass='btn btn-danger' >NO <Icon icon='fa fa-window-close' /></Button></> || <Button disabled={true} value="Please wait..." btnClass='btn btn-secondary' />}
          </ModalFooter>
        </Modal>
      }
    </div>
  );
}

const matchDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      propagatePopup,
    },
    dispatch
  );
};
const mapStateToProps = (state) => {
  return {
    user: state.auth.user,
  };
};

export default connect(
  mapStateToProps,
  matchDispatchToProps
)(SocailWorkerApplications);
