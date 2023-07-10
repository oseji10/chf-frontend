import styles from './views.module.scss'
const MobileOnlyView = ({children}) => {
    return <div className={styles.mobileOnly}>
        {children}
    </div>
}

export default MobileOnlyView;