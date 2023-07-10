import styles from './spinner.module.scss'

const PageSpinner = (props) => {
    return (
        <div className={styles.page_spinner}>
        <div className={styles.circle_progress}>
            <svg>
                <g>
                    <circle cy='50' cx='50' r='40'></circle>
                </g>
            </svg>
        </div>
    </div>
    )
}

export default PageSpinner;