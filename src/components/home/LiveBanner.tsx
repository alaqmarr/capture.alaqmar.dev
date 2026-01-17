import Link from "next/link";
import styles from "./LiveBanner.module.css";
import { ArrowRightIcon } from "@/components/icons";

interface LiveBannerProps {
    count: number;
}

export function LiveBanner({ count }: LiveBannerProps) {
    return (
        <div className={styles.banner}>
            <Link href="/live" className={styles.bannerLink}>
                <div className={styles.left}>
                    <span className={styles.liveDot}></span>
                    <span className={styles.liveText}>LIVE NOW</span>
                </div>
                <span className={styles.message}>
                    {count === 1
                        ? "An event is being covered live"
                        : `${count} events are being covered live`}
                </span>
                <div className={styles.right}>
                    <span>Watch Now</span>
                    <ArrowRightIcon className={styles.arrowIcon} />
                </div>
            </Link>
        </div>
    );
}
