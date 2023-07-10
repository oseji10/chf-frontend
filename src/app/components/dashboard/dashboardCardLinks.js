import {Link} from "react-router-dom";

const DashboardCardLinks=({idx,icon,link,text})=>{
    var bg= ["bg-info","bg-warning","bg-success"];
    return(
        <div className={`text-center ${bg[idx]} text-light col p-3 m-3 rounded`}>
            <h1>
              <i className={`${icon}`}></i>
            </h1>
            <h5>
              <Link to={link} className="text-light"><b>{text}</b></Link>
            </h5>
          </div>
    );
}
export default DashboardCardLinks;