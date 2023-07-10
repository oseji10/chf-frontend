import React, { useEffect, useState } from "react";
import API from "../../../config/chfBackendApi";
import chfstyles from "../../chfadmin/chfadmin.module.scss";
import { formatAsMoney } from "../../../utils/money.utils";
import HistoryHeader from "../../patient/TableTop";
import { Spinner } from "react-bootstrap";
import logostyles from "../../coestaff/coestaff.module.scss";
import logo from "../../../../assets/images/logo.png";
import PageTitle from "../../report/infographics/pageTitle";
import axios from "axios";
import { Link } from "react-router-dom";

const initial_state = {
  billing_summary: [],
  coes: [],
  startDate: "",
  endDate: "",
  dataLoading: true,
};

function DrugSummaryReport() {
  const [state, setState] = useState(initial_state);
  let coeTotal = 0;
  let emgeTotal = 0;
  let bankTotal = 0;
  let distributorTotal = 0;
  let total = 0;

  const loadSummary = async () => {
    try {
      const res = await Promise.all([
        API.get(`/api/coes`),
        axios.get(
          `https://emge.emgeresources.com/api/v1.0/all_transactions.php?start_date=${state.startDate}&end_date=${state.endDate}`
        ),
      ]);
      // console.log(res[1]);
      setState((prevState) => ({
        ...prevState,
        coes: res[0].data.data,
        billing_summary: res[1].data,
        dataLoading: false,
      }));
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (state.startDate && state.endDate) {
      return loadSummary();
    }

    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.startDate, state.endDate]);
  
  useEffect(() => {
    loadSummary();
  },[])

  const renderSummary = () => {
    return (
      (state.startDate &&
        state.endDate &&
        state.billing_summary.length &&
        state.billing_summary.map((summary, index) => {
          const coe = state.coes.filter(
            (coe) => coe.coe_id_cap === summary.loc_id
          )[0];
          const summaryTotal =
            parseFloat(summary.coes) +
            parseFloat(summary.bank) +
            parseFloat(summary.manufacturer) +
            parseFloat(summary.emge);
          coeTotal += parseFloat(summary.coes);
          emgeTotal += parseFloat(summary.emge);
          bankTotal += parseFloat(summary.bank);
          distributorTotal += parseFloat(summary.manufacturer);
          total += parseFloat(summaryTotal);
          return (
            <>
              {coe && (
                <tr key={`${index}${summary.order_id}`}>
                  <td>{index + 1}</td>
                  <td>{coe.coe_name}</td>
                  <td>{summary.short_name}</td>
                  <td><del>N</del> {formatAsMoney(summaryTotal)}</td>
                  <td><del>N</del> {formatAsMoney(parseFloat(summary.coes))}</td>
                  <td><del>N</del> {formatAsMoney(parseFloat(summary.bank))}</td>
                  <td><del>N</del> {formatAsMoney(parseFloat(summary.manufacturer))}</td>
                  <td><del>N</del> {formatAsMoney(parseFloat(summary.emge))}</td>
                  <td className={`${chfstyles.no_print}`}>
                    <Link
                      to={`/superadmin/drug/billings/${coe.id}?start_date=${state.startDate}&end_date=${state.endDate}&is_drug=1&coe_cap_id=${summary.loc_id}`}
                    >
                      det...
                    </Link>
                  </td>
                </tr>
              )}
            </>
          );
        })) || (
        <tr>
          <td colSpan="8">
            {" "}
            No services billing summary to display for today. Select a start
            date and end date to view summary for other dates.
          </td>
        </tr>
      )
    );
  };
  const handleInputChange = (e) => {
    setState((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };
  const printReport = () => {
    window.print();
  };
  return (
    <>
      <div className={["container", chfstyles.application_wrapper].join(" ")}>
        <PageTitle
          title={`Finance and Accounting Drug Billing Summary Report`}
          titleClass={chfstyles.no_print}
        />
        <div className={chfstyles.application_table}>
          <HistoryHeader>
            <div className={`col-md-1 mt-2 ${chfstyles.no_print}`}></div>
            <div className={`col-md-3 mt-2 ${chfstyles.no_print}`}>
              <label className="text-secondary">Start Date</label>
              <input
                type="date"
                onChange={handleInputChange}
                value={state.startDate}
                name="startDate"
              />
            </div>

            <div className={`col-md-3 mt-2 ${chfstyles.no_print}`}>
              <label className="text-secondary">End Date</label>
              <input
                type="date"
                name="endDate"
                onChange={handleInputChange}
                value={state.endDate}
              />
            </div>
            <div className={`col-md-3 mt-2 ${chfstyles.no_print}`}>
              <label className="text-secondary">&nbsp;</label>
              <input
                type="button"
                className="btn btn-light"
                value="Print Report"
                onClick={printReport}
              />
            </div>
          </HistoryHeader>
          <div className={logostyles.invoice_container}>
            <div className={`row ${logostyles.invoice_header}`}>
              <img src={logo} alt="" />
              <div>
                <span>Drug Billing Summary Report</span>
                <span>From: {state.startDate}</span>
                <span>To: {state.endDate}</span>
              </div>
            </div>

            <table
              className={[
                "table table-responsive-sm",
                chfstyles.application_table,
              ].join(" ")}
            >
              <thead>
                <tr>
                  <th>#</th>
                  <th>COE Name</th>
                  <th>Man. Name</th>
                  <th>Drug Cost</th>
                  <th>COE</th>
                  <th>Bank</th>
                  <th>Man.</th>
                  <th>EMGE</th>
                  <th className={`${chfstyles.no_print}`}>Det.</th>
                </tr>
              </thead>
              <tbody>
                {(state.dataLoading && (
                  <tr>
                    <Spinner animation="border" variant="success" />
                  </tr>
                )) ||
                  renderSummary()}
                <tr>
                  <th colSpan="3">Totals:</th>
                  <th><del>N</del> {formatAsMoney(total)}</th>
                  <th><del>N</del>  {formatAsMoney(coeTotal)}</th>
                  <th><del>N</del>  {formatAsMoney(bankTotal)}</th>
                  <th><del>N</del> {formatAsMoney(distributorTotal)}</th>
                  <th><del>N</del>  {formatAsMoney(emgeTotal)}</th>
                  <th>{" "}</th>
                </tr>
                <tr>
                  <td colSpan="9">Key: <small>COE: Center of excellence or hospital</small>, <small>Man: Manufaturer</small>, <small>Det: Details of transaction</small></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default DrugSummaryReport;
