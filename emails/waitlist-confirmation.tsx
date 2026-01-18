import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Link,
    Preview,
    Text,
} from "@react-email/components";

interface WaitlistConfirmationEmailProps {
    email?: string;
}

const WaitlistConfirmationEmail = ({
    email = "you@example.com",
}: WaitlistConfirmationEmailProps) => {
    const previewText = "You're on the list. We'll be in touch.";

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Text style={logo}>UNSAID</Text>

                    <Heading style={heading}>You're in.</Heading>

                    <Text style={paragraph}>
                        Thanks for joining the waitlist. You've taken the first
                        step toward understanding the patterns that shape your
                        life.
                    </Text>

                    <Text style={paragraph}>
                        Unsaid is a journaling app that doesn't sugarcoat. It
                        catches the patterns you miss, reflects the shifts you
                        avoid, and helps you own your evolution over time.
                    </Text>

                    <Text style={highlightBox}>
                        We're building something for the unflinching—those ready
                        to see themselves clearly.
                    </Text>

                    <Text style={paragraph}>
                        When we launch, you'll be the first to know. No spam.
                        Just one email when the doors open.
                    </Text>

                    <Hr style={hr} />

                    <Text style={footer}>
                        This email was sent to{" "}
                        <Link href={`mailto:${email}`} style={link}>
                            {email}
                        </Link>{" "}
                        because you signed up for the Unsaid waitlist.
                    </Text>

                    <Text style={tagline}>The truth has no filter.</Text>
                </Container>
            </Body>
        </Html>
    );
};

export default WaitlistConfirmationEmail;

const main = {
    backgroundColor: "#FAFAF9",
    fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
};

const container = {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "48px 32px",
    maxWidth: "520px",
    borderRadius: "4px",
    border: "1px solid #E8E8E6",
};

const logo = {
    color: "#0A0A0A",
    fontSize: "13px",
    fontWeight: "500",
    letterSpacing: "0.4em",
    textAlign: "center" as const,
    margin: "0 0 40px",
};

const heading = {
    color: "#0A0A0A",
    fontSize: "32px",
    fontWeight: "300",
    lineHeight: "1.2",
    margin: "0 0 24px",
    fontFamily: "Georgia, serif",
};

const paragraph = {
    color: "#4A4A4A",
    fontSize: "15px",
    lineHeight: "1.7",
    margin: "0 0 20px",
};

const highlightBox = {
    color: "#0A0A0A",
    fontSize: "15px",
    lineHeight: "1.7",
    margin: "28px 0",
    padding: "20px 24px",
    backgroundColor: "#F8F8F6",
    borderLeft: "3px solid #0A0A0A",
    fontStyle: "italic",
};

const hr = {
    borderColor: "#E8E8E6",
    margin: "32px 0 24px",
};

const footer = {
    color: "#8A8A8A",
    fontSize: "13px",
    lineHeight: "1.6",
    margin: "0 0 16px",
};

const link = {
    color: "#0A0A0A",
    textDecoration: "underline",
};

const tagline = {
    color: "#ABABAB",
    fontSize: "11px",
    fontStyle: "italic",
    textAlign: "center" as const,
    margin: "24px 0 0",
    letterSpacing: "0.02em",
};
