import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../../config/chfBackendApi";
// import { formatAsMoney } from "../../utils/money.utils";
import { timestampToRegularTime } from "../../utils/date.util";
import { diffWithNowMins } from "../../utils/date.util";

export default function Notifications() {
  const [state, setState] = useState({
    transactions: [],
  });

  const getTransactions = async () => {
    try {
      const res = await API.get(`/api/notification/transactions`);
      setState((prev) => ({
        ...prev,
        transactions: res.data.data,
      }));
    } catch (e) {
      console.log(e);
    }
  };
  
  let loadedState = false;
  useEffect(() => {
    getTransactions();
    loadedState = true;
  }, [loadedState]);


  return (
    state.transactions.length > 0 && (
      <li className="nav-item dropdown">
        <Link
          className="nav-link dropdown-toggle"
          to="#"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
        >
          {state.transactions.length &&
          diffWithNowMins(state.transactions[0].created_at) < 720 ? (
            <span className="notification-label"></span>
          ) : (
            ``
          )}

          <span>
            <i className="fa fa-bell"></i>
          </span>
        </Link>
        <div className="dropdown-menu">
          {state.transactions.map((transaction) => {
            return (
              <span
                className="dropdown-item text-info"
                key={`notification${transaction.id}`}
              >
                <small>
                  <strong>
                    New bill paid on &nbsp;
                    {/* <del>N</del> {formatAsMoney(parseFloat(transaction.total))}{" "} */}
                    {timestampToRegularTime(transaction.created_at)}
                  </strong>
                </small>
              </span>
            );
          })}
        </div>
      </li>
    )
  );
}
