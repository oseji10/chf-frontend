import { Tag } from "../components"
import { APPROVED, DANGER, DECLINED, INFO, IN_PROGRESS, PENDING, PRIMARY, SUCCESS, WARNING, YES } from "./constant.util"

export const defaultTableOptions = {
    condensed: true,
    selectableRows: false,
    elevation: 0,
    // responsive: 'standard',
}


export const CHFAdminApplicationTableColumns = [
    { name: "#", options: { filter: false, sort: false } },
    "COE",
    { name: 'CHF ID', options: { filter: false, } },
    { name: "Name", options: { filter: false } },
    "Cancer Type",
    "Cancer Stage",
    { name: "CMD Approved On", options: { filter: false, display: false } },
    { name: "Application Date", options: { filter: false } },
    {
        name: "Application Status", options: {
            customBodyRender: (status) => {
                let variant;
                switch (status.toUpperCase()) {
                    case APPROVED: {
                        variant = PRIMARY
                        break;
                    }
                    case PENDING: {
                        variant = INFO;
                        break;
                    }
                    case IN_PROGRESS: {
                        variant = WARNING;
                        break;
                    }

                    default:
                        break;
                }
                return <><Tag variant={variant} text={status} /> </>
            }
        }
    },
]

export const COEAdminPatientsTableColumns = [
    { name: "#", options: { filter: false, } },
    { name: "Name", options: { filter: false, } },
    { name: "Phone", options: { filter: false, } },
    { name: "CHF ID", options: { filter: false, } },
    "Cancer Type",
    "Cancer Stage",
    "Primary Physician",
    { name: "Wallet (NGN)", options: { filter: false } },
    {
        name: "CMD Reviewed", options: {
            customBodyRender: (status) => {
                return <><Tag text={status} variant={status === YES ? PRIMARY : DANGER} /></>
            }
        }
    },
    { name: "", options: { filter: false, sort: false, } },
    { name: "", options: { filter: false, sort: false, } },
    { name: "", options: { filter: false, sort: false, } },
    { name: "", options: { filter: false, sort: false, } },
];

export const SuperAdminPatientsTableColumns = [
    { name: '#', options: { filter: false, } },
    { name: 'Name', options: { filter: false } },
    { name: 'Email', options: { filter: false } },
    { name: 'CHF ID', options: { filter: false } },
    { name: 'COE', options: {} },
    { name: 'Cancer Type', options: {} },
    { name: 'Cancer Stage', options: {} },
    { name: 'Wallet (NGN)', options: { filter: false } },
    { name: '', options: { filter: false, sort: false } },

]

export const SuperAdminLightPatientsTableColumns = [
    { name: "#", options: { filter: false } },
    { name: "CHF ID", options: { filter: false } },
    { name: "COE", options: { filter: false } },
    { name: "Cancer Type", options: {} },
    { name: "Cancer Stage", options: {} },
    {
        name: "Profile Completed", options: {
            customBodyRender: (status) => {
                let variant;
                switch (status.toUpperCase()) {
                    case APPROVED: {
                        variant = PRIMARY
                        break;
                    }
                    case PENDING: {
                        variant = INFO;
                        break;
                    }
                    case IN_PROGRESS: {
                        variant = WARNING;
                        break;
                    }
                    default: {
                        variant = DANGER;
                        break;
                    }
                }
                return <Tag text={status} variant={variant} />
            }
        }
    },
]

export const COEStaffPatientTransferTableColumns = [
    { name: "SN", options: { filter: false } },
    { name: "Patient CHF ID", options: { filter: false } },
    { name: "Request Date", options: { filter: false } },
    { name: "Approval Date", options: { filter: false } },
    {
        name: "Status", options: {
            customBodyRender: status => <Tag text={status} variant={status === PENDING ? WARNING : status === APPROVED ? PRIMARY : DANGER} />
        }
    },
]

export const COEAdminPatientsTransferTableColumns = [
    { name: 'SN', options: { filter: false } },
    { name: 'Patient ID', options: { filter: false } },
    { name: 'Current Physician', options: {} },
    { name: 'Requesting Physician', options: {} },
    { name: 'Request Date', options: { filter: false } },
    { name: 'Approval Date', options: { filter: false } },
    {
        name: 'Status', options: {
            filter: false,
            customBodyRender: status => <Tag text={status} variant={status === PENDING ? WARNING : status === APPROVED ? SUCCESS : DANGER} />
        }
    },
    { name: '', options: { filter: false, sort: false } },
]