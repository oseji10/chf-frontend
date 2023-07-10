import React from "react";

const ConditionalComponent = ({ condition, children }) => {
    if (!condition) return null;

    return <>{children}</>
}

export default ConditionalComponent;