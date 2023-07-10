import styles from './pageNumber.module.scss';
import {Link} from 'react-router-dom';
import Button from '../button';

function PageNumber({pageNumber, previousPage, nextPage}){
    return (
        <div className={styles.pageNumber}>
            {previousPage && <Link className={styles.next} to={previousPage}><Button
                btnClass={"btn btn-success"}
                type={"button"}
                value="&larr;"
              /></Link>}
            <span>Page {pageNumber}</span>
            {nextPage && <Link className={styles.previous} to={nextPage}><Button
                btnClass={"btn btn-success"}
                type={"button"}
                value="&rarr;"
              /></Link>}
        </div>
    );
}

export default PageNumber;