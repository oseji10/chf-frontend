import styles from './title.module.scss';

const Title = ({children, text, className, ...rest}) => {
    return <h1 className={[styles.title, className].join(' ')} {...rest}>{text}{children}</h1>
}

export default Title;