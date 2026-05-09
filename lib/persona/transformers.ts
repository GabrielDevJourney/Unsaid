import { decrypt } from "@/lib/crypto";

export interface PersonaRow {
    userId: string;
    displayName: string;
    q1Answer: string;
    q2Answer: string;
    q3Answer: string;
    q4Answer: string;
    summary: string | null;
}

export const toPersonaRow = (row: {
    user_id: string;
    display_name: string;
    q1_answer: string;
    q2_answer: string;
    q3_answer: string;
    q4_answer: string;
    encrypted_summary: string | null;
    summary_iv: string | null;
    summary_tag: string | null;
}): PersonaRow => {
    const summary =
        row.encrypted_summary && row.summary_iv && row.summary_tag
            ? decrypt({
                  encryptedContent: row.encrypted_summary,
                  iv: row.summary_iv,
                  tag: row.summary_tag,
              })
            : null;

    return {
        userId: row.user_id,
        displayName: row.display_name,
        q1Answer: row.q1_answer,
        q2Answer: row.q2_answer,
        q3Answer: row.q3_answer,
        q4Answer: row.q4_answer,
        summary,
    };
};
