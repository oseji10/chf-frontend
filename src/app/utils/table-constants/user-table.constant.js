import { Tag } from "../../components";
import { ACTIVE, DANGER, SUCCESS } from "../constant.util";

export const COE_ADMIN_USERS_TABLE_COLUMNS = [
    {
        name: 'SN',
        options: {
            filter: false,
        }
    },
    {
        name: "Name",
        options: {
            filter: false,
        }
    },
    {
        name: "Email",
        options: {
            filter: false,
        }
    },
    {
        name: "Phone Number",
        options: {
            filter: false,
        }
    },
    {
        name: 'Created At',
        options: {
            filter: false,
        }
    },
    {
        name: 'Status',
        options: {
            filter: false,
            customBodyRender: status => <Tag text={status} variant={status.toUpperCase() === ACTIVE ? SUCCESS : DANGER} />
        }
    },
    {
        name: 'Role',
        options: {
            filter: false,
        }
    },
    {
        name: '',
        options: {
            filter: false,
        }
    },
]

