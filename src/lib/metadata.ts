import { Metadata } from "next";

interface MetadataProps {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
}

const SITE_CONFIG = {
  name: "AL AQMAR Photography",
  title: "AL AQMAR | Photography Portfolio",
  description:
    "A passionate learner capturing moments through the lens. Explore stunning event photography and visual stories.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://alaqmar.com",
  ogImage: "/images/og-default.jpg",
  twitterHandle: "@alaqmarr_",
};

export function constructMetadata({
  title,
  description = SITE_CONFIG.description,
  image = SITE_CONFIG.ogImage,
  noIndex = false,
}: MetadataProps = {}): Metadata {
  return {
    title: title
      ? {
          default: title,
          template: `%s | ${SITE_CONFIG.name}`,
        }
      : SITE_CONFIG.title,
    description,
    openGraph: {
      title: title ? `${title} | ${SITE_CONFIG.name}` : SITE_CONFIG.title,
      description,
      url: SITE_CONFIG.url,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title || SITE_CONFIG.name,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: title ? `${title} | ${SITE_CONFIG.name}` : SITE_CONFIG.title,
      description,
      images: [image],
      creator: SITE_CONFIG.twitterHandle,
    },
    icons: {
      icon: "/logo.png",
      shortcut: "/logo.png",
      apple: "/logo.png",
    },
    metadataBase: new URL(SITE_CONFIG.url),
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
      },
    },
  };
}
