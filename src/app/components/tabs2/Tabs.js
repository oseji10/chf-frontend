import { useState, useEffect } from "react";
import Tab from "./Tab";
import styles from "./tabs.module.scss";

const Tabs = ({ active, children }) => {
  const [activeTab, setActiveTab] = useState();

  useEffect(() => {
    setActiveTab(active);
  }, []);

  const onClickTabItem = (tab) => {
    setActiveTab(tab);
  };
  return (
    <div className={styles.tabs}>
      <ul className={styles.tab_nav}>
        {children.map((child) => {
          const { label } = child.props;

          return (
            <Tab
              activeTab={activeTab}
              key={label}
              label={label}
              onClick={onClickTabItem}
            />
          );
        })}
      </ul>
      <div className={styles.tab_content}>
        {children.map((child) => {
          if (child.props.label !== activeTab) return undefined;
          return child.props.children;
        })}
      </div>
    </div>
  );
};

export default Tabs;
