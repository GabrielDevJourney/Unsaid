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

interface ProgressCheckEmailProps {
    userName: string;
    headline: string;
    entryCount: number;
    viewUrl: string;
}

const ProgressCheckEmail = ({
    userName = "there",
    headline = "You're developing greater self-awareness",
    entryCount = 15,
    viewUrl = "https://byunsaid.com/progress",
}: ProgressCheckEmailProps) => {
    const previewText = `Milestone reached: ${entryCount} entries`;

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section style={milestoneTag}>
                        <Text style={tagText}>
                            🎉 {entryCount} entries milestone
                        </Text>
                    </Section>

                    <Heading style={heading}>
                        Your progress check is ready 💡
                    </Heading>

                    <Text style={paragraph}>Hi {userName},</Text>

                    <Text style={paragraph}>
                        You've reached{" "}
                        <strong>{entryCount} journal entries</strong>! This is a
                        meaningful milestone in your self-discovery journey.
                    </Text>

                    <Section style={headlineSection}>
                        <Text style={headlineLabel}>THE HEADLINE</Text>
                        <Text style={headlineText}>"{headline}"</Text>
                    </Section>

                    <Text style={paragraph}>
                        Your full progress report includes how you've evolved,
                        recurring themes, and personalized insights based on
                        your journey so far.
                    </Text>

                    <Section style={buttonSection}>
                        <Button style={button} href={viewUrl}>
                            View your progress
                        </Button>
                    </Section>

                    <Hr style={hr} />

                    <Text style={footer}>
                        Next milestone: {entryCount + 15} entries. Keep going!
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

export default ProgressCheckEmail;

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

const milestoneTag = {
    textAlign: "center" as const,
    margin: "0 0 24px",
};

const tagText = {
    backgroundColor: "#fef3c7",
    color: "#92400e",
    fontSize: "14px",
    fontWeight: "600",
    padding: "8px 16px",
    borderRadius: "20px",
    display: "inline-block",
    margin: "0",
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

const headlineSection = {
    backgroundColor: "#eff6ff",
    borderRadius: "8px",
    padding: "20px 24px",
    margin: "24px 0",
    borderLeft: "4px solid #3b82f6",
};

const headlineLabel = {
    color: "#1e40af",
    fontSize: "12px",
    fontWeight: "700",
    margin: "0 0 8px",
    letterSpacing: "1px",
};

const headlineText = {
    color: "#1a1a1a",
    fontSize: "18px",
    fontWeight: "500",
    lineHeight: "1.5",
    margin: "0",
    fontStyle: "italic",
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
    textAlign: "center" as const,
};
