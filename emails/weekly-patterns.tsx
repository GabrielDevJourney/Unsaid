import {
    Body,
    Html,
    Img,
    Preview,
    Row,
    Section,
    Text,
} from "@react-email/components";
import { EmailHead } from "@/emails/components/email-head";
import {
    bodySectionStyle,
    bodyStrongStyle,
    cardStyle,
    EmailHero,
    EmailInnerCard,
    EmailShell,
    EmailStatsRow,
    emailStyles,
    helperTextStyle,
    heroBodyStyle,
    PatternBadge,
    PrimaryCta,
    previewPatternTitleStyle,
} from "@/emails/components/email-ui";
import type { PatternTypeCode } from "@/lib/constants/pattern-types";

interface WeeklyPatternPreview {
    title: string;
    patternType: PatternTypeCode;
}

interface WeeklyPatternsEmailProps {
    userName: string;
    patternCount: number;
    entryCount?: number;
    insightsCount?: number;
    patterns?: WeeklyPatternPreview[];
    patternsIconUrl?: string;
    viewUrl: string;
    recipientEmail?: string;
    unsubscribeUrl?: string;
}

const defaultPatterns: WeeklyPatternPreview[] = [
    {
        title: "Progress Blindness",
        patternType: "behavioral_pattern",
    },
    {
        title: "Boundary Avoidance",
        patternType: "growth",
    },
    {
        title: "Sunday Anticipation Spiral",
        patternType: "emotional_trigger",
    },
];

const WeeklyPatternsEmail = ({
    userName: _userName = "there",
    patternCount = 3,
    entryCount = 15,
    insightsCount = 19,
    patterns = defaultPatterns,
    patternsIconUrl = "https://byunsaid.com/emails/patterns-header-dot-not.png",
    viewUrl = "https://byunsaid.com/patterns",
    recipientEmail = "you@example.com",
    unsubscribeUrl = "https://byunsaid.com/settings#notifications",
}: WeeklyPatternsEmailProps) => {
    const previewText = `${patternCount} pattern${patternCount === 1 ? "" : "s"} surfaced this week.`;

    return (
        <Html>
            <EmailHead />
            <Preview>{previewText}</Preview>
            <Body style={emailStyles.mainStyle}>
                <EmailShell
                    recipientEmail={recipientEmail}
                    unsubscribeUrl={unsubscribeUrl}
                    legalKind="account"
                >
                    <EmailInnerCard>
                        <EmailHero
                            icon={
                                <Img
                                    src={patternsIconUrl}
                                    alt=""
                                    width="52"
                                    height="52"
                                    style={{
                                        display: "block",
                                        margin: "0 auto",
                                        width: "52px",
                                        height: "52px",
                                    }}
                                />
                            }
                            title={`${patternCount} pattern${patternCount === 1 ? "" : "s"} this week!`}
                            description={
                                <>
                                    Unsaid found{" "}
                                    <strong
                                        style={{
                                            ...bodyStrongStyle,
                                            color: emailStyles.palette.heroText,
                                        }}
                                    >
                                        {patternCount} recurring theme
                                        {patternCount === 1 ? "" : "s"}
                                    </strong>{" "}
                                    across your entries this week. Each one
                                    comes with evidence from your own words and
                                    a small experiment to try.
                                </>
                            }
                            titleStyle={{ fontSize: "48px" }}
                            descriptionStyle={{
                                ...heroBodyStyle,
                                maxWidth: "350px",
                            }}
                        />

                        <EmailStatsRow
                            backgroundColor="#F2F2F2"
                            topPadding={16}
                            stats={[
                                {
                                    key: "entries",
                                    value: entryCount,
                                    label: (
                                        <>
                                            Entries
                                            <br />
                                            written
                                        </>
                                    ),
                                },
                                {
                                    key: "patterns",
                                    value: patternCount,
                                    label: (
                                        <>
                                            Patterns
                                            <br />
                                            found
                                        </>
                                    ),
                                },
                                {
                                    key: "insights",
                                    value: insightsCount,
                                    label: (
                                        <>
                                            Insights
                                            <br />
                                            given
                                        </>
                                    ),
                                },
                            ]}
                        />

                        <Section
                            style={{
                                ...bodySectionStyle,
                                backgroundColor: "#F2F2F2",
                                paddingTop: "0",
                            }}
                        >
                            <Section
                                style={{
                                    ...cardStyle,
                                    backgroundColor: "#ffffff",
                                    padding: "22px 28px",
                                }}
                            >
                                {patterns.slice(0, 3).map((pattern, index) => (
                                    <Section
                                        key={`${pattern.title}-${index}`}
                                        style={{
                                            padding: "0",
                                            marginBottom:
                                                index === patterns.length - 1
                                                    ? "0"
                                                    : "16px",
                                        }}
                                    >
                                        <Row>
                                            <td
                                                style={{
                                                    width: "148px",
                                                    verticalAlign: "middle",
                                                    paddingRight: "16px",
                                                }}
                                            >
                                                <PatternBadge
                                                    patternType={
                                                        pattern.patternType
                                                    }
                                                />
                                            </td>
                                            <td
                                                style={{
                                                    verticalAlign: "middle",
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        ...previewPatternTitleStyle,
                                                        fontSize: "16px",
                                                        lineHeight: "1.4",
                                                        margin: "0",
                                                    }}
                                                >
                                                    {pattern.title}
                                                </Text>
                                            </td>
                                        </Row>
                                    </Section>
                                ))}
                            </Section>

                            <Section style={{ paddingTop: "28px" }}>
                                <PrimaryCta href={viewUrl}>
                                    View all patterns in Unsaid
                                </PrimaryCta>
                                <Text style={helperTextStyle}>
                                    Keep writing to surface more.
                                </Text>
                            </Section>
                        </Section>
                    </EmailInnerCard>
                </EmailShell>
            </Body>
        </Html>
    );
};

export default WeeklyPatternsEmail;
