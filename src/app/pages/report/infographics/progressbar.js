import React, { useEffect } from 'react'
import styles from './infographics.module.scss'
import gsap from 'gsap'
import { useRef } from 'react'
export default function Progressbar({progressType, width, title,tipText}) {
    useEffect(() => {
        gsap.from(progress.current, 1.5, {
            width: 0,
            stagger: .4,
            ease: 'power4'
        })
    },[])

    const progress = useRef(null)
    return (
        <div className={[styles.progressbar, styles[progressType]].join(' ')}>
        <span className={styles.title}>{title}</span>
        <div className={styles.bar}>
            <span className={styles.progress} ref={progress} style={{width:  width + '%'}}></span>
            <span className={styles.percentage}>{width}%</span>
            <span className={styles.tip}>{tipText}</span>
        </div>
    </div>
    )
}
