// GoMailer email marketing integration
// API key and list ID are loaded from environment variables.
// To find the List ID: GoMailer dashboard → Lists → click your list → copy the ID from the URL.

const API_KEY = process.env.GOMAILER_API_KEY || '';
const LIST_ID  = process.env.GOMAILER_LIST_ID  || '';
const BASE_URL = 'https://app.go-mailer.com/api';

export interface GoMailerResult {
  success: boolean;
  message?: string;
}

export async function addSubscriber(email: string, firstName?: string): Promise<GoMailerResult> {
  if (!API_KEY || !LIST_ID) {
    console.warn('[GoMailer] GOMAILER_API_KEY or GOMAILER_LIST_ID not set — skipping');
    return { success: false, message: 'GoMailer not configured' };
  }

  try {
    const res = await fetch(`${BASE_URL}/subscribers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        email,
        list_id: LIST_ID,
        ...(firstName ? { first_name: firstName } : {}),
        status: 'active',
      }),
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error('[GoMailer] API error:', res.status, body);
      return { success: false, message: `API error ${res.status}` };
    }

    return { success: true };
  } catch (err) {
    console.error('[GoMailer] Network error:', err);
    return { success: false, message: 'Network error' };
  }
}
