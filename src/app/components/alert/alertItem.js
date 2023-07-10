import alertStyles from './alert.module.scss';
import gsap from 'gsap';
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { dismissAlert } from '../../redux/alertActions';

const AlertItem = ({alert}) => {
    const alertRef = useRef(null)

    useEffect(() => {
        const tl = gsap.timeline();

        tl.from(alertRef.current, {
            x: 200,
            duration: .5,
        })
        .to(alertRef.current, .2,{
            x: 2000,
        }, alert.timeout | 9)
    },[])

    const dispatch = useDispatch();
    

    return (<span
            onClick={() => dispatch(dismissAlert(alert.id))}
            const ref={alertRef} className={[alertStyles.alertListItem, alertStyles[alert.variant] ].join(' ')}> {alert.alert} 
    </span>)
}

export default AlertItem;