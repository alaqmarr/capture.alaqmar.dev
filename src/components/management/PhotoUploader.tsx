"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { UploadIcon, XIcon, CheckIcon } from "@/components/icons";
import styles from "./PhotoUploader.module.css";

interface PhotoUploaderProps {
    eventId: string;
    storageProvider?: string;
    onComplete: () => void;
}

interface UploadFile {
    file: File;
    preview: string;
    status: "pending" | "uploading" | "done" | "error";
    progress: number;
}

interface StorageUsage {
    provider: string;
    used: number;
    limit: number;
    remaining: number;
    percentUsed: number;
    usedFormatted: string;
    remainingFormatted: string;
    limitFormatted: string;
    count: number;
}

export function PhotoUploader({
    eventId,
    storageProvider = "AWS_S3",
    onComplete,
}: PhotoUploaderProps) {
    const [files, setFiles] = useState<UploadFile[]>([]);
    const [uploading, setUploading] = useState(false);
    const [storageUsage, setStorageUsage] = useState<StorageUsage[]>([]);
    const [loadingUsage, setLoadingUsage] = useState(true);
    const inputRef = useRef<HTMLInputElement>(null);

    // Fetch storage usage on mount
    useEffect(() => {
        fetchStorageUsage();
    }, []);

    const fetchStorageUsage = async () => {
        try {
            const res = await fetch("/api/storage/usage");
            const data = await res.json();
            setStorageUsage(data);
        } catch (err) {
            console.error("Failed to fetch storage usage:", err);
        } finally {
            setLoadingUsage(false);
        }
    };

    // Calculate total size of selected files
    const totalSelectedSize = files.reduce((acc, f) => acc + f.file.size, 0);

    // Get current provider usage
    const currentProviderUsage = storageUsage.find(
        (s) => s.provider === storageProvider
    );

    // Check if upload would exceed limit
    const wouldExceedLimit =
        currentProviderUsage &&
        totalSelectedSize + currentProviderUsage.used > currentProviderUsage.limit;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        const imageFiles = selectedFiles.filter((f) => f.type.startsWith("image/"));

        const newFiles: UploadFile[] = imageFiles.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
            status: "pending",
            progress: 0,
        }));

        setFiles((prev) => [...prev, ...newFiles]);
    };

    const removeFile = (index: number) => {
        setFiles((prev) => {
            const updated = [...prev];
            URL.revokeObjectURL(updated[index].preview);
            updated.splice(index, 1);
            return updated;
        });
    };

    const uploadFiles = async () => {
        if (files.length === 0 || wouldExceedLimit) return;

        setUploading(true);

        try {
            // Get presigned URLs for all files
            const presignRes = await fetch("/api/photos/presigned-url", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    files: files.map((f) => ({
                        filename: f.file.name,
                        contentType: f.file.type,
                    })),
                    storageProvider,
                }),
            });

            if (!presignRes.ok) throw new Error("Failed to get upload URLs");

            const { urls } = await presignRes.json();

            // Upload each file to storage
            const uploadedPhotos: Array<{
                eventId: string;
                url: string;
                storageKey: string;
                storageProvider: string;
            }> = [];

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const urlData = urls[i];

                setFiles((prev) =>
                    prev.map((f, idx) =>
                        idx === i ? { ...f, status: "uploading", progress: 50 } : f
                    )
                );

                try {
                    // Upload to storage
                    const uploadRes = await fetch(urlData.uploadUrl, {
                        method: "PUT",
                        body: file.file,
                        headers: {
                            "Content-Type": file.file.type,
                        },
                    });

                    if (!uploadRes.ok) throw new Error();

                    uploadedPhotos.push({
                        eventId,
                        url: urlData.publicUrl,
                        storageKey: urlData.key,
                        storageProvider,
                    });

                    setFiles((prev) =>
                        prev.map((f, idx) =>
                            idx === i ? { ...f, status: "done", progress: 100 } : f
                        )
                    );
                } catch {
                    setFiles((prev) =>
                        prev.map((f, idx) =>
                            idx === i ? { ...f, status: "error", progress: 0 } : f
                        )
                    );
                }
            }

            // Save photo records to database
            if (uploadedPhotos.length > 0) {
                await fetch("/api/photos", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ photos: uploadedPhotos }),
                });
            }

            // Clear successful uploads and refresh usage
            setTimeout(() => {
                setFiles((prev) => prev.filter((f) => f.status !== "done"));
                fetchStorageUsage();
                onComplete();
            }, 1000);
        } catch (err) {
            console.error("Upload error:", err);
        } finally {
            setUploading(false);
        }
    };

    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    return (
        <div className={styles.container}>
            {/* Storage Usage Display */}
            <div className={styles.storageSection}>
                <h3 className={styles.storageSectionTitle}>Storage Usage</h3>
                {loadingUsage ? (
                    <p className={styles.loadingText}>Loading storage info...</p>
                ) : (
                    <div className={styles.storageGrid}>
                        {storageUsage.map((storage) => (
                            <div
                                key={storage.provider}
                                className={`${styles.storageCard} ${storage.provider === storageProvider ? styles.activeProvider : ""
                                    }`}
                            >
                                <div className={styles.storageHeader}>
                                    <span className={styles.providerName}>
                                        {storage.provider.replace("_", " ")}
                                    </span>
                                    <span className={styles.photoCount}>{storage.count} photos</span>
                                </div>
                                <div className={styles.progressBar}>
                                    <div
                                        className={styles.progressFill}
                                        style={{
                                            width: `${Math.min(storage.percentUsed, 100)}%`,
                                            backgroundColor:
                                                storage.percentUsed > 80
                                                    ? "#ef4444"
                                                    : storage.percentUsed > 50
                                                        ? "#f59e0b"
                                                        : "#22c55e",
                                        }}
                                    />
                                </div>
                                <div className={styles.storageStats}>
                                    <span>{storage.usedFormatted} used</span>
                                    <span>{storage.remainingFormatted} free</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Selected files size */}
            {files.length > 0 && (
                <div className={styles.uploadInfo}>
                    <div className={styles.uploadSizeRow}>
                        <span>Selected: {files.length} files</span>
                        <span className={styles.uploadSize}>
                            Total size: <strong>{formatBytes(totalSelectedSize)}</strong>
                        </span>
                    </div>
                    {currentProviderUsage && (
                        <div className={styles.spaceCheck}>
                            {wouldExceedLimit ? (
                                <span className={styles.exceededWarning}>
                                    ⚠️ Exceeds available space! Need {formatBytes(totalSelectedSize)},
                                    only {currentProviderUsage.remainingFormatted} available.
                                </span>
                            ) : (
                                <span className={styles.spaceOk}>
                                    ✓ Space available ({currentProviderUsage.remainingFormatted} free after upload:
                                    {formatBytes(currentProviderUsage.remaining - totalSelectedSize)})
                                </span>
                            )}
                        </div>
                    )}
                </div>
            )}

            <div
                className={styles.dropzone}
                onClick={() => inputRef.current?.click()}
            >
                <UploadIcon className={styles.dropzoneIcon} />
                <p className={styles.dropzoneText}>
                    Click to select photos or drag and drop
                </p>
                <p className={styles.dropzoneHint}>
                    Supports JPG, PNG, WebP, GIF
                </p>
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className={styles.hiddenInput}
                />
            </div>

            {files.length > 0 && (
                <>
                    <div className={styles.preview}>
                        {files.map((file, index) => (
                            <div key={index} className={styles.previewItem}>
                                <img
                                    src={file.preview}
                                    alt={`Preview ${index + 1}`}
                                    className={styles.previewImage}
                                />
                                <span className={styles.fileSize}>
                                    {formatBytes(file.file.size)}
                                </span>
                                <div className={styles.previewOverlay}>
                                    {file.status === "pending" && (
                                        <button
                                            className={styles.removeBtn}
                                            onClick={() => removeFile(index)}
                                        >
                                            <XIcon />
                                        </button>
                                    )}
                                    {file.status === "uploading" && (
                                        <div className={styles.progressRing}>
                                            <span>{file.progress}%</span>
                                        </div>
                                    )}
                                    {file.status === "done" && (
                                        <div className={styles.successIcon}>
                                            <CheckIcon />
                                        </div>
                                    )}
                                    {file.status === "error" && (
                                        <div className={styles.errorIcon}>!</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.actions}>
                        <p className={styles.fileCount}>{files.length} file(s) selected</p>
                        <Button
                            onClick={uploadFiles}
                            loading={uploading}
                            disabled={files.every((f) => f.status === "done") || wouldExceedLimit}
                        >
                            {wouldExceedLimit ? "Exceeds Limit" : "Upload All"}
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}
