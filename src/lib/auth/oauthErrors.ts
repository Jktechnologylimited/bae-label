const MESSAGES: Record<string, string> = {
  google_not_configured: "Google sign-in isn't set up yet — use email and password instead.",
  google_denied: "Google sign-in was cancelled.",
  google_invalid_response: "Something went wrong with Google sign-in. Please try again.",
  google_expired_state: "That sign-in link expired. Please try again.",
  google_state_mismatch: "Something went wrong verifying that sign-in request. Please try again.",
  google_token_exchange_failed: "Google couldn't confirm your sign-in. Please try again.",
  google_profile_fetch_failed: "Couldn't retrieve your Google profile. Please try again.",
  google_no_email: "Your Google account has no email address to sign in with.",
  google_account_error: "Something went wrong creating your account. Please try again.",
  google_unexpected_error: "Something unexpected went wrong with Google sign-in. Please try again.",
};

export function oauthErrorMessage(code: string | null): string | null {
  if (!code) return null;
  return MESSAGES[code] ?? "Something went wrong signing in. Please try again.";
}
