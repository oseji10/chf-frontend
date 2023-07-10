// import useContextGetter from "../../hooks/useContextGetter";
import Menu from "./menu";
import ImasServiceMenu from "./imasServiceMenu";
// import getMenuItems from '../../utils/menu.utils';
import { connect } from "react-redux";

function Sidebar({ user, toggleSidebarDisplay, displaySidebar }) {
  // const menus= getMenuItems();
  return (
    <nav id="sidebar" className={displaySidebar}>
      <div id="dismiss" onClick={toggleSidebarDisplay}>
        <i className="fas fa-arrow-left"></i>
      </div>
      <div className="sidebar-header">
        <h5>
          <span>
            {user && `${user.user.first_name}`}
          </span>
        </h5>
      </div>
      <ul className="list-unstyled components">
        
          <Menu />
        
      </ul>
      <span className="pl-2">Switch to:</span>
      <ul className="list-unstyled components">
        <ImasServiceMenu />
      </ul>
    </nav>
  );
}

const mapStateToProps = (state) => {
  return {
    user: state.auth.user
  };
};



export default connect(mapStateToProps)(Sidebar);

