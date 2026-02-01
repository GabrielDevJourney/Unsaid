import crypto from "node:crypto";
import type { EncryptedData } from "@/types";

const ALGORITHM = "aes-256-gcm";
const KEY_BASE64 = process.env.CRYPTO_KEY;

if (!KEY_BASE64) {
    throw new Error("CRYPTO_KEY environment variable is required");
}

const KEY = Buffer.from(KEY_BASE64, "base64");
if (KEY.length !== 32) {
    throw new Error("CRYPTO_KEY must be 32 bytes (base64 encoded)");
}

/**
 * Encrypt plaintext using AES-256-GCM
 */
export const encrypt = (plaintext: string): EncryptedData => {
    const iv = crypto.randomBytes(12); // 96-bit IV for GCM
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

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

/**
 * Decrypt AES-256-GCM ciphertext
 */
export const decrypt = (data: EncryptedData): string => {
    const decipher = crypto.createDecipheriv(
        ALGORITHM,
        KEY,
        Buffer.from(data.iv, "base64"),
    );
    decipher.setAuthTag(Buffer.from(data.tag, "base64"));

    const decrypted = Buffer.concat([
        decipher.update(Buffer.from(data.encryptedContent, "base64")),
        decipher.final(),
    ]);

    return decrypted.toString("utf8");
};
