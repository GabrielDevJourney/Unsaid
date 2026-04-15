import {
    Button,
    Column,
    Container,
    Hr,
    Img,
    Link,
    Row,
    Section,
    Text,
} from "@react-email/components";
import type { CSSProperties, ReactNode } from "react";
import {
    PATTERN_TYPES,
    type PatternTypeCode,
} from "@/lib/constants/pattern-types";

const SITE_URL = "https://byunsaid.com";
const ASSETS_BASE_URL = process.env.EMAIL_ASSETS_BASE_URL ?? SITE_URL;
const INSTAGRAM_URL = `https://www.instagram.com/by.unsaid/`;
const LINKEDIN_URL = `https://www.linkedin.com/company/byunsaid`;
const SHARE_URL = SITE_URL;
const LOGO_URL = `${ASSETS_BASE_URL}/emails/logo-emails.png`;
const SHARE_ICON_URL = `${ASSETS_BASE_URL}/emails/share-04.png`;
const INSTAGRAM_ICON_URL = `${ASSETS_BASE_URL}/emails/instagram-icon.png`;
const LINKEDIN_ICON_URL = `${ASSETS_BASE_URL}/emails/linkedin-icon.png`;
const HERO_BG_URL = `${ASSETS_BASE_URL}/emails/hero-bg.jpg`;
const EMAIL_WIDTH = 600;

const palette = {
    pageBg: "#f5f4f1",
    shellBg: "#ffffff",
    shellBorder: "#d7d2cb",
    shellText: "#4a5565",
    mutedText: "#a29d94",
    heroText: "#f7f4ef",
    panelBorder: "#e4dfd7",
    panelBg: "#faf9f7",
    dottedBg: "#f7f5f2",
    divider: "#e7e2db",
    quoteText: "#7e7972",
    ctaRing: "#d8d3cb",
    ctaBase: "#8ea0bb",
    ctaEdge: "#ee8a3a",
    iconBorder: "#9b826e",
    iconDot: "#C2713F",
    iconDotRing: "rgba(194, 113, 63, 0.3)",
    iconBg: "#4d4a58",
    iconFg: "#f2efea",
} as const;

const fontStacks = {
    sans: 'Satoshi, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    serif: '"Libre Baskerville", Georgia, serif',
};

const shellPaddingX = 40;

const mainStyle: CSSProperties = {
    backgroundColor: palette.pageBg,
    margin: 0,
    padding: "28px 12px",
    fontFamily: fontStacks.sans,
};

const containerStyle: CSSProperties = {
    width: "100%",
    maxWidth: `${EMAIL_WIDTH}px`,
    margin: "0 auto",
    backgroundColor: palette.shellBg,
    border: `1px solid ${palette.shellBorder}`,
    borderRadius: "24px",
    overflow: "hidden",
};

const shellInnerStyle: CSSProperties = {
    padding: "24px 20px 18px",
};

const logoWrapStyle: CSSProperties = {
    textAlign: "center",
    paddingBottom: "18px",
};

const innerCardStyle: CSSProperties = {
    backgroundColor: palette.panelBg,
    border: `1px solid ${palette.panelBorder}`,
    borderRadius: "22px",
    overflow: "hidden",
};

const heroStyle: CSSProperties = {
    backgroundColor: "#515b6c",
    backgroundImage: `url(${HERO_BG_URL})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    padding: "34px 24px 30px",
    textAlign: "center",
};

const contentSectionStyle: CSSProperties = {
    padding: "0",
};

const footerActionsStyle: CSSProperties = {
    textAlign: "center",
    paddingTop: "22px",
    paddingBottom: "18px",
};

const footerDividerStyle: CSSProperties = {
    borderColor: palette.divider,
    margin: "0",
};

const legalStyle: CSSProperties = {
    color: palette.mutedText,
    fontSize: "14px",
    lineHeight: "1.6",
    textAlign: "center",
    margin: 0,
    padding: "20px 18px 26px",
};

const socialCircleStyle: CSSProperties = {
    display: "inline-block",
    width: "42px",
    height: "42px",
    lineHeight: "42px",
    borderRadius: "999px",
    border: `1px solid ${palette.shellBorder}`,
    backgroundColor: "#F5F5F5",
    textDecoration: "none",
    textAlign: "center",
    marginRight: "8px",
    verticalAlign: "middle",
};

const sharePillStyle: CSSProperties = {
    display: "inline-block",
    borderRadius: "999px",
    border: `1px solid ${palette.shellBorder}`,
    backgroundColor: "#F5F5F5",
    color: palette.mutedText,
    textDecoration: "none",
    fontSize: "15px",
    lineHeight: "42px",
    height: "42px",
    padding: "0 18px",
    fontFamily: fontStacks.sans,
    fontWeight: 700,
};

export const emailStyles = {
    palette,
    fontStacks,
    mainStyle,
    containerStyle,
    shellInnerStyle,
    innerCardStyle,
    heroStyle,
    contentSectionStyle,
    footerActionsStyle,
    footerDividerStyle,
    legalStyle,
    shellPaddingX,
};

export const editorialHeadingStyle: CSSProperties = {
    color: palette.heroText,
    fontSize: "36px",
    lineHeight: "1.2",
    fontStyle: "italic",
    fontWeight: 400,
    fontFamily: fontStacks.serif,
    textAlign: "center",
    margin: "0",
};

export const heroBodyStyle: CSSProperties = {
    color: palette.heroText,
    fontSize: "15px",
    lineHeight: "1.65",
    textAlign: "center",
    margin: "14px auto 0",
    maxWidth: "460px",
};

export const sectionDividerStyle: CSSProperties = {
    borderColor: palette.divider,
    margin: "0",
};

export const quoteSectionStyle: CSSProperties = {
    padding: "24px 24px 22px",
    textAlign: "center",
};

export const editorialQuoteStyle: CSSProperties = {
    color: palette.quoteText,
    fontSize: "17px",
    lineHeight: "1.6",
    fontStyle: "italic",
    fontWeight: 400,
    fontFamily: fontStacks.serif,
    textAlign: "center",
    margin: 0,
};

export const bodySectionStyle: CSSProperties = {
    padding: "20px 18px 24px",
};

export const helperTextStyle: CSSProperties = {
    color: palette.mutedText,
    fontSize: "12px",
    lineHeight: "1.6",
    textAlign: "center",
    margin: "12px 0 0",
};

export const cardStyle: CSSProperties = {
    backgroundColor: "#ffffff",
    border: `1px solid ${palette.panelBorder}`,
    borderRadius: "16px",
};

export const subtlePanelStyle: CSSProperties = {
    backgroundColor: palette.dottedBg,
    border: `1px solid ${palette.panelBorder}`,
    borderRadius: "16px",
};

export const sectionLabelStyle: CSSProperties = {
    color: palette.mutedText,
    fontSize: "15px",
    lineHeight: "1.4",
    margin: "0 0 14px",
};

export const bodyCopyStyle: CSSProperties = {
    color: palette.shellText,
    fontSize: "15px",
    lineHeight: "1.6",
    margin: 0,
};

export const bodyStrongStyle: CSSProperties = {
    color: "#3d4e63",
    fontWeight: 700,
};

export const contentTitleStyle: CSSProperties = {
    color: "#47586e",
    fontSize: "18px",
    lineHeight: "1.4",
    fontWeight: 700,
    margin: "0 0 12px",
};

export const statValueStyle: CSSProperties = {
    color: "#7b7b7b",
    fontSize: "40px",
    lineHeight: "1",
    fontStyle: "italic",
    fontWeight: 400,
    fontFamily: fontStacks.serif,
    fontVariantNumeric: "lining-nums tabular-nums",
    fontFeatureSettings: '"lnum" 1, "tnum" 1',
    letterSpacing: "-0.01em",
    display: "block",
    textAlign: "center",
    margin: 0,
};

export const statLabelStyle: CSSProperties = {
    color: "#b4aea5",
    fontSize: "13px",
    lineHeight: "1.25",
    display: "block",
    textAlign: "left",
    margin: 0,
};

export const primaryButtonStyle: CSSProperties = {
    backgroundColor: palette.ctaBase,
    backgroundImage:
        "radial-gradient(circle at 82% 190%, rgba(247,107,21,0.82) 0%, rgba(247,107,21,0.48) 34%, rgba(247,107,21,0) 72%)",
    borderRadius: "12px",
    boxShadow: `0 0 0 2px ${palette.ctaRing}`,
    color: "#ffffff",
    display: "inline-block",
    fontSize: "16px",
    fontWeight: 400,
    lineHeight: "48px",
    textAlign: "center",
    textDecoration: "none",
    width: "100%",
    maxWidth: "320px",
};

export const promptRowStyle: CSSProperties = {
    backgroundColor: "#EBEBEB",
    border: `1px solid ${palette.panelBorder}`,
    borderRadius: "14px",
};

export const splitLabelStyle: CSSProperties = {
    color: palette.quoteText,
    fontSize: "15px",
    lineHeight: "1.65",
    margin: 0,
};

export const milestoneBarBgStyle: CSSProperties = {
    backgroundColor: "#d9d9d9",
    borderRadius: "999px",
    height: "10px",
    overflow: "hidden",
};

export const previewPatternTitleStyle: CSSProperties = {
    color: palette.quoteText,
    fontSize: "16px",
    lineHeight: "1.4",
    fontStyle: "italic",
    fontWeight: 400,
    fontFamily: fontStacks.serif,
    margin: 0,
};

export function EmailShell({
    recipientEmail,
    unsubscribeUrl,
    legalKind,
    children,
}: {
    recipientEmail: string;
    unsubscribeUrl: string;
    legalKind: "waitlist" | "account";
    children: ReactNode;
}) {
    return (
        <Container style={containerStyle}>
            <Section style={shellInnerStyle}>
                <Section style={logoWrapStyle}>
                    <Img
                        src={LOGO_URL}
                        width="32"
                        height="32"
                        alt="Unsaid"
                        style={{ display: "block", margin: "0 auto" }}
                    />
                </Section>
                {children}
            </Section>

            <Section style={footerActionsStyle}>
                <Link href={INSTAGRAM_URL} style={socialCircleStyle}>
                    <Img
                        src={INSTAGRAM_ICON_URL}
                        alt="Instagram"
                        width="16"
                        height="16"
                        style={{
                            display: "inline-block",
                            verticalAlign: "middle",
                            width: "16px",
                            height: "16px",
                        }}
                    />
                </Link>
                <Link href={LINKEDIN_URL} style={socialCircleStyle}>
                    <Img
                        src={LINKEDIN_ICON_URL}
                        alt="LinkedIn"
                        width="12"
                        height="12"
                        style={{
                            display: "inline-block",
                            width: "12px",
                            height: "12px",
                        }}
                    />
                </Link>
                <Link href={SHARE_URL} style={sharePillStyle}>
                    <span
                        style={{
                            display: "inline-block",
                            verticalAlign: "middle",
                            marginRight: "8px",
                            lineHeight: 0,
                        }}
                    >
                        <Img
                            src={SHARE_ICON_URL}
                            alt=""
                            width="16"
                            height="16"
                            style={{
                                display: "block",
                                width: "16px",
                                height: "16px",
                            }}
                        />
                    </span>
                    <span style={{ verticalAlign: "middle" }}>
                        Share Unsaid
                    </span>
                </Link>
            </Section>

            <Hr style={footerDividerStyle} />

            <EmailLegal
                recipientEmail={recipientEmail}
                unsubscribeUrl={unsubscribeUrl}
                kind={legalKind}
            />
        </Container>
    );
}

export function EmailInnerCard({ children }: { children: ReactNode }) {
    return <Section style={innerCardStyle}>{children}</Section>;
}

export function EmailHero({
    eyebrow,
    title,
    description,
    icon,
    badge,
    style,
    titleStyle,
    descriptionStyle,
}: {
    eyebrow?: ReactNode;
    title: string;
    description: ReactNode;
    icon?: ReactNode;
    badge?: ReactNode;
    style?: CSSProperties;
    titleStyle?: CSSProperties;
    descriptionStyle?: CSSProperties;
}) {
    return (
        <Section style={{ ...heroStyle, ...style }}>
            {icon ? (
                <Section style={{ paddingBottom: "22px", textAlign: "center" }}>
                    {icon}
                </Section>
            ) : null}
            {eyebrow ? (
                <Text
                    style={{
                        color: palette.heroText,
                        fontSize: "13px",
                        lineHeight: "1.4",
                        margin: "0 0 12px",
                        opacity: 0.9,
                    }}
                >
                    {eyebrow}
                </Text>
            ) : null}
            <Text style={{ ...editorialHeadingStyle, ...titleStyle }}>
                {title}
            </Text>
            <Text style={{ ...heroBodyStyle, ...descriptionStyle }}>
                {description}
            </Text>
            {badge ? (
                <Section style={{ paddingTop: "26px" }}>{badge}</Section>
            ) : null}
        </Section>
    );
}

export function FeatureIcon({
    glyph,
    backgroundColor = palette.iconBg,
    color = palette.iconFg,
    children,
    size = 40,
}: {
    glyph?: string;
    backgroundColor?: string;
    color?: string;
    children?: ReactNode;
    size?: number;
}) {
    return (
        <Section
            style={{
                display: "inline-block",
                position: "relative",
                width: `${size}px`,
                height: `${size}px`,
                margin: "0 auto",
                textAlign: "center",
                lineHeight: 0,
            }}
        >
            <div
                style={{
                    display: "table",
                    width: `${size}px`,
                    height: `${size}px`,
                    borderRadius: "9px",
                    border: `1px solid ${palette.iconBorder}`,
                    backgroundColor,
                    color,
                    fontSize: "18px",
                    textAlign: "center",
                    fontFamily: fontStacks.sans,
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        display: "table-cell",
                        width: `${size}px`,
                        height: `${size}px`,
                        verticalAlign: "middle",
                        textAlign: "center",
                        lineHeight: 0,
                    }}
                >
                    {children ?? glyph}
                </div>
            </div>
            <span
                style={{
                    position: "absolute",
                    left: "-4px",
                    top: "-4px",
                    display: "inline-block",
                    width: "12px",
                    height: "12px",
                    borderRadius: "999px",
                    backgroundColor: palette.iconDot,
                    boxShadow: `0 0 0 3px ${palette.iconDotRing}`,
                    boxSizing: "border-box",
                    zIndex: 2,
                }}
            />
        </Section>
    );
}

export function EmailStatsRow({
    stats,
    backgroundColor = palette.dottedBg,
    topPadding = 16,
}: {
    stats: Array<{ key: string; value: number; label: ReactNode }>;
    backgroundColor?: string;
    topPadding?: number;
}) {
    return (
        <Section
            style={{
                padding: `${topPadding}px 14px 16px`,
                backgroundColor,
            }}
        >
            <Row
                style={{
                    ...cardStyle,
                    overflow: "hidden",
                }}
            >
                {stats.map((stat, index) => (
                    <Column
                        key={stat.key}
                        style={{
                            width: `${100 / stats.length}%`,
                            padding: "0 10px",
                            height: "78px",
                            verticalAlign: "middle",
                            borderLeft:
                                index === 0
                                    ? "none"
                                    : `1px solid ${palette.panelBorder}`,
                        }}
                    >
                        <Row style={{ height: "78px" }}>
                            <Column
                                style={{
                                    width: "42%",
                                    textAlign: "center",
                                    verticalAlign: "middle",
                                }}
                            >
                                <Text style={statValueStyle}>
                                    {String(stat.value).padStart(2, "0")}
                                </Text>
                            </Column>
                            <Column
                                style={{
                                    width: "58%",
                                    verticalAlign: "middle",
                                }}
                            >
                                <Text style={statLabelStyle}>{stat.label}</Text>
                            </Column>
                        </Row>
                    </Column>
                ))}
            </Row>
        </Section>
    );
}

export function PrimaryCta({
    href,
    children,
    style,
}: {
    href: string;
    children: ReactNode;
    style?: CSSProperties;
}) {
    return (
        <Section style={{ textAlign: "center" }}>
            <Button href={href} style={{ ...primaryButtonStyle, ...style }}>
                {children}
            </Button>
        </Section>
    );
}

export function EmailQuote({
    children,
    borderTop = true,
}: {
    children: ReactNode;
    borderTop?: boolean;
}) {
    return (
        <Section style={quoteSectionStyle}>
            {borderTop ? <Hr style={sectionDividerStyle} /> : null}
            <Text
                style={{
                    ...editorialQuoteStyle,
                    paddingTop: borderTop ? "22px" : 0,
                }}
            >
                {children}
            </Text>
        </Section>
    );
}

export function PromptRow({
    dotColor,
    dotRingColor,
    text,
}: {
    dotColor: string;
    dotRingColor: string;
    text: string;
}) {
    return (
        <Section style={{ ...promptRowStyle, marginBottom: "14px" }}>
            <Row>
                <Column
                    style={{
                        width: "34px",
                        padding: "14px 0 14px 14px",
                        verticalAlign: "middle",
                        textAlign: "center",
                    }}
                >
                    <span
                        style={{
                            display: "inline-block",
                            width: "10px",
                            height: "10px",
                            borderRadius: "999px",
                            backgroundColor: dotColor,
                            boxShadow: `0 0 0 3px ${dotRingColor}`,
                        }}
                    />
                </Column>
                <Column
                    style={{
                        padding: "14px 8px 14px 0",
                        verticalAlign: "middle",
                    }}
                >
                    <span
                        style={{
                            display: "block",
                            color: "#6e6a63",
                            fontSize: "14px",
                            lineHeight: "1.5",
                        }}
                    >
                        {text}
                    </span>
                </Column>
                <Column
                    style={{
                        width: "36px",
                        padding: "14px 14px 14px 0",
                        textAlign: "right",
                        verticalAlign: "middle",
                    }}
                >
                    <span
                        style={{
                            color: "#807b72",
                            fontSize: "20px",
                            lineHeight: "1",
                        }}
                    >
                        ›
                    </span>
                </Column>
            </Row>
        </Section>
    );
}

export function BenefitList({
    items,
    backgroundColor = "#ECECEC",
}: {
    items: Array<{ label: string; detail: string }>;
    backgroundColor?: string;
}) {
    return (
        <Section
            style={{
                ...cardStyle,
                backgroundColor,
                padding: "20px 18px",
            }}
        >
            <Text style={contentTitleStyle}>What continues with Pro</Text>
            {items.map((item) => (
                <Row
                    key={item.label}
                    style={{ marginBottom: "10px", verticalAlign: "middle" }}
                >
                    <Column
                        style={{
                            width: "22px",
                            verticalAlign: "middle",
                        }}
                    >
                        <Img
                            src={`${ASSETS_BASE_URL}/emails/check-icon.png`}
                            alt="✓"
                            width="16"
                            height="16"
                            style={{
                                display: "block",
                                width: "16px",
                                height: "16px",
                            }}
                        />
                    </Column>
                    <Column style={{ verticalAlign: "middle" }}>
                        <Text
                            style={{
                                color: "#435063",
                                fontSize: "14px",
                                lineHeight: "1.6",
                                margin: 0,
                            }}
                        >
                            <strong>{item.label}:</strong>{" "}
                            <span style={{ color: "#737373" }}>
                                {item.detail}
                            </span>
                        </Text>
                    </Column>
                </Row>
            ))}
        </Section>
    );
}

export function ProgressBar({ fillPct }: { fillPct: number }) {
    const safeFillPct = Math.max(0, Math.min(fillPct, 100));

    return (
        <div
            style={{
                ...milestoneBarBgStyle,
                display: "block",
                fontSize: 0,
            }}
        >
            <div
                style={{
                    display: "block",
                    width: `${safeFillPct}%`,
                    height: "10px",
                    borderRadius: "999px",
                    background: `linear-gradient(90deg, ${palette.ctaBase} 0%, #a0a8b5 45%, ${palette.ctaEdge} 100%)`,
                }}
            />
        </div>
    );
}

export function WaitlistBadge({ position }: { position: number }) {
    return (
        <span
            style={{
                display: "inline-block",
                borderRadius: "999px",
                border: `1px solid ${palette.iconBorder}`,
                padding: "8px 12px",
                color: palette.heroText,
                backgroundColor: "rgba(87,83,99,0.28)",
                textAlign: "center",
            }}
        >
            <span
                style={{
                    display: "inline-block",
                    width: "10px",
                    height: "10px",
                    borderRadius: "999px",
                    backgroundColor: palette.iconDot,
                    marginRight: "8px",
                    verticalAlign: "middle",
                    position: "relative",
                }}
            />
            <span style={{ verticalAlign: "middle" }}>
                You&apos;re <strong>#{position}</strong> on the waitlist
            </span>
        </span>
    );
}

export function PatternBadge({
    patternType,
}: {
    patternType: PatternTypeCode;
}) {
    const styles = getPatternBadgeStyle(patternType);

    return (
        <span
            style={{
                display: "inline-block",
                borderRadius: "4px",
                border: `1px solid ${styles.borderColor}`,
                backgroundColor: styles.backgroundColor,
                color: styles.color,
                padding: "7px 8px",
                fontSize: "12px",
                lineHeight: "1",
                fontWeight: 500,
                whiteSpace: "nowrap",
            }}
        >
            {PATTERN_TYPES[patternType].label}
        </span>
    );
}

function getPatternBadgeStyle(patternType: PatternTypeCode) {
    const colorClasses = PATTERN_TYPES[patternType].color;
    const borderColor = extractHex(
        colorClasses,
        /border-\[(#[0-9a-fA-F]{6})\]/,
    );
    const backgroundColor = extractHex(
        colorClasses,
        /bg-\[(#[0-9a-fA-F]{6})\]/,
    );
    const color = extractHex(colorClasses, /text-\[(#[0-9a-fA-F]{6})\]/);

    return {
        borderColor: borderColor ?? "#d4d4d8",
        backgroundColor: backgroundColor ?? "#f4f4f5",
        color: color ?? "#52525b",
    };
}

function extractHex(source: string, pattern: RegExp) {
    return source.match(pattern)?.[1] ?? null;
}

export function buildLegalCopy(kind: "waitlist" | "account") {
    return kind === "waitlist"
        ? "because you signed up for Unsaid waitlist."
        : "because you opted into Unsaid emails.";
}

export function EmailLegal({
    recipientEmail,
    unsubscribeUrl,
    kind,
}: {
    recipientEmail: string;
    unsubscribeUrl: string;
    kind: "waitlist" | "account";
}) {
    return (
        <Text style={legalStyle}>
            This email was sent to {recipientEmail} {buildLegalCopy(kind)}{" "}
            <Link
                href={unsubscribeUrl}
                style={{
                    color: "#7a7368",
                    textDecoration: "underline",
                }}
            >
                Unsubscribe
            </Link>
        </Text>
    );
}
