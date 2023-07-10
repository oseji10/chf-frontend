import { Tag } from "../../components"

export const COE_PATIENT_REFERRAL_TABLE_COLUMNS = [
                    'SN', 
                    {name:"Referral Date", options: {filter: false}}, 
                    "Referring COE", 
                    "Reference COE", 
                    {name: "Patient ID", options: {filter: false}},
                    "Assigned To",
                    {name: "Total",options: {filter: false}},
                    {name: "Type", options: {
                        customBodyRender: (value) => {
                            return <Tag 
                            text={value}
                            variant={value.toLowerCase() === 'inward' ? 'success' : 'danger'} />
                        }
                    }},
                    "Status",
                    {name:"", options: {filter: false, sort: false}},
                    {name:"", options: {filter: false, sort: false}},
            ];

export const COE_PATIENT_REFERRAL_DETAIL_TABLE_COLUMNS = [
    {name: "SN", options: {filter: false}},
    {name: "Service", options: {filter: false}},
    {name: "Quantity", options: {filter: false}},
    {name: "Cost", options: {filter: false}},
    {name: "Subtotal", options: {filter: false}},
]