import { SIDE_MENU_LOADED } from "./action.types"



export const loadSideMenu = (user_permissions, menu_list) => {
    return {
        type: SIDE_MENU_LOADED,
        payload: {
            user_permissions,
            menu_list
        }
    }
} 