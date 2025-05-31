import { createClient } from '@supabase/supabase-js';
import sgMail from '@sendgrid/mail';

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { toEmail, recipientName, inviterEmail, inviterName, inviteUrl } = req.body;

    const msg = {
      to: toEmail,
      from: 'hello@appraze.io',
      subject: 'You\'ve been invited to join Appraze',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <img src="${process.env.APP_URL}/logo.png" alt="Appraze" style="max-width: 150px; margin-bottom: 20px;" />
          <h1 style="color: #4F46E5; margin-bottom: 20px;">Welcome to Appraze!</h1>
          <p>Hello ${recipientName},</p>
          <p>${inviterName} (${inviterEmail}) has invited you to join their team on Appraze.</p>
          <p>Click the button below to accept the invitation and set up your account:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteUrl}" 
               style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Accept Invitation
            </a>
          </div>
          <p>If you didn't expect this invitation, you can safely ignore this email.</p>
          <p>Best regards,<br>The Appraze Team</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea;">
            <p style="color: #666; font-size: 12px;">
              &copy; ${new Date().getFullYear()} Appraze. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    await sgMail.send(msg);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
} 