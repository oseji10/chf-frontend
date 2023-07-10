import gsap from 'gsap/gsap-core'
import React, { useRef } from 'react'
import { useEffect } from 'react'
import styles from './modal.module.scss'

export default function Modal({children, fullscreen}) {
    const modal = useRef(null)
    useEffect(()=>{
        gsap.from(modal.current,.3,{
            y: -100,
            // transform: 'scale(0)',
            ease: 'power3'
        })
    },[])
    return (
        <div ref={modal} className={styles.modal}>
            <div className={[styles.modal_content, fullscreen ? styles.fullscreen : ''].join(' ')}>
             {children}
            </div>
        </div>
    )
}
