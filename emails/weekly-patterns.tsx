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

interface WeeklyPatternsEmailProps {
    userName: string;
    patternCount: number;
    patternPreviews: string[];
    viewUrl: string;
}

const WeeklyPatternsEmail = ({
    userName = "there",
    patternCount = 3,
    patternPreviews = ["Pattern 1", "Pattern 2", "Pattern 3"],
    viewUrl = "https://byunsaid.com/patterns",
}: WeeklyPatternsEmailProps) => {
    const previewText = `${patternCount} new patterns discovered this week`;

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={heading}>
                        Your weekly patterns are ready 📊
                    </Heading>

                    <Text style={paragraph}>Hi {userName},</Text>

                    <Text style={paragraph}>
                        Based on your journal entries this week, I've identified{" "}
                        <strong>{patternCount} patterns</strong> in your
                        thoughts and behaviors.
                    </Text>

                    <Section style={patternsSection}>
                        <Text style={sectionLabel}>This week's patterns:</Text>
                        {patternPreviews.slice(0, 3).map((pattern) => (
                            <Text key={pattern} style={patternItem}>
                                • {pattern}
                            </Text>
                        ))}
                        {patternCount > 3 && (
                            <Text style={morePatterns}>
                                +{patternCount - 3} more patterns
                            </Text>
                        )}
                    </Section>

                    <Text style={paragraph}>
                        Understanding your patterns is the first step to
                        meaningful change. Dive deeper to see the evidence and
                        suggested experiments.
                    </Text>

                    <Section style={buttonSection}>
                        <Button style={button} href={viewUrl}>
                            View all patterns
                        </Button>
                    </Section>

                    <Hr style={hr} />

                    <Text style={footer}>
                        Keep journaling to discover more patterns each week.
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

export default WeeklyPatternsEmail;

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

const patternsSection = {
    backgroundColor: "#f0fdf4",
    borderRadius: "8px",
    padding: "16px 20px",
    margin: "24px 0",
    borderLeft: "4px solid #22c55e",
};

const sectionLabel = {
    color: "#166534",
    fontSize: "14px",
    fontWeight: "600",
    margin: "0 0 12px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
};

const patternItem = {
    color: "#1a1a1a",
    fontSize: "15px",
    lineHeight: "1.6",
    margin: "0 0 8px",
};

const morePatterns = {
    color: "#6b7280",
    fontSize: "14px",
    fontStyle: "italic",
    margin: "8px 0 0",
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
