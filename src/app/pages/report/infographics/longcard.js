import styles from './infographics.module.scss'

const LongCard = ({children}) => {
    return <div className={styles.long_card}>
        {children}
    </div>
}


export default LongCard;
