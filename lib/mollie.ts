import { createMollieClient } from '@mollie/api-client';

let mollieClientInstance: any = null;

export const getMollieClient = () => {
  if (!mollieClientInstance) {
    const apiKey = process.env.MOLLIE_API_KEY;
    if (!apiKey) {
      throw new Error('MOLLIE_API_KEY is not defined');
    }
    mollieClientInstance = createMollieClient({ apiKey });
  }
  return mollieClientInstance;
};

export const getMollieClientForUser = (accessToken: string) => {
  return createMollieClient({ accessToken });
};

export const MOLLIE_AUTH_URL = 'https://www.mollie.com/oauth2/authorize';
export const MOLLIE_TOKEN_URL = 'https://api.mollie.com/oauth2/tokens';

export const getMollieAuthUrl = (state: string) => {
  const params = new URLSearchParams({
    client_id: process.env.MOLLIE_CLIENT_ID || '',
    redirect_uri: `${process.env.APP_URL}/api/auth/mollie/callback`,
    state,
    scope: 'payments.read payments.write profiles.read profiles.write organizations.read organizations.write',
    response_type: 'code',
    approval_prompt: 'auto',
  });
  return `${MOLLIE_AUTH_URL}?${params.toString()}`;
};
