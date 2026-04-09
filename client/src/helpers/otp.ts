export type OtpChallengePurpose = 'registration_verification' | 'password_reset';
export type OtpChallengeChannel = 'email' | 'sms';

export type OtpChallengeContext = {
  challengeToken: string;
  purpose: OtpChallengePurpose;
  channel: OtpChallengeChannel;
  maskedDestination: string;
  expiresInSeconds: number;
  resendAvailableInSeconds: number;
  attemptsRemaining: number;
  identifier?: string;
  preferredContactMethod?: OtpChallengeChannel;
};

const OTP_CONTEXT_KEY = 'flatease.otp.challenge';

export const storeOtpChallengeContext = (context: OtpChallengeContext) => {
  sessionStorage.setItem(OTP_CONTEXT_KEY, JSON.stringify(context));
};

export const getOtpChallengeContext = (): OtpChallengeContext | null => {
  const raw = sessionStorage.getItem(OTP_CONTEXT_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<OtpChallengeContext>;

    if (!parsed.challengeToken || !parsed.purpose || !parsed.channel) {
      return null;
    }

    return {
      challengeToken: String(parsed.challengeToken),
      purpose: parsed.purpose as OtpChallengePurpose,
      channel: parsed.channel as OtpChallengeChannel,
      maskedDestination: String(parsed.maskedDestination ?? ''),
      expiresInSeconds: Number(parsed.expiresInSeconds ?? 0),
      resendAvailableInSeconds: Number(parsed.resendAvailableInSeconds ?? 0),
      attemptsRemaining: Number(parsed.attemptsRemaining ?? 0),
      identifier: parsed.identifier ? String(parsed.identifier) : undefined,
      preferredContactMethod: parsed.preferredContactMethod as OtpChallengeChannel | undefined,
    };
  } catch {
    return null;
  }
};

export const clearOtpChallengeContext = () => {
  sessionStorage.removeItem(OTP_CONTEXT_KEY);
};