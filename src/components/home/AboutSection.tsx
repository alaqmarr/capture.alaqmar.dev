import styles from "./AboutSection.module.css";
import { CameraIcon } from "@/components/icons";

export function AboutSection() {
    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.iconWrapper}>
                    <CameraIcon className={styles.icon} />
                </div>

                <h2 className={styles.title}>
                    <span className={styles.titleSmall}>About</span>
                    <span className={styles.titleMain}>The Journey</span>
                </h2>

                <div className={styles.content}>
                    <p className={styles.paragraph}>
                        Hello, I&apos;m <strong>AL AQMAR</strong> — a passionate learner and
                        photographer who believes that every frame tells a story worth preserving.
                    </p>

                    <p className={styles.paragraph}>
                        My journey with photography began as a curiosity and has evolved into
                        a continuous pursuit of capturing authentic moments. I approach each
                        shoot not as an expert, but as a <em>student of light and emotion</em>,
                        always eager to learn something new.
                    </p>

                    <p className={styles.highlight}>
                        &ldquo;I am a learner, and I keep learning every day.&rdquo;
                    </p>

                    <p className={styles.paragraph}>
                        This philosophy drives everything I do. Whether it&apos;s an intimate
                        gathering or a grand celebration, I bring the same dedication,
                        curiosity, and respect for the moments you trust me to capture.
                    </p>
                </div>

                <div className={styles.stats}>
                    <div className={styles.stat}>
                        <span className={styles.statNumber}>∞</span>
                        <span className={styles.statLabel}>Moments to Learn</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statNumber}>1</span>
                        <span className={styles.statLabel}>Passion</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statNumber}>365</span>
                        <span className={styles.statLabel}>Days of Growth</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
