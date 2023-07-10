import styles from './pageTitle.module.scss'
const PageTitle = ({title, icon}) => {
    return <h4 className={styles.title}> <span ><i className={icon || `fa fa-info-circle`}></i></span> {title} </h4>
}

export default PageTitle;