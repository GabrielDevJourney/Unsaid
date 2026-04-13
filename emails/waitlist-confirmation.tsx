import { Body, Hr, Html, Preview, Section, Text } from "@react-email/components";
import { EmailHead } from "@/emails/components/email-head";
import {
    bodyCopyStyle,
    bodySectionStyle,
    bodyStrongStyle,
    cardStyle,
    EmailHero,
    EmailInnerCard,
    EmailShell,
    editorialQuoteStyle,
    emailStyles,
    sectionDividerStyle,
    splitLabelStyle,
    WaitlistBadge,
} from "@/emails/components/email-ui";

interface WaitlistConfirmationEmailProps {
    email?: string;
    waitlistPosition?: number | null;
    unsubscribeUrl?: string;
}

const valuePillars = [
    {
        title: "Patterns you can't see",
        detail:
            "Recurring themes and emotional triggers surface from your own words, not generic prompts.",
    },
    {
        title: "Progress you can measure",
        detail:
            "It tracks whether your thinking is shifting or you're circling the same thing again.",
    },
    {
        title: "Questions you're avoiding",
        detail:
            "Unsaid asks the uncomfortable question that actually moves the work forward.",
    },
];

const WaitlistConfirmationEmail = ({
    email = "you@example.com",
    waitlistPosition = 247,
    unsubscribeUrl = "mailto:hello@byunsaid.com?subject=Unsubscribe",
}: WaitlistConfirmationEmailProps) => {
    return (
        <Html>
            <EmailHead />
            <Preview>You're on the list. We'll be in touch.</Preview>
            <Body style={emailStyles.mainStyle}>
                <EmailShell
                    recipientEmail={email}
                    unsubscribeUrl={unsubscribeUrl}
                    legalKind="waitlist"
                >
                    <EmailInnerCard>
                        <EmailHero
                            title="You're in!"
                            description={
                                <>
                                    Thanks for joining the waitlist. You&apos;ve
                                    taken the first step toward understanding{" "}
                                    <strong
                                        style={{
                                            ...bodyStrongStyle,
                                            color: emailStyles.palette.heroText,
                                        }}
                                    >
                                        the patterns that shape your life.
                                    </strong>
                                </>
                            }
                            badge={
                                waitlistPosition ? (
                                    <WaitlistBadge
                                        position={waitlistPosition}
                                    />
                                ) : null
                            }
                            style={{ padding: "44px 24px 40px" }}
                        />

                        <Section
                            style={{
                                ...bodySectionStyle,
                                backgroundColor: "#F2F2F2",
                                padding: "0 22px 24px",
                            }}
                        >
                            <Section style={{ padding: "24px 0 0" }}>
                                <Text
                                    style={{
                                        ...editorialQuoteStyle,
                                        maxWidth: "360px",
                                        margin: "0 auto",
                                    }}
                                >
                                    Unsaid has been paying attention. It spots
                                    what repeats, what shifts, and what
                                    you&apos;ve been avoiding.
                                </Text>
                            </Section>

                            <Section style={{ padding: "20px 0 0" }}>
                                <Section
                                    style={{
                                        ...cardStyle,
                                        backgroundColor: "#ffffff",
                                        padding: "6px 0",
                                    }}
                                >
                                    {valuePillars.map((pillar, index) => (
                                        <Section
                                            key={pillar.title}
                                            style={{
                                                padding: "14px 18px",
                                            }}
                                        >
                                        <Text
                                            style={{
                                                color: "#435063",
                                                fontSize: "16px",
                                                lineHeight: "1.4",
                                                fontWeight: 700,
                                                margin: "0 0 5px",
                                            }}
                                        >
                                            {pillar.title}
                                        </Text>
                                        <Text
                                            style={{
                                                ...bodyCopyStyle,
                                                color: "#78736c",
                                                fontSize: "14px",
                                                lineHeight: "1.55",
                                            }}
                                        >
                                            {pillar.detail}
                                        </Text>
                                        {index !== valuePillars.length - 1 ? (
                                            <Hr
                                                style={{
                                                    ...sectionDividerStyle,
                                                    margin: "14px 0 0",
                                                }}
                                            />
                                        ) : null}
                                        </Section>
                                    ))}
                                </Section>
                            </Section>

                            <Section style={{ padding: "24px 0 0" }}>
                                <Hr style={sectionDividerStyle} />
                            </Section>
                        </Section>

                        <Section
                            style={{
                                backgroundColor: "#F2F2F2",
                                padding: "24px 22px 24px",
                            }}
                        >
                            <Text
                                style={{
                                    ...splitLabelStyle,
                                    textAlign: "center",
                                    fontSize: "18px",
                                    color: "#2b333e",
                                }}
                            >
                                When we launch, you&apos;ll be the first to
                                know. No spam.
                            </Text>
                            <Text
                                style={{
                                    ...splitLabelStyle,
                                    textAlign: "center",
                                    fontSize: "18px",
                                    color: "#425369",
                                    fontWeight: 700,
                                    marginTop: "6px",
                                }}
                            >
                                Just one email when the doors open.
                            </Text>
                        </Section>
                    </EmailInnerCard>
                </EmailShell>
            </Body>
        </Html>
    );
};

export default WaitlistConfirmationEmail;
