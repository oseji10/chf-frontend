import styles from "./tabs.module.scss";
const Tab = ({ activeTab, label, onClick }) => {
    const handleClick = () => {
        onClick(label);
      }
    
  return (
    <li
      className={
        activeTab === label ? `${styles.tab_link} ${styles.active}` : `${styles.tab_link}`
      }
      onClick={handleClick}
    >
      {label}
    </li>
  );
};

export default Tab;
