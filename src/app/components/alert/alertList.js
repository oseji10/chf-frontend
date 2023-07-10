import { createRef, useEffect, useState } from 'react';
import alertStyles from './alert.module.scss';
import AlertItem from './alertItem';

const AlertList = ({alerts}) => {

    return <div className={alertStyles.alertList}>
        {alerts.map((alert, index) => <AlertItem  key={index} alert={alert} />)}
    </div>
}

export default AlertList;