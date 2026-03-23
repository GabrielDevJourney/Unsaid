-- Existing users already used Unsaid before onboarding existed — mark them as complete
UPDATE user_progress SET has_completed_onboarding = true;
