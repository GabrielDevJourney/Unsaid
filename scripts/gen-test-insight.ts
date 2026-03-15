/**
 * Generates encrypted content for a test progress insight.
 * Output: SQL UPDATE snippet you can paste into the Supabase SQL editor.
 *
 * Usage: npx tsx scripts/gen-test-insight.ts
 */

import crypto from "node:crypto";
import { config } from "dotenv";

config({ path: ".env.local" });

const KEY_BASE64 = process.env.CRYPTO_KEY;
if (!KEY_BASE64) {
    console.error("Missing CRYPTO_KEY in .env.local");
    process.exit(1);
}

const KEY = Buffer.from(KEY_BASE64, "base64");

const encrypt = (plaintext: string) => {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", KEY, iv);
    const encryptedBuffer = Buffer.concat([
        cipher.update(plaintext, "utf8"),
        cipher.final(),
    ]);
    const tag = cipher.getAuthTag();
    return {
        encryptedContent: encryptedBuffer.toString("base64"),
        iv: iv.toString("base64"),
        tag: tag.toString("base64"),
    };
};

const content = JSON.stringify({
    headline: "You're learning what the automatic yes has been protecting",
    whats_on_repeat:
        "A reflexive agreement that happens before any real evaluation. It shows up at work, in planning, in how you respond to requests — and it has been showing up consistently for weeks. The yes arrives before you've had a chance to check your actual capacity, your actual desire, your actual limits. You've caught it happening in slow motion at least four times this cycle: once in a team meeting, twice over email, and once in a conversation with a friend who asked something small and got more than you had. The pattern isn't random. It clusters around moments where you feel evaluated — where saying no seems like it would cost you something, even when you can't name exactly what.",
    what_changed:
        "The pause is new. Not a long pause — sometimes just a breath, sometimes a sentence: 'let me come back to you on that.' But something in that gap is different from before. The gap between feeling the pull to agree and actually agreeing has stretched in a way that now gives you room to think. You used it twice this week to give a different answer than you would have six weeks ago. One of those answers was still yes — but it was a yes you meant. That distinction matters more than it might look like from the outside.",
    reality_check:
        "The catastrophe you were protecting against — the disappointed manager, the relationship ending, the reputation for being difficult — hasn't materialized. Not once, across multiple instances of actually saying no or slowing down before agreeing. What has happened instead: people moved on, adjusted, found another way, or simply said fine. You have been running a risk model built on very old data. The evidence is starting to run in the other direction, and you're starting to notice it, even if you don't fully trust it yet.",
    experiment:
        "For the next two weeks, before agreeing to anything that will take more than an hour of your time, write down — even just one sentence — what you are giving up in order to say yes. Not to prevent the yes. Not to audit yourself. Just to make it a conscious transaction instead of an automatic one. The goal is not fewer yeses. The goal is yeses that you actually made, rather than yeses that happened to you while you were standing there.",
    the_question:
        "If the automatic yes is protecting something, what is it protecting? And here's the sharper version of that question: what do you believe — really believe, in the part of you that runs this reflex — would happen if you became known as someone who sometimes says no?",
    key_entry_numbers: [3, 8, 14],
    is_milestone: false,
});

const { encryptedContent, iv, tag } = encrypt(content);

console.log("\n--- Paste into Supabase SQL editor ---\n");
console.log(
    `UPDATE progress_insights\nSET\n  encrypted_content = '${encryptedContent}',\n  content_iv        = '${iv}',\n  content_tag       = '${tag}'\nWHERE id = '<your-insight-id>';`,
);
