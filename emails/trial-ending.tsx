import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Section,
    Text,
} from "@react-email/components";

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
    const previewText = `Your Unsaid trial ends in ${daysRemaining} day${daysRemaining === 1 ? "" : "s"}`;

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={heading}>
                        Your trial ends in {daysRemaining} day
                        {daysRemaining === 1 ? "" : "s"}
                    </Heading>

                    <Text style={paragraph}>Hi {userName},</Text>

                    <Text style={paragraph}>
                        Your Unsaid trial is coming to an end. Here's what
                        you've accomplished so far:
                    </Text>

                    <Section style={statsSection}>
                        <Text style={statItem}>
                            📝 <strong>{entriesWritten}</strong> entries written
                        </Text>
                        <Text style={statItem}>
                            💡 <strong>{insightsReceived}</strong> insights
                            received
                        </Text>
                    </Section>

                    <Text style={paragraph}>
                        Continue your self-discovery journey with full access to
                        AI-powered insights, weekly patterns, and progress
                        tracking.
                    </Text>

                    <Section style={buttonSection}>
                        <Button style={button} href={upgradeUrl}>
                            Continue your journey - $12.99/month
                        </Button>
                    </Section>

                    <Hr style={hr} />

                    <Text style={footer}>
                        If you choose not to upgrade, you'll still be able to
                        view your entries and export your data anytime.
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

export default TrialEndingEmail;

const main = {
    backgroundColor: "#f6f9fc",
    fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "40px 20px",
    maxWidth: "560px",
    borderRadius: "8px",
};

const heading = {
    color: "#1a1a1a",
    fontSize: "24px",
    fontWeight: "600",
    lineHeight: "1.3",
    margin: "0 0 24px",
};

const paragraph = {
    color: "#4a4a4a",
    fontSize: "16px",
    lineHeight: "1.6",
    margin: "0 0 16px",
};

const statsSection = {
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    padding: "16px 20px",
    margin: "24px 0",
};

const statItem = {
    color: "#1a1a1a",
    fontSize: "16px",
    lineHeight: "1.8",
    margin: "0",
};

const buttonSection = {
    textAlign: "center" as const,
    margin: "32px 0",
};

const button = {
    backgroundColor: "#0f172a",
    borderRadius: "6px",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "600",
    textDecoration: "none",
    padding: "12px 24px",
    display: "inline-block",
};

const hr = {
    borderColor: "#e6e6e6",
    margin: "32px 0",
};

const footer = {
    color: "#8898aa",
    fontSize: "14px",
    lineHeight: "1.5",
    margin: "0",
};
