import {
    Body,
    Button,
    Container,
    Hr,
    Html,
    Img,
    Preview,
    Section,
    Text,
} from "@react-email/components";
import { EmailHead } from "@/emails/components/email-head";

const LOGO_URL = "https://byunsaid.com/logo-white-bg.svg";

interface TrialEndingEmailProps {
    userName: string;
    daysRemaining: number;
    entriesWritten: number;
    insightsReceived: number;
    upgradeUrl: string;
}

const TrialEndingEmail = ({
    userName = "there",
    daysRemaining = 3,
    entriesWritten = 0,
    insightsReceived = 0,
    upgradeUrl = "https://byunsaid.com/settings",
}: TrialEndingEmailProps) => {
    const previewText = `Your trial ends in ${daysRemaining} day${daysRemaining === 1 ? "" : "s"}`;

    return (
        <Html>
            <EmailHead />
            <Preview>{previewText}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <div style={inner}>
                        <div style={logoWrap}>
                            <Img
                                src={LOGO_URL}
                                width="38"
                                height="38"
                                alt="unsaid"
                                style={{ display: "block", margin: "0 auto" }}
                            />
                        </div>

                        <Text style={heading}>
                            {daysRemaining} day
                            {daysRemaining === 1 ? "" : "s"} left.
                        </Text>

                        <Text style={paragraph}>Hi {userName},</Text>

                        <Text style={paragraph}>
                            Your trial is coming to an end. Here's what you
                            built while it lasted:
                        </Text>

                        <Section style={highlightBox}>
                            <Text style={statLine}>
                                {entriesWritten} entries written
                            </Text>
                            <Text style={statLine}>
                                {insightsReceived} insights received
                            </Text>
                        </Section>

                        <Text style={paragraph}>
                            That's real work. Your patterns, progress, and
                            everything you've written stays with you.
                        </Text>

                        <Section style={buttonSection}>
                            <Button style={button} href={upgradeUrl}>
                                Continue for $10.99/month
                            </Button>
                        </Section>

                        <Hr style={hr} />

                        <Text style={footer}>
                            If you choose not to continue, you'll still be able
                            to view your entries anytime.
                        </Text>

                        <Text style={tagline}>The truth has no filter.</Text>
                    </div>
                </Container>
            </Body>
        </Html>
    );
};

export default TrialEndingEmail;

const main = {
    backgroundColor: "#f2f2f2",
    fontFamily:
        'Satoshi, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
    backgroundColor: "#fcfcfc",
    margin: "0 auto",
    maxWidth: "520px",
    borderRadius: "14px",
    border: "1px solid #e5e5e5",
    overflow: "hidden",
};

const inner = {
    padding: "36px 32px 40px",
};

const logoWrap = {
    textAlign: "center" as const,
    margin: "0 0 32px",
};

const heading = {
    color: "#52525b",
    fontSize: "28px",
    fontWeight: "400",
    fontStyle: "italic",
    fontFamily: "'Libre Baskerville', Georgia, serif",
    lineHeight: "1.3",
    margin: "0 0 24px",
};

const paragraph = {
    color: "#737373",
    fontSize: "15px",
    lineHeight: "1.7",
    margin: "0 0 16px",
};

const highlightBox = {
    backgroundColor: "#f2f2f2",
    borderRadius: "10px",
    border: "1px solid #e5e5e5",
    padding: "16px 20px",
    margin: "24px 0",
};

const statLine = {
    color: "#52525b",
    fontSize: "15px",
    lineHeight: "1.8",
    margin: "0",
};

const buttonSection = {
    textAlign: "center" as const,
    margin: "28px 0",
};

const button = {
    background:
        "linear-gradient(135deg, rgb(148,163,184) 0%, rgb(189,142,111) 65%, rgba(247,107,21,0.6) 100%)",
    boxShadow: "0 0 0 4px #d4d4d8",
    borderRadius: "8px",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "500",
    textDecoration: "none",
    padding: "11px 24px",
    display: "inline-block",
};

const hr = {
    borderColor: "#e5e5e5",
    margin: "28px 0 20px",
};

const footer = {
    color: "#a1a1aa",
    fontSize: "13px",
    lineHeight: "1.6",
    margin: "0 0 16px",
};

const tagline = {
    color: "#71717a",
    fontSize: "14px",
    fontStyle: "italic",
    fontFamily: "'Libre Baskerville', Georgia, serif",
    textAlign: "center" as const,
    margin: "8px 0 0",
    letterSpacing: "0.02em",
};
