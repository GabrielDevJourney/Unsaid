# User Deletion Flow

## Overview

When a user wants to delete their account, we need to handle it carefully since journal data is irreplaceable. This document outlines the full flow for design and implementation.

## Flow Diagram

```
Settings
  → Privacy & Data
    → "Delete Account" button
      → Data Impact Screen (what will be deleted)
        → Re-authenticate (security)
          → Choose: Deactivate or Delete
            → Confirmation Modal (type "DELETE")
              → Grace Period Starts (30 days)
                → Email Confirmation Sent
                  → Account Locked (can reactivate)
                    → After 30 days: Permanent Deletion
```

---

## Screen-by-Screen Breakdown

### 1. Settings → Privacy & Data

**Location:** Settings page, "Privacy & Data" section

**Elements:**
- "Download My Data" button (export before deletion)
- "Delete Account" button (danger zone styling)

---

### 2. Data Impact Screen

**Purpose:** Help user understand what will be permanently deleted

**Content:**
```
What will be deleted:
- All journal entries (X entries)
- All insights and patterns
- Your progress history
- Account information

This cannot be undone.
```

**CTA:** "Continue" / "Cancel"

---

### 3. Re-authentication

**Purpose:** Security check - confirm it's really the account owner

**Implementation:** Clerk's re-authentication flow

**Copy:** "For your security, please confirm your password to continue"

---

### 4. Deactivate vs Delete Choice

**Two options presented:**

#### Option A: Deactivate (Pause)
- Account hidden, data preserved
- Can reactivate anytime by logging in
- "Take a break without losing your data"

#### Option B: Delete (Permanent)
- 30-day grace period, then permanent deletion
- Cannot be undone after grace period
- "Permanently remove all data"

---

### 5. Confirmation Modal (Delete path)

**Purpose:** Final friction to prevent accidents

**Elements:**
- Warning icon
- Copy: "This will permanently delete all your journal entries, insights, and personal data after 30 days. This action cannot be undone."
- Input field: "Type DELETE to confirm"
- Buttons: "Cancel" / "Delete My Account" (disabled until DELETE typed)

---

### 6. Grace Period (30 days)

**What happens:**
- Account marked as `deleted_at = now()`
- User logged out
- User cannot log back in (blocked at auth)
- If user tries to log in: "Your account is scheduled for deletion. [Reactivate]"

**Email sent:**
- Subject: "Your Unsaid account is scheduled for deletion"
- Content: Confirmation + reactivation link + 30-day timeline

---

### 7. Reactivation (during grace period)

**If user clicks reactivate:**
- Re-authenticate
- `deleted_at = null`
- Account restored, all data intact
- Confirmation: "Welcome back. Your account has been restored."

---

### 8. Permanent Deletion (after 30 days)

**Backend cron job:**
- Runs daily
- Finds users where `deleted_at < now() - 30 days`
- Hard deletes user row (CASCADE deletes all related data)
- Sends final confirmation email: "Your Unsaid account has been permanently deleted"

---

## Copy Guidelines

### Tone
- Empathetic, not corporate
- Acknowledge that journal data is personal and irreplaceable
- No guilt-tripping ("We're sorry to see you go" is fine, "Are you sure you want to leave?" is not)

### Key Messages
1. Data is irreplaceable - export first if needed
2. Grace period exists - you can change your mind
3. We respect your choice - no dark patterns

---

## Technical Implementation Notes

### Database Changes Needed
```sql
ALTER TABLE users ADD COLUMN deleted_at timestamptz;
```

### Middleware Change
- Check `deleted_at` on auth
- If set and within 30 days: redirect to reactivation page
- If set and past 30 days: should already be deleted by cron

### Cron Job
- New route: `/api/cron/cleanup-deleted-users`
- Protected by `CRON_SECRET`
- Runs daily

### Clerk Integration
- On permanent deletion: call Clerk API to delete user there too
- Or: let Clerk webhook trigger our deletion (current simple flow)

---

## MVP vs Full Implementation

### MVP (Current)
- Simple delete in settings
- Confirmation modal
- Immediate hard delete via Clerk webhook
- No grace period

### Full Implementation (Post-launch)
- Complete flow above
- Grace period
- Reactivation option
- Data export

---

## Status

- [x] Backend webhook handler (MVP)
- [ ] UI: Settings Privacy section
- [ ] UI: Data impact screen
- [ ] UI: Confirmation modal
- [ ] Backend: Soft delete with grace period
- [ ] Backend: Cleanup cron job
- [ ] Email: Deletion confirmation
- [ ] Email: Final deletion notice
