import React from 'react';
import TabLink from './tab-link';
import styles from './tab.module.scss';

const TabHeader = ({links, onLinkClick, activeIndex}) => {
    return <div className={styles.tab_nav}>
        {links.map((link, index) => <TabLink active={activeIndex===index} onLinkClick={() => onLinkClick(index)} key={index} link={link} />)}
    </div>
}

export default TabHeader;