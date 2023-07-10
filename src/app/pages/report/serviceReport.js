/* eslint-disable no-unused-vars */
import { Jumbotron } from "reactstrap";
import styles from "./infographics/infographics.module.scss";
import { useEffect, useState } from "react";
import API from "../../config/chfBackendApi";
import PageTitle from "../../components/pageTitle/pageTitle";
import SmallTable from "./infographics/smallTable";
import BarChart from "./infographics/BarChart";

const initial_state = {
  categories: [],
  coes: [],
  activeCategory: null,
  activeCoe: null,
  startDate: "",
  endDate: "",
  serviceAnalytics: null,
  selectedCOE: "",
  selectedCategory: "",
  pageLoaded:false
};

const ServiceReport = () => {
  const [state, setState] = useState(initial_state);

  const loadData = async () => {
    try {
      const res = await Promise.all([
        API.get(`/api/service_categories`),
        API.get(`/api/coes`),
      ]);
      setState((prevState) => ({
        ...prevState,
        categories: Object.values(res[0].data.data),
        coes: res[1].data.data,
        activeCategory: Object.values(res[0].data.data).length
          ? Object.values(res[0].data.data)[0]
          : null,
        selectedCategory: Object.values(res[0].data.data).length
          ? Object.values(res[0].data.data)[0].id
          : "",
        activeCoe: Object.values(res[1].data.data).length
          ? Object.values(res[1].data.data)[0]
          : null,
      }));
    } catch (e) {
      console.log(e);
    }
  };

  const loadInfoGraphics = async () => {
    try {
      const analyticsUrl = state.selectedCOE
        ? `/api/analytics/services?category=${state.selectedCategory}&coe=${state.selectedCOE}&start_date=${state.startDate}&end_date=${state.endDate}`
        : `/api/analytics/services?category=${state.selectedCategory}&start_date=${state.startDate}&end_date=${state.endDate}`;

      const res = await API.get(analyticsUrl);
      // console.log("Analytics response", res.data.data);
      setState((prevState) => ({
        ...prevState,
        serviceAnalytics: res.data.data,
      }));
    } catch (e) {
      // console.log(e.response)
    }
  };

  const renderServices = () => {
    return state.serviceAnalytics.services.map((service, index) => (
      <div
        className={`${styles.table_row} ${styles.line_bottom}`}
        key={`${service.service_name}`}
      >
        <span
          className={
            !(++index % 3)
              ? `${styles.column} ${styles.success} ${styles.circle}`
              : !(++index % 2)
              ? `${styles.column} ${styles.warning} ${styles.circle}`
              : `${styles.column} ${styles.pink} ${styles.circle}`
          }
        >
          {service.billings_count}
        </span>
        <div className={`${styles.column} ${styles.grow}`}>
          {" "}
          {service.service_name}
        </div>
      </div>
    ));
  };
  

  // Prepares the data to be displayed in a bar chart
  const chartData = () => {
    let labels = [];
    let data = [];
    for (let service of state.serviceAnalytics.services) {
      labels.push(service.service_code);
      data.push(service.billings_count);
    }
    return {
      labels,
      data,
    };
  };

  const handleInputChange = (e) => {
    setStateValue(e.target.name, e.target.value);
  };

  const setStateValue = (field, value) => {
    setState((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const renderServiceBars = () => {
    const data = chartData();
    return (
      <BarChart
        labels={data.labels}
        data={data.data}
        title={`Service Usage ${state.serviceAnalytics && state.serviceAnalytics.hasOwnProperty("category")
        ?state.serviceAnalytics.category.category_name:""}`}
      />
    );
  };

  useEffect(() => {
    if(!state.pageLoaded) loadData();
    loadInfoGraphics();
    
    setStateValue("pageLoaded",true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.pageLoaded,
    state.selectedCategory,
    state.selectedCOE,
    state.startDate,
    state.endDate,
  ]);

  return (
    <>
      <div className="container">
        <PageTitle title="Service Reports" icon="fa fa-paper-plane" />
        <Jumbotron
          className={["row shadow-lg bg-light", styles.bb_primary].join(" ")}
        >
          <div className="col-sm-12">
            <h4 className="text-success text-uppercase d-block">FILTERS</h4>
          </div>
          <div className="col-sm-12">
            <div className="row">
              <div className="col-md-3">
                <small className="text-success text-uppercase d-block">
                  Category
                </small>
                <select
                  className="form-control custom"
                  onChange={handleInputChange}
                  value={state.selectedCategory}
                  name="selectedCategory"
                >
                  {state.categories.map((category, index) => (
                    <option key={`${index}${category.id}`} value={category.id}>
                      {category.category_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <small className="text-success text-uppercase d-block">
                  COE
                </small>
                <select
                  className="form-control custom"
                  onChange={handleInputChange}
                  value={state.selectedCOE}
                  name="selectedCOE"
                >
                  <option value="">All</option>
                  {state.coes.map((coe, index) => (
                    <option key={`${index}${coe.id}`} value={coe.id}>
                      {coe.coe_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <small className="text-success text-uppercase d-block">
                  Start Date
                </small>
                <input
                  type="date"
                  className="form-control"
                  onChange={handleInputChange}
                  value={state.startDate}
                  name="startDate"
                />
              </div>
              <div className="col-md-3">
                <small className="text-success text-uppercase d-block">
                  End Date
                </small>
                <input
                  type="date"
                  name="endDate"
                  className="form-control"
                  onChange={handleInputChange}
                  value={state.endDate}
                />
              </div>
            </div>
          </div>
        </Jumbotron>
        <div className="row">
          <div className={["col-md-6 p-3"].join(" ")}>
            <h5 className="text-secondary">Service Usage Chart</h5>
            {state.serviceAnalytics && state.serviceAnalytics.hasOwnProperty("services") && renderServiceBars()}
          </div>
          <div className={["col-md-6 p-3"].join(" ")}>
            <h5 className="text-secondary">Number of Service usage</h5>
            <SmallTable className={`${styles.small_table} ${styles.card}`}>
              {state.serviceAnalytics && state.serviceAnalytics.hasOwnProperty("services") && renderServices()}
            </SmallTable>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServiceReport;
