import { canActivate } from "../utils/menu.utils";
import { SIDE_MENU_LOADED } from "./action.types";

const initial_state = [];

const sideMenuReducer = (state = initial_state, action) => {
    switch (action.type) {
        case SIDE_MENU_LOADED:{
            return action.payload.menu_list.filter( menu_item => canActivate(action.payload.user_permissions,menu_item.menu_permission))
        }
    
        default:
            return state;
    }
}

export default sideMenuReducer;