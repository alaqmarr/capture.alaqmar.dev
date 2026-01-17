import styles from "./Loading.module.css";

export default function Loading() {
    return (
        <div className={styles.loadingScreen}>
            <div className={styles.loadingContent}>
                <div className={styles.logoContainer}>
                    <span className={styles.logoText}>AL</span>
                    <span className={styles.logoDot}></span>
                    <span className={styles.logoText}>AQMAR</span>
                </div>
                <div className={styles.loadingBar}>
                    <div className={styles.loadingProgress}></div>
                </div>
                <p className={styles.loadingText}>Loading moments...</p>
            </div>
        </div>
    );
}
