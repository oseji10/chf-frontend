import { APPROVED, PENDING, RECOMMENDED } from "./constant.util";

export const formatName = user => `${user?.last_name} ${user?.other_names ?? ''} ${user?.first_name} `;

export const renderMaskedText = (text, condition) => {
    if (condition) {
        return text
    }

    return "*******"
}

export const getStatusText = (application) => {
    if (application.status.toUpperCase() === APPROVED) return application.status;
    if (application.patient && application.patient.cmd_reviewed_on && !(application.status.toLowerCase() === PENDING.toLowerCase())) return RECOMMENDED
    return application.status;
}

export const stringOrAlternateString = (string, alternateString = '') => {
    if (!string || string === '') return alternateString;
    return string;
}

export const printDataKeyOrAlternateString = (data, key, alternateString = '') => {
    if (!data || undefined === data || data === null) return alternateString;

    return data[key];
}