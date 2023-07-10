import styles from './badge.module.scss';

const Badge = ({text, variant, ...rest}) => {
    return <span {...rest} className={[styles.badge, styles[variant.toLowerCase()]].join(' ')}>{text}</span>
}

export default Badge;