"use client";

import NextTopLoader from "nextjs-toploader";

export function TopLoader() {
    return (
        <NextTopLoader
            color="#c9a962"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow="0 0 10px #c9a962, 0 0 5px #c9a962"
        />
    );
}
