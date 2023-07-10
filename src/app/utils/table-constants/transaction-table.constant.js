export const COE_ADMIN_TRANSACTION_TABLE_COLUMNS = [
    {
        name: "SN",
        options: { filter: false }
    },
    {
        name: "Transaction ID",
        options: { filter: false }
    },
    {
        name: "Transaction Date",
        options: { filter: false }
    },
    {
        name: "Patient ID",
    },
    {
        name: "Service Count",
        options: { filter: false }
    },
    {
        name: "Total Cost",
        options: { filter: false }
    },
    {
        name: "Attendant Staff",
    },
    {
        name: "",
        options: { filter: false, sort: false }
    },
];

export const FANDA_TRANSACTION_TABLE_COLUMNS = [
    {
        name: "SN",
        options: { filter: false },
    },
    {
        name: "TRX ID",
        options: { filter: false },
    },
    {
        name: "Service",
    },
    {
        name: "Quantity",
        options: { filter: false },
    },
    {
        name: "Cost",
        options: { filter: false },
    },
    {
        name: "Hospital",
    },
    {
        name: "Date",
        options: { filter: false },
    },
    {
        name: "Status",
    },
    {
        name: "",
        options: { filter: false, sort: false },
    }
]

export const SUPERADMIN_TRANSACTION_TABLE_COLUMNS = [
    {
        name: "SN",
        options: { filter: false },
    },
    {
        name: "TRX ID",
        options: { filter: false },
    },
    {
        name: "Patient ID",
        options: { filter: false },
    },
    {
        name: "Service",
    },
    {
        name: "Quantity",
        options: { filter: false },
    },
    {
        name: "Cost",
        options: { filter: false },
    },
    {
        name: "Hospital",
    },
    {
        name: "Date",
        options: { filter: false },
    },
    {
        name: "Attendant",
    },
    {
        name: "Service Type",
        options: { display: false },
    },
    {
        name: "Distributor",
        options: { display: false },
    },
    {
        name: "Manufacturer",
        options: { display: false },
    },
]