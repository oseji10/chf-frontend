import DashboardCardLinks from "../components/dashboard/dashboardCardLinks";
import MyProfile from "./profile/MyProfile";
import { canActivate } from "../utils/menu.utils";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import Preloader from "../components/preloader";
import { useState } from "react";
import { AiOutlineLineChart, AiOutlineLink } from "react-icons/ai";
import { AuthorizedOnlyComponent } from "../components";
import COEAnalytics from "./coeadmin/COEAnalytics/COEAnalytics";
import SuperadminAnalytics from "../components/Analytics/SuperadminAnalytics";

function Dashboard(props) {
  const { user, menus, is_first_time_application } = props;
  const cardMenus = menus.slice(0, 3);

  const renderDashboardContent = () => {
    return (
      <div>
        {/* Card links for quick nav */}
        <div className="container">
          <div className="row">
            <div className="col-sm-12">
              <h4 className="text-success"><AiOutlineLink /> Quick Links</h4>
            </div>
            {/* <div className="col-sm-12"> */}
            {cardMenus.length > 0 &&
              cardMenus.map((menu, idx) => {
                if (idx < 3) {
                  return (
                    <DashboardCardLinks
                      key={`${menu.menu_link}${idx}`}
                      idx={idx}
                      icon={menu.menu_icon}
                      link={menu.menu_link}
                      text={menu.menu_name}
                    />
                  );
                }
                return "";
              })}
            {/* </div> */}
            <div className="col-sm-12">
              {/* <SuperadminAnalytics /> */}
              <AuthorizedOnlyComponent requiredPermission={"VIEW_COE_ANALYTICS"}>
                <h4 className="text-success"><AiOutlineLineChart /> Analytics</h4>
                <COEAnalytics />
              </AuthorizedOnlyComponent>
            </div>
          </div>
        </div>
        <MyProfile />
      </div>
    );
  };

  return !user || !menus ? (
    <Preloader />
  ) : canActivate(user.permissions, "APPLY_FUND") &&
    is_first_time_application ? (
    <Redirect to="/myapplications" />
  ) : (
    <div className="container">
      <div className="row">
        <div className="col-sm-12">{renderDashboardContent()}</div>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    user: state.auth.user,
    menus: state.sideMenuList,
    is_first_time_application: state.application.is_first_patient_application,
  };
};

export default connect(mapStateToProps)(Dashboard);
