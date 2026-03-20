import { Head } from "@react-email/components";

const SATOSHI_URL = "https://byunsaid.com/fonts/Satoshi-Variable.woff2";
const LIBRE_BASKERVILLE_URL =
    "https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap";

/**
 * Shared <Head> for all Unsaid email templates.
 * - Satoshi via self-hosted woff2 (Apple Mail + Gmail web)
 * - Libre Baskerville via Google Fonts (broader client support for serif)
 * Both fall back gracefully in Outlook and Gmail mobile.
 */
const EmailHead = () => (
    <Head>
        <link rel="stylesheet" href={LIBRE_BASKERVILLE_URL} />
        <style>{`
            @font-face {
                font-family: 'Satoshi';
                src: url('${SATOSHI_URL}') format('woff2');
                font-weight: 100 900;
                font-style: normal;
                font-display: swap;
            }
        `}</style>
    </Head>
);

export { EmailHead };
