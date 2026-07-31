import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { name, email } = (req.body ?? {}) as { name?: string; email?: string };
  if (typeof email !== 'string' || !email.includes('@')) {
    res.status(400).json({ error: 'A valid email is required' });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not set');
    res.status(500).json({ error: 'Email service is not configured' });
    return;
  }

  const firstName = typeof name === 'string' && name.trim() ? name.trim() : 'there';

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      // Resend's shared test sender — works with no domain setup.
      // Swap to something like 'EmpowHER Strength <hello@empowherstrength.us>'
      // once your domain is verified in the Resend dashboard.
      from: 'EmpowHER Strength <onboarding@resend.dev>',
      to: email,
      subject: 'Your Free Guide from EmpowHER Strength',
      html: `
        <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; color: #1a1a1a; line-height: 1.6;">
          <h1 style="font-size: 22px; margin-bottom: 16px;">Hi ${firstName},</h1>
          <p>Thanks for requesting the EmpowHER Strength free guide! We're putting the finishing touches on the full 26-page PDF — myths debunked, form basics, progressive overload explained, and how to structure your week — and it'll land in your inbox shortly.</p>
          <p>In the meantime, if you have questions about training, just reply to this email. Melody and Courtney read every one.</p>
          <p style="margin-top: 32px;">— The EmpowHER Strength Team</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend send failed:', error);
      res.status(502).json({ error: 'Failed to send email' });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Resend send failed:', err);
    res.status(502).json({ error: 'Failed to send email' });
  }
}
