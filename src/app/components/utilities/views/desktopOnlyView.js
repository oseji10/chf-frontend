import styles from './views.module.scss';
const DesktopOnlyView = ({children}) => {
    return <div className={styles.desktopOnly}>
        {children}
    </div>
}

export default DesktopOnlyView;