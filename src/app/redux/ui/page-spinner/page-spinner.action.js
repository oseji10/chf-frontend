import { TOGGLE_PAGE_SPINNER } from "../../action.types"

export const togglePageSpinner = (isVisible = false) => {
    return {
        type: TOGGLE_PAGE_SPINNER,
        payload: isVisible,
    }
}