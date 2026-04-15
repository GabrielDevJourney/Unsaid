import {
    Body,
    Column,
    Hr,
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
    bodyStrongStyle,
    EmailHero,
    EmailInnerCard,
    EmailShell,
    editorialQuoteStyle,
    emailStyles,
    sectionDividerStyle,
    WaitlistBadge,
} from "@/emails/components/email-ui";

interface WaitlistConfirmationEmailProps {
    email?: string;
    waitlistPosition?: number | null;
    unsubscribeUrl?: string;
    laptopImageUrl?: string;
}

const WaitlistConfirmationEmail = ({
    email = "you@example.com",
    waitlistPosition = 247,
    unsubscribeUrl = "mailto:hello@byunsaid.com?subject=Unsubscribe",
    laptopImageUrl = `${process.env.EMAIL_ASSETS_BASE_URL ?? "https://byunsaid.com"}/emails/laptop-image.png`,
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
                            style={{ padding: "48px 24px 44px" }}
                        />

                        <Section
                            style={{
                                ...bodySectionStyle,
                                backgroundColor: "#F2F2F2",
                            }}
                        >
                            <Row>
                                <Column
                                    style={{
                                        width: "52%",
                                        verticalAlign: "middle",
                                        paddingRight: "14px",
                                    }}
                                >
                                    <Text
                                        style={{
                                            ...editorialQuoteStyle,
                                            textAlign: "left",
                                            fontSize: "16px",
                                            color: "#737373",
                                            padding: "0 52px 0 14px",
                                            margin: "0 0 14px",
                                        }}
                                    >
                                        We&apos;re building something for the
                                        unflinching, those ready to see
                                        themselves clearly.
                                    </Text>
                                    <Hr
                                        style={{
                                            ...sectionDividerStyle,
                                            marginBottom: "14px",
                                        }}
                                    />
                                    <Text
                                        style={{
                                            ...bodyCopyStyle,
                                            color: "#737373",
                                            fontSize: "16px",
                                            padding: "0 52px 0 14px",
                                            margin: "0",
                                        }}
                                    >
                                        When we launch, you&apos;ll be the first
                                        to know. No spam.{" "}
                                        <strong>
                                            Just one email when the doors open.
                                        </strong>
                                    </Text>
                                </Column>
                                <Column
                                    style={{
                                        width: "48%",
                                        verticalAlign: "middle",
                                    }}
                                >
                                    <Img
                                        src={laptopImageUrl}
                                        alt="Unsaid app preview"
                                        width="100%"
                                        style={{
                                            display: "block",
                                            borderRadius: "8px",
                                        }}
                                    />
                                </Column>
                            </Row>
                        </Section>
                    </EmailInnerCard>
                </EmailShell>
            </Body>
        </Html>
    );
};

export default WaitlistConfirmationEmail;
