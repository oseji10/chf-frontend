import { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import PopupList from "../message/PopupList";
import PageSpinner from "../spinner/pageSpinner";

// import "./../../../assets/App.scss";


import NavBar from "./navbar";
import Footer from "./footer";
import Sidebar from "./sidebar";
import API from "../../config/chfBackendApi";
import { loadSideMenu } from "../../redux/sidemenulist.action";
import { logoutUser, logUserIn, refreshProfile } from "../../redux/auth.action";

function Layout({ children }) {
  const dispatch = useDispatch();
  const [displaySidebar, setDisplaysideBar] = useState("inactive");
  const popups = useSelector(state => state).popups;
  const isPageSpinnerVisible = useSelector(state => state.isPageSpinnerVisible)

  const toggleSidebarDisplay = () => {
    displaySidebar === "inactive"
      ? setDisplaysideBar("active")
      : setDisplaysideBar("inactive");
  };

  useEffect(async () => {
    try {
      const res = await API.get('/api/uimenu');
      const profileRequest = await API.get('/api/users/profile');
      dispatch(loadSideMenu(profileRequest.data?.data?.permissions, res.data?.data))
    } catch (error) {
      dispatch(logoutUser())
    }
  }, [])
  return (
    <div>
      {/* {displaySidebar === "active" && <Overlay />} */}
      <NavBar toggleSidebarDisplay={toggleSidebarDisplay} />

      <aside>
        <Sidebar
          toggleSidebarDisplay={toggleSidebarDisplay}
          displaySidebar={displaySidebar}
        ></Sidebar>
      </aside>
      <div className="content">
        <PopupList popups={popups} />
        {children}
      </div>

      {isPageSpinnerVisible ? <PageSpinner /> : null}
      <Footer />
    </div>
  );
}

export default Layout;
