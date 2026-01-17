import { ButtonHTMLAttributes, forwardRef } from "react";
import styles from "./Button.module.css";
import { LoaderIcon } from "@/components/icons";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            children,
            variant = "primary",
            size = "md",
            loading = false,
            fullWidth = false,
            disabled,
            className = "",
            ...props
        },
        ref
    ) => {
        const classNames = [
            styles.button,
            styles[variant],
            styles[size],
            fullWidth ? styles.fullWidth : "",
            loading ? styles.loading : "",
            className,
        ]
            .filter(Boolean)
            .join(" ");

        return (
            <button
                ref={ref}
                className={classNames}
                disabled={disabled || loading}
                {...props}
            >
                {loading && (
                    <span className={styles.loader}>
                        <LoaderIcon className={styles.loaderIcon} />
                    </span>
                )}
                <span className={loading ? styles.textHidden : styles.text}>
                    {children}
                </span>
            </button>
        );
    }
);

Button.displayName = "Button";
