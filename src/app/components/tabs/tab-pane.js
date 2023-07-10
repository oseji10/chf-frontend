import React from 'react';
import { CSSTransition } from 'react-transition-group';
import styles from './tab.module.scss';

const TabPane = ({children, active, className}) => {
    return <CSSTransition
                in={active}
                timeout={300}
                // className='active'
                unmountOnExit
                classNames={styles.tab_pane}
            >
        <div className={[styles.tab_pane, active ? styles.active : null].join(' ')}>
            {children}
        </div>
    </CSSTransition>
}

export default TabPane;