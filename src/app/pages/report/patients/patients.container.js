import { useEffect, useState } from "react";
import API from "../../../config/chfBackendApi";
import chfstyles from "../../chfadmin/chfadmin.module.scss";
// import authorizedOnlyComponent from "../../../components/authorizedOnlyComponent";
import { useParams } from "react-router-dom";
import { Modal, ModalHeader, ModalBody, PageTitle, MobileOnlyView,  } from "../../../components";
import { ConstantUtility, DataFormatUtility, TableUtility } from "../../../utils";
import {
  timestampToRegularTime,
  _calculateAge,
} from "../../../utils/date.util";
import { Card, Col, Row, Spinner } from "react-bootstrap";
import MUIDataTable from "mui-datatables";
import PatientDetailCard from "../../../components/patientDetailCard/patientDetailCard";
import DesktopOnlyView from "../../../components/utilities/views/desktopOnlyView";

const initial_state = {
  tableLoading: true,
  patients: [],
  activePatient: null,
  showMoreModal: false,
  pagination: {
    per_page: 10,
    page: 1,
    filter: "",
    links: null,
    pages: 1,
  },
};

function PatientsContainer() {
  const [state, setState] = useState(initial_state);
  const params = useParams();
  const { filter, filter_value, filter_offset } = params;
  
  const loadPatients = async () => {
    try {
      toggleLoader(true);
      const res = await API.get(
        `/api/patients?
        page=${state.pagination.page}
        &per_page=${state.pagination.per_page}
        &filter=${filter}
        &patient_filter_value=${filter_value}`
      );
      setState((prevState) => ({
        ...prevState,
        patients: res.data.data,
        activePatient: res.data.data[0],
      }));
    } catch (e) {
      console.log(e);
    } finally {
      toggleLoader(false);
    }
  };

  const toggleLoader = (loader_state) => {
    setState((prevState) => ({
      ...prevState,
      tableLoading: loader_state,
    }));
  };

  let patientsLoaded = false;
  useEffect(() => {
    loadPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    patientsLoaded = true;
  }, [patientsLoaded, state.pagination.per_page, state.pagination.page]);

  const handlePatientSelect = (index) => {
    // window.scrollTo(0, 0);
    setState((prevState) => ({
      ...prevState,
      activePatient: prevState.patients.find(
        (patient, currentIndex) => currentIndex === index
      ),
      showMoreModal: true,
    }));
  };


  /* RENDERS THE ACTIVE PATIENT TO THE SIDEBAR */
  const renderSinglePatient = () => {
    const { activePatient } = state;

    if (!state.activePatient) {
      return <h5>No patient selected</h5>;
    }

    return (
     <PatientDetailCard patient={activePatient} />
    );
  };

  /* USE TO CHANGE A VALUE THAT IS DIRECTLY IN THE STATE OBJECT */
  const handleDirectStateChange = (modal, value) => {
    setState((prevState) => ({
      ...prevState,
      [modal]: value,
    }));
  };

  return (
    <>
      <div className={`container ${chfstyles.application_wrapper}`}>
        <div className={chfstyles.application_header}>
          <PageTitle title={`Patients by ${filter}:- ${filter_offset}`} />
        </div>

        <div className={chfstyles.application_table + " row"}>
          <Row>
            <Col md={9} sm={12}>
              <MUIDataTable
                columns={TableUtility.SuperAdminLightPatientsTableColumns}
                options={{
                  ...TableUtility.defaultTableOptions,
                  onRowClick: (rowData, meta) => handlePatientSelect(meta.dataIndex),
                  textLabels: {
                    body:{
                      noMatch: state.tableLoading ? <Spinner variant="success" animation="border" /> : ConstantUtility.NO_DATA_MATCH
                    }
                  }
                }}
                data={state.patients.map((patient, index) =>[
                  index + 1,
                  patient.chf_id,
                  DataFormatUtility.printDataKeyOrAlternateString(patient.coe,'coe_name',ConstantUtility.NOT_COMPLETED),
                  DataFormatUtility.printDataKeyOrAlternateString(patient.ailment,'ailment_type',ConstantUtility.NOT_COMPLETED),
                  DataFormatUtility.stringOrAlternateString(patient.ailment_stage, ConstantUtility.NOT_COMPLETED),
                  DataFormatUtility.printDataKeyOrAlternateString(patient.application_review[0],'status',ConstantUtility.NOT_APPLICABLE)

                ])}
              
              />
            </Col>
            <Col sm={12} md={3}>
              <DesktopOnlyView>
                <Card  style={{padding: '1rem'}}>
                  {renderSinglePatient()}
                </Card>
              </DesktopOnlyView>
            </Col>
          </Row>
        </div>
      </div>

      <MobileOnlyView>
      {state.showMoreModal && (
        <Modal>
          <ModalHeader
            modalTitle="Patient Profile"
            onModalClose={() => handleDirectStateChange("showMoreModal", false)}
          ></ModalHeader>
          <ModalBody>
            {/* PATIENT DETAIL */}
            <div
              className={`col-sm-12 shadow-sm ` + chfstyles.selected_patient}
            >
              {(state.tableLoading && (
                <Spinner animation="border" variant="success" />
              )) ||
                renderSinglePatient()}
            </div>
          </ModalBody>
        </Modal>
      )}
      </MobileOnlyView>
    </>
  );
}

export default PatientsContainer;
