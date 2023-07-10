import classes from './card.module.scss';

function Card(props){
    return <div className={`${classes.card} ${props.className?props.className:''}`}>{props.children}</div>
}

export default Card;