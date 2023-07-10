function getChfBackendHost() {

  if (process.env.REACT_APP_NODE_ENV === "development") {
    return process.env.REACT_APP_CHF_BACKEND_DEV_HOST;
  }

  return process.env.REACT_APP_CHF_BACKEND_HOST;
}

function getCapImasBackendHost() {
  if (process.env.REACT_APP_NODE_ENV === "development") {
    return process.env.REACT_APP_CAP_IMAS_BACKEND_DEV_HOST;
  }

  return process.env.REACT_APP_CAP_IMAS_BACKEND_HOST;
}

export const CAP_IMAS_BACKEND_HOST = getCapImasBackendHost();
export const CHF_BACKEND_HOST = getChfBackendHost();
