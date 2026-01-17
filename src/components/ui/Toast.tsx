import styles from "./Toast.module.css";
import { CheckIcon, XIcon } from "@/components/icons";

type ToastType = "success" | "error";

interface ToastProps {
    message: string;
    type: ToastType;
    onClose?: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
    return (
        <div className={`${styles.toast} ${styles[type]}`} role="alert">
            <span className={styles.icon}>
                {type === "success" ? (
                    <CheckIcon className={styles.iconSvg} />
                ) : (
                    <XIcon className={styles.iconSvg} />
                )}
            </span>
            <span className={styles.message}>{message}</span>
            {onClose && (
                <button onClick={onClose} className={styles.closeBtn} aria-label="Close">
                    <XIcon className={styles.closeIcon} />
                </button>
            )}
        </div>
    );
}
