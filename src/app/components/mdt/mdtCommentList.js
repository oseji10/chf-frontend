import MDTCommentItem from './mdtCommentItem';
import styles from './mdtcommentstyles.module.scss';
const MDTCommentList = ({comments, onCommentClick}) => {
    return <div className={styles.commentList}>
        {comments.map((comment, index) => <MDTCommentItem onCommentClick={onCommentClick} key={index} comment={comment} />)}

    </div>
}

export default MDTCommentList;