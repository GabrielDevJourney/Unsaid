import { Body, Html, Preview, Section, Text } from "@react-email/components";
import { EmailHead } from "@/emails/components/email-head";
import {
    BenefitList,
    bodySectionStyle,
    bodyStrongStyle,
    EmailHero,
    EmailInnerCard,
    EmailShell,
    EmailStatsRow,
    emailStyles,
    heroBodyStyle,
    helperTextStyle,
    PrimaryCta,
} from "@/emails/components/email-ui";

interface TrialEndingEmailProps {
    userName: string;
    daysRemaining: number;
    entriesWritten: number;
    patternsFound?: number;
    insightsReceived: number;
    upgradeUrl: string;
    recipientEmail?: string;
    unsubscribeUrl?: string;
}

const TrialEndingEmail = ({
    userName: _userName = "there",
    daysRemaining = 3,
    entriesWritten = 15,
    patternsFound = 3,
    insightsReceived = 19,
    upgradeUrl = "https://byunsaid.com/settings",
    recipientEmail = "you@example.com",
    unsubscribeUrl = "https://byunsaid.com/settings#notifications",
}: TrialEndingEmailProps) => {
    const previewText = `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} left in your trial.`;

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
                            title={`${daysRemaining} day${daysRemaining === 1 ? "" : "s"} left`}
                            description={
                                <>
                                    Everything you&apos;ve built stays with you.{" "}
                                    <strong
                                        style={{
                                            ...bodyStrongStyle,
                                            color: emailStyles.palette.heroText,
                                        }}
                                    >
                                        Don&apos;t let the picture go dark
                                    </strong>{" "}
                                    right when it&apos;s getting clear.
                                </>
                            }
                            style={{ padding: "42px 24px 38px" }}
                            titleStyle={{ fontSize: "48px" }}
                            descriptionStyle={{
                                ...heroBodyStyle,
                                maxWidth: "330px",
                            }}
                        />

                        <EmailStatsRow
                            backgroundColor="#F2F2F2"
                            topPadding={16}
                            stats={[
                                {
                                    key: "entries",
                                    value: entriesWritten,
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
                                    value: insightsReceived,
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
                            <BenefitList
                                backgroundColor="#F2F2F2"
                                items={[
                                    {
                                        label: "Weekly patterns",
                                        detail: "themes across your entries, named and explained",
                                    },
                                    {
                                        label: "Entry insights",
                                        detail: "see what you actually said, not what you think you said",
                                    },
                                    {
                                        label: "Progress tracking",
                                        detail: "a deeper read every 15 entries",
                                    },
                                    {
                                        label: "End-to-end encryption",
                                        detail: "your words never leave your device unprotected",
                                    },
                                ]}
                            />

                            <Section style={{ paddingTop: "28px" }}>
                                <PrimaryCta href={upgradeUrl}>
                                    Continue with Pro
                                </PrimaryCta>
                                <Text style={helperTextStyle}>
                                    Cancel anytime. Your entries are always
                                    yours.
                                </Text>
                            </Section>
                        </Section>
                    </EmailInnerCard>
                </EmailShell>
            </Body>
        </Html>
    );
};

export default TrialEndingEmail;
