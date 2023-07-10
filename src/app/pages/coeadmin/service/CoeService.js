import chfstyles from "../../chfadmin/chfadmin.module.scss";
import PageTitle from "../../../components/pageTitle/pageTitle";
import Inlinesearchbox from "../../chfadmin/inlinesearchbox";
import THead from "../../../components/table/thead/thead";
import Icon from "../../../components/icon/icon";
import API from "../../../config/chfBackendApi";
import { useEffect } from "react";
import { useState } from "react";
import { formatAsMoney } from "../../../utils/money.utils";
import { Spinner } from "react-bootstrap";
import {connect} from "react-redux";
import AuthorizedOnlyComponent from "../../../components/authorizedOnlyComponent";

const CoeService = ({user}) => {
  const initial_state = {
    categories: [],
    services: [],
    loadingServices: true,
    loadingCategories: true,
    searchServiceInputValue: "",
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
      const categoriesRequest = await API.get("/api/service_categories");
      const servicesRequest = await API.get(`/api/services?coe=${user.user.coe_id}`);
      // const res = await Promise.all([
      //   categoriesRequest,
      //   servicesRequest,
      // ]);

      setState((prevState) => ({
        ...prevState,
        categories: categoriesRequest.data?.data,
        services: servicesRequest.data?.data,
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
    console.log(state.services[0]?.coes)
    return Object.values(state.services).map((service, index) => (
      
      <tr key={index}>
        <td>{index + 1}</td>
        <td>{service.service_name}</td>
        <td>{service.category.category_name}</td>
        <td>
          {service.parent
            ? service.parent.service_name
            : ""}
        </td>
        <td>
          <del>N</del> {formatAsMoney(service.coes[0].pivot.price)}
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
            service.service_name.toLowerCase().indexOf(state.searchServiceInputValue.toLowerCase()) !==
              -1 ||
            service.category.category_name.toLowerCase().indexOf(
              state.searchServiceInputValue.toLowerCase()
            ) !== -1
        ),
      }))
    );
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
                <a href="/category">
                  <button className="float-right  btn-sm btn btn-success">
                    View Category <Icon icon="fa fa-eye" />{" "}
                  </button>
                </a>
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
    </>
  );
};

const mapStateToProps=state=>{
  return{
    user: state.auth.user
  }
}

export default connect(mapStateToProps)(CoeService);
