import React from 'react'
import styles from './tab.module.scss';

const TabLink = ({link, onLinkClick, active}) => <span onClick={onLinkClick} className={[styles.tab_link, active ? styles.active : null].join(' ')}>{link}</span>

export default TabLink;