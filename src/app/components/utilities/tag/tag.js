import styles from './tag.module.scss';

const Tag = ({text, variant = '', ...rest}) => {
    return <span {...rest} className={[styles.tag, styles[variant.toLowerCase()]].join(' ')}>{text}</span>
}

export default Tag;