import styles from './collapse.module.scss'

const Collapse = ({children, isOpen}) => {
    return <div className={[styles.collapse, isOpen ? styles.active : ''].join(' ')}>
        {children}
    </div>
}

export default Collapse;