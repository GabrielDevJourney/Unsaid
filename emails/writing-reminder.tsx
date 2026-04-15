import {
    Body,
    Hr,
    Html,
    Preview,
    Section,
    Text,
} from "@react-email/components";
import { EmailHead } from "@/emails/components/email-head";
import {
    bodySectionStyle,
    EmailHero,
    EmailInnerCard,
    EmailShell,
    editorialQuoteStyle,
    emailStyles,
    helperTextStyle,
    heroBodyStyle,
    PrimaryCta,
    PromptRow,
    sectionDividerStyle,
    sectionLabelStyle,
} from "@/emails/components/email-ui";

interface WritingReminderEmailProps {
    userName: string;
    daysSinceLastEntry: number | null;
    writeUrl: string;
    recipientEmail?: string;
    unsubscribeUrl?: string;
}

const WritingReminderEmail = ({
    userName = "there",
    daysSinceLastEntry = null,
    writeUrl = "https://byunsaid.com",
    recipientEmail = "you@example.com",
    unsubscribeUrl = "https://byunsaid.com/settings#notifications",
}: WritingReminderEmailProps) => {
    const previewText =
        daysSinceLastEntry === null
            ? "You haven't written yet."
            : `It's been ${daysSinceLastEntry} day${daysSinceLastEntry === 1 ? "" : "s"} since your last entry.`;

    const headingText =
        daysSinceLastEntry === null
            ? `Time to start, ${userName}`
            : `Time to return, ${userName}`;

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
                            title={headingText}
                            description={
                                daysSinceLastEntry === null
                                    ? "You haven't written yet this week. The patterns don't pause, they just go untracked."
                                    : `You haven't written in ${daysSinceLastEntry} day${daysSinceLastEntry === 1 ? "" : "s"}. The patterns don't pause, they just go untracked.`
                            }
                            style={{ padding: "42px 24px 38px" }}
                            titleStyle={{ fontSize: "48px" }}
                            descriptionStyle={{
                                ...heroBodyStyle,
                                maxWidth: "350px",
                            }}
                        />

                        <Section
                            style={{
                                backgroundColor: "#F2F2F2",
                                padding: "36px 48px 32px",
                            }}
                        >
                            <Text style={editorialQuoteStyle}>
                                We&apos;re building something for the
                                unflinching, those ready to see themselves
                                clearly.
                            </Text>
                        </Section>

                        <Hr style={sectionDividerStyle} />

                        <Section
                            style={{
                                ...bodySectionStyle,
                                backgroundColor: "#F2F2F2",
                            }}
                        >
                            <Section style={{ padding: "0 36px" }}>
                                <Text style={sectionLabelStyle}>
                                    Start with one of these:
                                </Text>
                                <PromptRow
                                    dotColor="#657288"
                                    dotRingColor="rgba(101,114,136,0.30)"
                                    text="What happened after your last entry?"
                                />
                                <PromptRow
                                    dotColor="#624234"
                                    dotRingColor="rgba(98,66,52,0.30)"
                                    text="What's been sitting with you this week?"
                                />
                                <PromptRow
                                    dotColor="#B8886E"
                                    dotRingColor="rgba(184,136,110,0.30)"
                                    text="What are you not saying out loud?"
                                />
                            </Section>

                            <Section style={{ paddingTop: "18px" }}>
                                <PrimaryCta href={writeUrl}>
                                    Write today
                                </PrimaryCta>
                                <Text style={helperTextStyle}>
                                    Takes less than 5 minutes. You always feel
                                    better after.
                                </Text>
                            </Section>
                        </Section>
                    </EmailInnerCard>
                </EmailShell>
            </Body>
        </Html>
    );
};

export default WritingReminderEmail;
