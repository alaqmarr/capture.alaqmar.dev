import Link from "next/link";
import styles from "./HeroSection.module.css";
import { ArrowRightIcon } from "@/components/icons";

export function HeroSection() {
    return (
        <section className={styles.hero}>
            <div className={styles.background}>
                <div className={styles.gradient1}></div>
                <div className={styles.gradient2}></div>
                <div className={styles.noiseOverlay}></div>
            </div>

            <div className={styles.content}>
                <div className={styles.badge}>
                    <span className={styles.badgeDot}></span>
                    <span>Available for projects</span>
                </div>

                <h1 className={styles.title}>
                    <span className={styles.titleLine}>AL</span>
                    <span className={styles.titleAccent}>AQMAR</span>
                </h1>

                <p className={styles.subtitle}>PHOTOGRAPHY</p>

                <div className={styles.taglineWrapper}>
                    <p className={styles.tagline}>
                        <span className={styles.taglineText}>
                            A passionate learner, capturing moments through the lens.
                        </span>
                    </p>
                    <p className={styles.taglineSecondary}>
                        Every day is an opportunity to grow and create.
                    </p>
                </div>

                <div className={styles.actions}>
                    <Link href="/gallery" className={styles.primaryBtn}>
                        <span>View Gallery</span>
                        <ArrowRightIcon className={styles.btnIcon} />
                    </Link>
                    <Link href="/contact" className={styles.secondaryBtn}>
                        Get in Touch
                    </Link>
                </div>
            </div>

            <div className={styles.scrollIndicator}>
                <span className={styles.scrollText}>Scroll</span>
                <div className={styles.scrollLine}></div>
            </div>
        </section>
    );
}
