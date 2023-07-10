import styles from "./home.module.scss";
const SupportNav=()=>{
    return(
        <div className="container-fluid bg-dark">
        <div className={`${styles.customer_container}`}>
          <div className=""><small>CHF Support Available Mon-Fri 8:00am-5:00pm: <i className="fa fa-phone mx-2"></i>0913 712 5415</small></div>
        </div>
    </div>
    );
}

export default SupportNav;