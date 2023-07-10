import styles from './toggle-switch.module.scss';

const ToggleSwitch = ({active, onSwitch = () => null, ...rest}) => {
    return <div {...rest} class={[styles.switch_container, active ? styles.active : null].join(' ')}>
    <div onClick={onSwitch} class={styles.switch_toggler}></div>
</div>
}

export default ToggleSwitch;