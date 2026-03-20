import {
    Body,
    Container,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
} from "@react-email/components";
import { EmailHead } from "@/emails/components/email-head";

const LOGO_URL = "https://byunsaid.com/logo-white-bg.svg";

interface WaitlistConfirmationEmailProps {
    email?: string;
}

const WaitlistConfirmationEmail = ({
    email = "you@example.com",
}: WaitlistConfirmationEmailProps) => {
    return (
        <Html>
            <EmailHead />
            <Preview>You're on the list. We'll be in touch.</Preview>
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

                        <Text style={heading}>You're in.</Text>

                        <Text style={paragraph}>
                            Thanks for joining the waitlist. You've taken the
                            first step toward understanding the patterns that
                            shape your life.
                        </Text>

                        <Text style={paragraph}>
                            Unsaid is a journaling app that doesn't sugarcoat.
                            It catches the patterns you miss, reflects the
                            shifts you avoid, and helps you own your evolution
                            over time.
                        </Text>

                        <Section style={highlightBox}>
                            <Text style={highlightText}>
                                We're building something for the unflinching —
                                those ready to see themselves clearly.
                            </Text>
                        </Section>

                        <Text style={paragraph}>
                            When we launch, you'll be the first to know. No
                            spam. Just one email when the doors open.
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
                    </div>
                </Container>
            </Body>
        </Html>
    );
};

export default WaitlistConfirmationEmail;

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
    lineHeight: "1.2",
    margin: "0 0 24px",
};

const paragraph = {
    color: "#737373",
    fontSize: "15px",
    lineHeight: "1.7",
    margin: "0 0 20px",
};

const highlightBox = {
    backgroundColor: "#f2f2f2",
    borderRadius: "10px",
    border: "1px solid #e5e5e5",
    padding: "16px 20px",
    margin: "28px 0",
};

const highlightText = {
    color: "#52525b",
    fontSize: "15px",
    fontStyle: "italic",
    fontFamily: "'Libre Baskerville', Georgia, serif",
    lineHeight: "1.7",
    margin: "0",
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

const link = {
    color: "#52525b",
    textDecoration: "underline",
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
