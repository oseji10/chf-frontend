import chfstyles from "../chfadmin/chfadmin.module.scss";
import PageTitle from "../../../components/pageTitle/pageTitle";
import Inlinesearchbox from "../../chfadmin/inlinesearchbox";
import THead from "../../../components/table/thead/thead";
import Icon from "../../../components/icon/icon";
import API from "../../../config/chfBackendApi";
import { useEffect } from "react";
import { useState } from "react";
import { formatAsMoney } from "../../../utils/money.utils";
import { Spinner } from "react-bootstrap";
import Modal from "../../../components/modal/modal";
import ModalHeader from "../../../components/modal/modalHeader";
import ModalBody from "../../../components/modal/modalBody";
import ModalFooter from "../../../components/modal/modalFooter";
import { Link } from "react-router-dom";
import AuthorizedOnlyComponent from "../../../components/authorizedOnlyComponent";
import { formatErrors } from "../../../utils/error.utils";

const Service = () => {
  const initial_state = {
    categories: [],
    services: [],
    coes: [],
    loadingServices: true,
    loadingCategories: true,
    showAddServiceModal: false,
    showAddCategoryModal: false,
    showDeleteServiceModal: false,
    serviceToDeleteID: null,
    newServiceName: "",
    newServiceCategory: null,
    newServicePrice: 0,
    newServiceParent: null,
    newServiceCode: "",
    searchServiceInputValue: "",

    editServiceCode: "",
    editServiceName: "",
    editServicePrice: 0,
    editServiceParent: null,
    editServiceCategory: 1,
    serviceToUpdateID: null,

    showAttachCOEModal: false,
    attachServiceName: "",
    serviceToAttachID: null,
    attachServiceCOEId: "",
    attachCOEServicePrice: 0,
    editServiceCoe: null,
    editServiceCoePrice: 0,
    message: "",
  };

  const [state, setState] = useState(initial_state);

  const table_columns = [
    {
      column_name: "#",
    },
    {
      column_name: "Service Name",
    },
    {
      column_name: "Service Category",
    },
    {
      column_name: "Service Parent",
    },
    {
      column_name: "Service Cost",
    },
    {
      column_name: "",
    },
  ];

  const setStateValue = (key, value) => {
    return setState((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  /* THE PASSED IN CALLBACK IS OPTIONAL, CALLBACK CAN BE USED TO SEARCH FOR ITEM OR FILTER */
  const loadServices = async (callback = () => null) => {
    setStateValue("loadingServices", true);

    try {
      const categoriesRequest = API.get("/api/service_categories");
      const servicesRequest = API.get("/api/services");
      const coesRequest = API.get("/api/coes");
      const res = await Promise.all([
        categoriesRequest,
        servicesRequest,
        coesRequest,
      ]);

      setState((prevState) => ({
        ...prevState,
        categories: res[0].data.data,
        services: res[1].data.data,
        coes: Object.values(res[2].data.data),
        newServiceCategory: res[0].data.data[0].id,
        loadingData: true,
      }));

      callback();
    } catch (e) {
      console.log(e.response);
    } finally {
      setStateValue("loadingCategories", false);
      setStateValue("loadingServices", false);
    }
  };

  const renderServices = () => {
    return Object.keys(state.services).map((service, index) => (
      <tr key={index}>
        <td>{index + 1}</td>
        <td>{state.services[service].service_name}</td>
        <td>{state.services[service].category.category_name}</td>
        <td>
          {state.services[service].parent
            ? state.services[service].parent.service_name
            : ""}
        </td>
        <td>
          <del>N</del> {formatAsMoney(state.services[service].price)}
        </td>
        <td>
          <AuthorizedOnlyComponent requiredPermission="ATTACH_COE_SERVICE">
            <button
              className="btn"
              onClick={() =>
                handleAttachCOEButtonClick(state.services[service].id)
              }
            >
              COE <Icon icon="fa fa-plus text-info" />
            </button>
          </AuthorizedOnlyComponent>
        </td>
        <td>
          <AuthorizedOnlyComponent requiredPermission="DELETE_SERVICE">
            <button
              className="btn"
              onClick={() =>
                handleDeleteButtonClick(state.services[service].id)
              }
            >
              <Icon icon="fa fa-trash text-danger" />
            </button>
          </AuthorizedOnlyComponent>
        </td>
        <td>
          <AuthorizedOnlyComponent requiredPermission="EDIT_SERVICE">
            <button
              className="btn"
              onClick={() => handleEditButtonClick(state.services[service].id)}
            >
              <Icon icon="fa fa-edit text-secondary" />
            </button>
          </AuthorizedOnlyComponent>
        </td>
      </tr>
    ));
  };

  const renderCategories = () => {
    return Object.keys(state.categories).map((category, index) => (
      <li
        className="list-group-item clickable"
        key={index}
        onClick={() => handleCategoryClick(state.categories[category].id)}
      >
        {state.categories[category].category_name}
      </li>
    ));
  };

  const handleAddService = async () => {
    try {
      const newServiceFormData = {
        parent_id: state.newServiceParent,
        service_name: state.newServiceName,
        price: state.newServicePrice,
        service_category_id: state.newServiceCategory,
        service_code: state.newServiceCode,
      };
      // console.log(newServiceFormData)

      const res = await API.post("/api/services", newServiceFormData);
      setState((prevState) => ({
        ...prevState,
        services: [
          res.data.data,
          ...Object.keys(prevState.services).map(
            (service) => prevState.services[service]
          ),
        ],
        newServiceCategory: null,
        newServiceName: "",
        newServiceCode: "",
        newServicePrice: 0,
        newServiceParent: null,
      }));
      setStateValue("showAddServiceModal", false);
    } catch (e) {
      console.log(e.response);
    }
  };

  const handleDeleteService = async () => {
    try {
      const res = await API.delete(`/api/services/${state.serviceToDeleteID}`);
      // console.log(res);
      loadServices();
      setStateValue("showDeleteServiceModal", false);
    } catch (e) {
      // console.log(e.response)
    }
  };

  const handleDeleteButtonClick = (service_id) => {
    setStateValue("serviceToDeleteID", service_id);
    setStateValue("showDeleteServiceModal", true);
  };

  const handleEditButtonClick = (service_id) => {
    const service = Object.values(state.services).filter(
      (service) => service.id === service_id
    )[0];
    setState((prevState) => ({
      ...prevState,
      showEditServiceModal: true,
      editServiceCategory: service.category.id,
      editServiceName: service.service_name,
      editServiceCode: service.service_code,
      editServiceParent: service.parent ? service.parent.id : null,
      editServicePrice: service.price,
      serviceToUpdateID: service.id,
    }));
  };

  const handleUpdateService = async () => {
    try {
      const updateServiceFormData = {
        service_name: state.editServiceName,
        service_code: state.editServiceCode,
        service_category_id: state.editServiceCategory,
        parent_id: state.editServiceParent,
        price: state.editServicePrice,
      };

      const res = await API.put(
        `/api/services/${state.serviceToUpdateID}`,
        updateServiceFormData
      );

      setState((prevState) => ({
        ...prevState,
        services: Object.values(prevState.services).map((service) =>
          service.id === prevState.serviceToUpdateID ? res.data.data : service
        ),
      }));
      setStateValue("showEditServiceModal", false);
    } catch (e) {
      // console.log(e.response)
    }
  };

  const handleCategoryClick = (category_id) => {
    /* CALLBACK IS PASSED INTO LOADSERVICES FUNCTION TO FILTER THE SERVICES AFTER FETCHING FROM SERVER */
    loadServices(() =>
      setState((prevState) => ({
        ...prevState,
        services: Object.values(prevState.services).filter(
          (service) => service.service_category_id === category_id
        ),
      }))
    );
  };

  const handleSearchService = () => {
    loadServices(() =>
      setState((prevState) => ({
        ...prevState,
        services: Object.values(state.services).filter(
          (service) =>
            service.id === state.searchServiceInputValue ||
            service.service_name.indexOf(state.searchServiceInputValue) !==
              -1 ||
            service.category.category_name.indexOf(
              state.searchServiceInputValue
            ) !== -1
        ),
      }))
    );
  };

  /**
   *  Displays a service coe
   * @param {*} category_id
   * @returns
   */
  const renderServiceCOEs = (service_id) => {
    if (service_id) {
      const selectedService = Object.values(state.services).filter(
        (service) => service.id === service_id
      )[0];
      return selectedService.coes.map((coe, index) => (
        <div key={index} className="row">
          <div className="col-md-1">{index + 1}</div>
          <div className="col-md-6"> {coe.coe_name} </div>
          <div className="col-md-4">
            <span className={`btn ${chfstyles.badge}`}>
              <strong>
                <del>N</del> {formatAsMoney(coe.pivot.price)}
              </strong>{" "}
            {state.editServiceCoe!==coe.id?
            <span
              onClick={() => {
                setStateValue("editServiceCoe", coe.id);
              }}
            >
              <Icon icon="fa fa-edit" />
            </span>:(
            <div className="form-group">
              <input
                className="form-control"
                required
                type="number"
                defaultValue={coe.pivot.price}
                onChange={(e) => setStateValue(e.target.name, e.target.value)}
                name="editServiceCoePrice"
              />
              <button
                className="btn btn-success"
                onClick={() => {
                  handleEditServiceCOEPrice(coe.id);
                }}
              >
               Go
              </button>
            </div>
            )}
             </span>
          </div>
          <div className="col-md-1">
            <span
              className={`btn ${chfstyles.badge} text-danger`}
              onClick={() => {
                handleDetachServiceCOE(coe.id);
              }}
            >
              X
            </span>
          </div>
        </div>
      ));
    }
    return <span>No coes for this service</span>;
  };

  const handleEditServiceCOEPrice = async (coe_id) => {
    setStateValue("message", "");
    try {
      // eslint-disable-next-line no-unused-vars
      const res = await API.put(
        `/api/services/${state.serviceToAttachID}/coes/${coe_id}`,
        {
          price: state.editServiceCoePrice,
        }
      );
      setState((prevState)=>({
          ...prevState,
          editServiceCoe:null,
          editServiceCoePrice:0
      }))
      // loadServices();
    } catch (e) {
      //   console.log(e.response);
      setState((prevState) => ({
        ...prevState,
        message: formatErrors(e),
      }));
    }
  };

  /**
   * Open attach COE modal
   * @param {*} service_id
   */
  const handleAttachCOEButtonClick = (service_id) => {
    const service = Object.values(state.services).filter(
      (category) => category.id === service_id
    )[0];
    setState((prevState) => ({
      ...prevState,
      showAttachCOEModal: true,
      attachServiceName: service.service_name,
      attachCOEServicePrice: service.price,
      serviceToAttachID: service.id,
      message: "",
    }));
  };

  /**
   * Attach a coe to a service
   */
  const handleAttachServiceCOE = async () => {
    setStateValue("message", "");
    try {
      // eslint-disable-next-line no-unused-vars
      const res = await API.post(
        `/api/services/${state.serviceToAttachID}/coes/${state.attachServiceCOEId}`,
        {
          price: state.attachCOEServicePrice,
        }
      );
      setState((prevState) => ({
        ...prevState,
        showAttachCOEModal: false,
      }));
      loadServices();
    } catch (e) {
      //   console.log(e.response);
      setState((prevState) => ({
        ...prevState,
        message: formatErrors(e),
      }));
    }
  };

  /**
   * Detach a COE from a service
   * @param {*} coe_id
   */
  const handleDetachServiceCOE = async (coe_id) => {
    try {
      setStateValue("message", "");
      // eslint-disable-next-line no-unused-vars
      const res = await API.delete(
        `/api/services/${state.serviceToAttachID}/coes/${coe_id}`
      );
      loadServices();
    } catch (e) {
      //   console.log(e.response);
      setState((prevState) => ({
        ...prevState,
        message: formatErrors(e),
      }));
    }
  };

  let pageLoaded = false;
  useEffect(() => {
    loadServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    pageLoaded = true;
  }, [pageLoaded]);

  return (
    <>
      <div className={["container", chfstyles.chfadmin_wrapper].join(" ")}>
        <PageTitle title="Services" />
        <Inlinesearchbox
          inputValue={state.searchServiceInputValue}
          inputPlaceholder="Search Service"
          onInputChange={(e) =>
            setStateValue("searchServiceInputValue", e.target.value)
          }
          onButtonClick={handleSearchService}
          icon="fa fa-search"
        />
        <div className={["row"].join(" ")}>
          <div className="col-md-3 shadow-sm p-2">
            <h6 className="text-secondary text-center p-2">
              Categories
              <AuthorizedOnlyComponent requiredPermission="VIEW_CATEGORY">
                <Link to="/category">
                  <button className="float-right  btn-sm btn btn-success">
                    View Category <Icon icon="fa fa-eye" />{" "}
                  </button>
                </Link>
              </AuthorizedOnlyComponent>
            </h6>
            <ul className="list-group">
              <li
                className="list-group-item clickable"
                onClick={() => loadServices()}
              >
                All Services
              </li>
              {(state.loadingCategories && (
                <Spinner animation="border" variant="success" />
              )) ||
                renderCategories()}
            </ul>
          </div>
          <div className={["col-md-9 p-4", chfstyles.chfadmin_table].join(" ")}>
            <h6 className="text-secondary p-2">
              Services
              <AuthorizedOnlyComponent requiredPermission="CREATE_SERVICE">
                <button
                  className="float-right btn btn-sm btn-success"
                  onClick={() => setStateValue("showAddServiceModal", true)}
                >
                  Add Service <Icon icon="fa fa-plus" />{" "}
                </button>
              </AuthorizedOnlyComponent>
            </h6>
            <div className={chfstyles.scrollableX}>
              <table className="table table-responsive-sm">
                <THead columns={table_columns} />
                <tbody>
                  {(state.loadingServices && (
                    <Spinner animation="border" variant="success" />
                  )) ||
                    renderServices()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {state.showAddServiceModal && (
        <Modal>
          <ModalHeader
            modalTitle="Add Service"
            onModalClose={() => setStateValue("showAddServiceModal", false)}
          />
          <ModalBody>
            <div className="form-group">
              <label className="text-secondary">Service Name</label>
              <input
                className="form-control"
                required
                value={state.newServiceName}
                onChange={(e) => setStateValue(e.target.name, e.target.value)}
                name="newServiceName"
              />
            </div>
            <div className="form-group">
              <label className="text-secondary">Service Code</label>
              <input
                className="form-control"
                required
                value={state.newServiceCode}
                onChange={(e) => setStateValue(e.target.name, e.target.value)}
                name="newServiceCode"
                placeholder="Service Code"
                maxLength="5"
              />
            </div>
            <div className="form-group">
              <label className="text-secondary">Service Price</label>
              <input
                className="form-control"
                required
                type="number"
                value={state.newServicePrice}
                onChange={(e) => setStateValue(e.target.name, e.target.value)}
                name="newServicePrice"
              />
            </div>
            <div className="form-group">
              <label className="text-secondary">Service Cagegory</label>
              <select
                className="form-control"
                required
                name="newServiceCategory"
                onChange={(e) => setStateValue(e.target.name, e.target.value)}
              >
                {Object.keys(state.categories).map((category, index) => (
                  <option key={index} value={state.categories[category].id}>
                    {state.categories[category].category_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="text-secondary">Service Parent</label>
              <select
                className="form-control"
                name="newServiceParent"
                onChange={(e) => setStateValue(e.target.name, e.target.value)}
              >
                <option value="">No Parent</option>
                {Object.keys(state.services).map((service, index) => (
                  <option value={state.services[service].id}>
                    {state.services[service].service_name}
                  </option>
                ))}
              </select>
            </div>
          </ModalBody>
          <ModalFooter>
            <button
              className="btn btn-success btn-sm mr-3"
              onClick={handleAddService}
            >
              Create
            </button>
            <button
              className="btn btn-secondary btn-sm mr-3"
              onClick={() => setStateValue("showAddServiceModal", false)}
            >
              Cancel
            </button>
          </ModalFooter>
        </Modal>
      )}

      {state.showDeleteServiceModal && (
        <Modal>
          <ModalHeader
            modalTitle="Delete Service"
            onModalClose={() => setStateValue("showDeleteServiceModal", false)}
          />
          <ModalFooter>
            <button
              className="btn btn-sm btn-danger"
              onClick={handleDeleteService}
            >
              Delete
            </button>
          </ModalFooter>
        </Modal>
      )}

      {state.showEditServiceModal && (
        <Modal>
          <ModalHeader
            modalTitle="Edit Service"
            onModalClose={() => setStateValue("showEditServiceModal", false)}
          />
          <ModalBody>
            <div className="form-group">
              <label className="text-secondary">Service Name</label>
              <input
                className="form-control"
                required
                value={state.editServiceName}
                onChange={(e) => setStateValue(e.target.name, e.target.value)}
                name="editServiceName"
              />
            </div>
            <div className="form-group">
              <label className="text-secondary">Service Code</label>
              <input
                className="form-control"
                required
                value={state.editServiceCode}
                onChange={(e) => setStateValue(e.target.name, e.target.value)}
                name="editServiceCode"
                placeholder="Service Code"
                maxLength="5"
              />
            </div>
            <div className="form-group">
              <label className="text-secondary">Service Price</label>
              <input
                className="form-control"
                required
                type="number"
                value={state.editServicePrice}
                onChange={(e) => setStateValue(e.target.name, e.target.value)}
                name="editServicePrice"
              />
            </div>
            <div className="form-group">
              <label className="text-secondary">Service Cagegory</label>
              <select
                className="form-control"
                required
                name="editServiceCategory"
                onChange={(e) => setStateValue(e.target.name, e.target.value)}
              >
                {Object.keys(state.categories).map((category, index) => (
                  <option key={index} value={state.categories[category].id}>
                    {state.categories[category].category_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="text-secondary">Service Parent</label>
              <select
                className="form-control"
                name="editServiceParent"
                onChange={(e) => setStateValue(e.target.name, e.target.value)}
              >
                <option value="">No Parent</option>
                {Object.keys(state.services).map((service, index) => (
                  <option key={index} value={state.services[service].id}>
                    {state.services[service].service_name}
                  </option>
                ))}
              </select>
            </div>
          </ModalBody>
          <ModalFooter>
            <button className="btn btn-success" onClick={handleUpdateService}>
              Update
            </button>
          </ModalFooter>
        </Modal>
      )}

      {state.showAttachCOEModal && (
        <Modal>
          <ModalHeader
            modalTitle={`Attach COE to ${state.attachServiceName}`}
            onModalClose={() => setStateValue("showAttachCOEModal", false)}
          />
          <ModalBody>
            <div className="form-group">
              <label className="text-secondary">Select COE to attach</label>
              <select
                className="custom-select"
                required
                defaultValue={state.attachServiceCOEId}
                onChange={(e) => setStateValue(e.target.name, e.target.value)}
                name="attachServiceCOEId"
              >
                <option value="">...select...</option>
                {state.coes.map((coe, idx) => (
                  <option key={`${coe.id}${idx}`} value={coe.id}>
                    {coe.coe_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="text-secondary">COE Service Price</label>
              <input
                className="form-control"
                required
                type="number"
                value={state.attachCOEServicePrice}
                onChange={(e) => setStateValue(e.target.name, e.target.value)}
                name="attachCOEServicePrice"
              />
            </div>
            <button
              className="btn btn-success"
              onClick={handleAttachServiceCOE}
            >
              Attach COE
            </button>
          </ModalBody>
          <ModalFooter>
            <h6>{`Attached COEs`}</h6>
            {renderServiceCOEs(state.serviceToAttachID)}
          </ModalFooter>
        </Modal>
      )}
    </>
  );
};

export default Service;
