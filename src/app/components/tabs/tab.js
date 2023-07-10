import React, { useState } from 'react';
import TabHeader from './tab-header';
import styles from './tab.module.scss'

const Tab = ({children, links, type="horizontal", linkActions}) => {
    const [activeIndex, setActiveIndex] = useState(0);

    const TabPanes = () =>
    React.Children.map(children, (child, index) =>
      React.cloneElement(child, {
        active: activeIndex === index
      })
    );

    const handleLinkClick = index => {
      setActiveIndex(index)
      if(linkActions[index]) linkActions[index]();
    }

    return <div className={type==="vertical"?styles.tab_vertical:styles.tab}>
        <TabHeader links={links} onLinkClick={handleLinkClick} activeIndex={activeIndex} />
        <div className={styles.tab_content}>
            <TabPanes />
        </div>
    </div>
} 

export default Tab;