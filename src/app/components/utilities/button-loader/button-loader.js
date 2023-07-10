import styles from './button-loader.module.scss';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const ButtonLoader = ({}) => {
    return <span className={styles.button_loader}>
        <AiOutlineLoading3Quarters />
    </span>
}

export default ButtonLoader;