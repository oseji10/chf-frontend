/* eslint-disable no-unused-vars */
import { Jumbotron } from "reactstrap";
import styles from "./infographics/infographics.module.scss";
import Progressbar from "./infographics/progressbar";
import SmallCard from "./infographics/.smallcard";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../../config/chfBackendApi";
import PageTitle from "../../components/pageTitle/pageTitle";
import SmallTable from "./infographics/smallTable";
import BarChart from "./infographics/BarChart";

const initial_state = {
  ailments: [],
  geopolitical_zones: [],
  coes: [],
  states: [],
  state_of_residence: [],
  patients_count: 0,
  activeCoe: null,
  patients_approved: 0,
  patients_pending: 0,
  patients_declined: 0,
  alert: {
    message: "Some Toast",
    variant: "",
  },
  zoneStateOrigin: "",
  zoneStateResidence: "",
};

var colors = ["#43A19E", "#7B43A1", "#F2317A", "#FF9824", "#58CF6C"];

const PatientReport = () => {
  const [state, setState] = useState(initial_state);

  let pageLoaded = false;

  const loadInfoGraphics = async () => {
    try {
      const res = await API.get("/api/analytics/patients");
      // console.log("Analytics response", res.data.data);
      const {
        geopolitical_zones,
        ailments,
        patients_count,
        patients_approved,
        patients_pending,
        patients_declined,
        coes,
        states,
        state_of_residence,
      } = res.data.data;

      setState((prevState) => ({
        ...prevState,
        ailments,
        geopolitical_zones,
        patients_count,
        states,
        state_of_residence,
        coes,
        patients_approved,
        patients_pending,
        patients_declined,
        zoneStateOrigin: geopolitical_zones.length
          ? geopolitical_zones[0].id
          : "",
        zoneStateResidence: geopolitical_zones.length
          ? geopolitical_zones[0].id
          : "",
      }));
    } catch (e) {
      // console.log(e.response)
    }
  };

  const renderGeopoliticalZoneBars = (type = "patients_count") => {
    const category =
      type === "patients_count" ? "geozone" : "geozone-residence";
    const progressbar_colors = [
      "success",
      "danger",
      "warning",
      "info",
      "pink",
      "purple",
    ];

    return state.geopolitical_zones.map((geozone, index) => (
      <Link
        to={`/report/${category}/${geozone.id}/${geozone.geopolitical_zone}/patients`}
      >
        <Progressbar
          key={`origin-${index}`}
          progressType={progressbar_colors[index]}
          width={
            state.patients_count
              ? ((geozone[type] / state.patients_count) * 100).toFixed(2)
              : 0
          }
          title={geozone.geopolitical_zone}
          tipText={geozone[type] + ` patients`}
        />
      </Link>
    ));
  };

  const renderAilmentTypesBoxes = () => {
    return state.ailments.map((ailment, index) => (
      <Link
        to={`/report/ailment/${ailment.id}/${ailment.ailment_type}-${ailment.ailment_stage}/patients`}
        key={`ailment-${index}`}
      >
        {" "}
        <SmallCard>
          <h5>{ailment.ailment_type}</h5>
          <small className="d-block">(Stage {ailment.ailment_stage})</small>
          <small>{ailment.patients_count}</small>
        </SmallCard>
      </Link>
    ));
  };

  const renderCOEs = () => {
    return state.coes.map((coe, index) => (
      <div
        className={`${styles.table_row} ${styles.line_bottom}`}
        key={`${coe.coe_name}`}
      >
        <Link
          to={`/report/coe/${coe.id}/${coe.coe_name}/patients`}
          className={
            !(++index % 3)
              ? `${styles.column} ${styles.success} ${styles.circle}`
              : !(++index % 2)
              ? `${styles.column} ${styles.warning} ${styles.circle}`
              : `${styles.column} ${styles.pink} ${styles.circle}`
          }
        >
          {coe.patients_count}
        </Link>
        <div className={`${styles.column} ${styles.grow}`}> {coe.coe_name}</div>
      </div>
    ));
  };

  // Prepares the data to be displayed in a pie chart
  const stateByGeozonedata = (geozoneid, stateType) => {
    let states = [];
    if(stateType){
      states = state.states.filter(
        (item) => item.geopolitical_zone_id.toString() === geozoneid.toString()
      );
    }else{
      states = state.states.filter(
        (item) => item.geopolitical_zone_id.toString() === geozoneid.toString()
      );
    }
    
    let geozoneStates = [];
    let patientCount = [];
    for (let geozoneState of states) {
      if (geozoneState.patients_count) {
        geozoneStates.push(geozoneState.state);
        patientCount.push(geozoneState.patients_count);
      }
    }

    return {
      labels: geozoneStates,
      data: patientCount,
    };
  };

  const handleStateSelectClickChange = (e) => {
    setStateValue(e.target.name, e.target.value);
  };

  const setStateValue = (field, value) => {
    setState((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const renderStatesBarChart = (geozoneid, stateType) => {
    const data = stateByGeozonedata(geozoneid, stateType);
    return (
      <BarChart
        labels={data.labels}
        data={data.data}
        title="Number of patients by state"
      />
    );
  };

  useEffect(() => {
    loadInfoGraphics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    pageLoaded = true;
  }, [pageLoaded]);

  return (
    <>
      <div className="container">
        <PageTitle title="Patient Reports" icon="fa fa-paper-plane" />
        <Jumbotron
          className={["row shadow-lg bg-light", styles.bb_primary].join(" ")}
        >
          <div className="col-md-6">
            <small className="text-success text-uppercase d-block">
              Total number of approved patients
            </small>
            <small>
              {" "}
              <Link
                to={`/report/approved/approved/patients/patients`}
                className="btn btn-sm btn-info"
              >
                {state.patients_approved}
              </Link>
            </small>
            <small className="text-success text-uppercase d-block">
              Total number of pending patients
            </small>
            <small>
              {" "}
              <Link
                to={`/report/new/pending/patients/patients`}
                className="btn btn-sm btn-info"
              >
                {state.patients_pending}
              </Link>
            </small>
            <small className="text-success text-uppercase d-block">
              Total number declined patients
            </small>
            <small>
              <Link
                to={`/report/declined/declined/patients/patients`}
                className="btn btn-sm btn-info"
              >
                {state.patients_declined}
              </Link>
            </small>
          </div>
          <div className="col-md-6">
            <h6 className="text-success">Total Number Enrolled Patients</h6>
            <h4>{state.patients_count}</h4>
          </div>
        </Jumbotron>

        <div className="row">
          <div className="col-md-6">
            <h5 className="text-secondary">Region of Origin</h5>
            {renderGeopoliticalZoneBars()}
          </div>
          <div className={["col-md-6"].join(" ")}>
            {/* STATE OF ORIGIN LIST */}
            <h5 className="text-secondary">State of Origin</h5>
            <select
              className="form-control custom"
              onChange={handleStateSelectClickChange}
              name="zoneStateOrigin"
              value={state.zoneStateOrigin}
            >
              <option value="">--Geopolitical zone of origin--</option>
              {state.geopolitical_zones.map((zone, index) => (
                <option key={index} value={zone.id}>
                  {zone.geopolitical_zone}{" "}
                </option>
              ))}
            </select>
            {state.zoneStateOrigin &&
              renderStatesBarChart(state.zoneStateOrigin, "origin")}
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <h5 className="text-secondary">Region of Residence</h5>
            {renderGeopoliticalZoneBars("residence_patients_count")}
          </div>
          <div className={["col-md-6"].join(" ")}>
            {/* Render state analytics */}
            <h5 className="text-secondary ml-2">State of Residence</h5>
            <div className={styles.card_wrapper}>
              <select
                className="form-control custom"
                onChange={handleStateSelectClickChange}
                name="zoneStateResidence"
                value={state.zoneStateResidence}
              >
                <option value="">--Geopolitical zone of residence--</option>
                {state.geopolitical_zones.map((zone, index) => (
                  <option key={index} value={zone.id}>
                    {zone.geopolitical_zone}{" "}
                  </option>
                ))}
              </select>
              {state.zoneStateResidence &&
                renderStatesBarChart(state.zoneStateResidence, "residence")}
            </div>
          </div>
        </div>

        <div className="row">
          <div className={["col-md-6 p-3"].join(" ")}>
            <h5 className="text-secondary ml-2">Cancer Types</h5>
            <div className={styles.card_wrapper}>
              {renderAilmentTypesBoxes()}
            </div>
          </div>
          <div className={["col-md-6 p-3"].join(" ")}>
            {/* COE LIST */}
            <h5 className="text-secondary">Centre of Excellence</h5>
            <SmallTable className={`${styles.small_table} ${styles.card}`}>
              {renderCOEs()}
            </SmallTable>
          </div>
        </div>
      </div>
    </>
  );
};

export default PatientReport;
