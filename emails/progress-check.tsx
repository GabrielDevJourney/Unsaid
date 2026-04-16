import {
    Body,
    Column,
    Html,
    Img,
    Preview,
    Row,
    Section,
    Text,
} from "@react-email/components";
import { EmailHead } from "@/emails/components/email-head";
import {
    bodyCopyStyle,
    bodySectionStyle,
    cardStyle,
    EmailHero,
    EmailInnerCard,
    EmailShell,
    EmailStatsRow,
    editorialQuoteStyle,
    emailStyles,
    helperTextStyle,
    heroBodyStyle,
    PrimaryCta,
    ProgressBar,
} from "@/emails/components/email-ui";

interface ProgressCheckEmailProps {
    userName: string;
    headline: string;
    entryCount: number;
    patternsFound?: number;
    insightsGiven?: number;
    nextMilestone: number;
    progressLabel: string;
    fillPct: number;
    viewUrl: string;
    activityIconUrl?: string;
    recipientEmail?: string;
    unsubscribeUrl?: string;
}

const ProgressCheckEmail = ({
    userName: _userName = "there",
    headline = "You're developing greater self-awareness and starting to catch yourself mid-pattern.",
    entryCount = 15,
    patternsFound = 3,
    insightsGiven = 19,
    nextMilestone = 30,
    progressLabel = "15/30",
    fillPct = 50,
    viewUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://app.byunsaid.com"}/progress`,
    activityIconUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://app.byunsaid.com"}/emails/progress-header-dot-not.png`,
    recipientEmail = "you@example.com",
    unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://app.byunsaid.com"}/settings#notifications`,
}: ProgressCheckEmailProps) => {
    const previewText = `${entryCount} entries in. Your progress check is ready.`;

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
                                    src={activityIconUrl}
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
                            title={`${entryCount} entries in`}
                            description={
                                <>
                                    Unsaid has been reading.
                                    <br />
                                    <strong
                                        style={{
                                            color: emailStyles.palette.heroText,
                                            fontWeight: 700,
                                        }}
                                    >
                                        Here&apos;s what {entryCount} entries
                                        revealed about you.
                                    </strong>
                                </>
                            }
                            style={{ padding: "42px 24px 38px" }}
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
                                    value: patternsFound,
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
                                    value: insightsGiven,
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
                                backgroundColor: "#F2F2F2",
                                borderTop: `1px solid ${emailStyles.palette.panelBorder}`,
                                borderBottom: `1px solid ${emailStyles.palette.panelBorder}`,
                                padding: "24px 18px",
                            }}
                        >
                            <Text
                                style={{
                                    ...editorialQuoteStyle,
                                    maxWidth: "360px",
                                    margin: "0 auto",
                                }}
                            >
                                {headline}
                            </Text>
                        </Section>

                        <Section
                            style={{
                                ...bodySectionStyle,
                                backgroundColor: "#F2F2F2",
                                paddingTop: "20px",
                            }}
                        >
                            <Section
                                style={{
                                    ...cardStyle,
                                    backgroundColor: "#ECECEC",
                                    padding: "18px 20px",
                                }}
                            >
                                <Row>
                                    <Column style={{ width: "44%" }}>
                                        <Text
                                            style={{
                                                color: "#3D4958",
                                                fontSize: "17px",
                                                lineHeight: "1.55",
                                                margin: "0 0 4px",
                                            }}
                                        >
                                            <strong>
                                                Next milestone: {nextMilestone}{" "}
                                                entries
                                            </strong>
                                        </Text>
                                        <Text
                                            style={{
                                                ...bodyCopyStyle,
                                                color: "#a49f97",
                                                fontSize: "14px",
                                            }}
                                        >
                                            Halfway there, keep going.
                                        </Text>
                                    </Column>
                                    <Column style={{ width: "56%" }}>
                                        <Row>
                                            <Column style={{ width: "78%" }}>
                                                <ProgressBar
                                                    fillPct={fillPct}
                                                />
                                            </Column>
                                            <Column style={{ width: "22%" }}>
                                                <Text
                                                    style={{
                                                        color: "#a49f97",
                                                        fontSize: "14px",
                                                        lineHeight: "1.2",
                                                        textAlign: "right",
                                                        margin: "0",
                                                    }}
                                                >
                                                    {progressLabel}
                                                </Text>
                                            </Column>
                                        </Row>
                                    </Column>
                                </Row>
                            </Section>

                            <Section style={{ paddingTop: "28px" }}>
                                <PrimaryCta
                                    href={viewUrl}
                                    style={{ boxShadow: "0 0 0 2px #d8d3cb" }}
                                >
                                    View your full progress report
                                </PrimaryCta>
                                <Text style={helperTextStyle}>
                                    The full picture lives in Unsaid.
                                </Text>
                            </Section>
                        </Section>
                    </EmailInnerCard>
                </EmailShell>
            </Body>
        </Html>
    );
};

export default ProgressCheckEmail;
