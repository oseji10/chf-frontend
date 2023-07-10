import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { canActivate } from "../../utils/menu.utils";

function Menu({menus, sideMenuList, user}) {

  return (
    
    sideMenuList.map((menu,idx) => {
                  return (
                    user && canActivate(user.permissions, menu.menu_permission) && <li className="dropdown" key={`${idx}${menu.menu_name}`}>
                        <div>
                          <Link
                            className=""
                            to={menu.menu_link}
                            id={menu.menu_name}
                            role="button"
                            aria-expanded="false"
                          >
                            <span>
                              <i className={`${menu.menu_icon} mr-2`}></i>
                            </span>
                            {menu.menu_name}
                          </Link>
                        </div>
                    </li>
                  );
                })
  );
}

const mapStateToProps = state => {
  return {
    sideMenuList: state.sideMenuList,
    user: state.auth.user,
  }
}

export default connect(mapStateToProps)(Menu);
