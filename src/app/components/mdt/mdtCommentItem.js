import { timestampToRegularTime } from '../../utils/date.util';
import styles from './mdtcommentstyles.module.scss';
const MDTCommentItem = ({comment, onCommentClick}) => {
    return <div className={styles.commentItem} onClick={() => onCommentClick(comment)}>
        <h3>{comment.mdt_user.first_name} {comment.mdt_user.last_name}</h3>
        <span> <strong>Care Date: </strong> {timestampToRegularTime(comment.visitation_date)} </span>
        <span> <strong>Comment Date: </strong> {timestampToRegularTime(comment.created_at)} </span>
    </div>
}

export default MDTCommentItem;