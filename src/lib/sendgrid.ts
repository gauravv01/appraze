import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
sgMail.setApiKey(import.meta.env.VITE_SENDGRID_API_KEY || '');

const SENDER_EMAIL = 'hello@appraze.io';
const APP_NAME = 'Appraze';
const APP_URL = import.meta.env.VITE_APP_URL || 'https://appraze.io';

/**
 * Send a welcome email to a new user
 */
export const sendWelcomeEmail = async (email: string, name: string) => {
  const msg = {
    to: email,
    from: SENDER_EMAIL,
    subject: `Welcome to ${APP_NAME}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <img src="${APP_URL}/logo.png" alt="${APP_NAME}" style="max-width: 150px; margin-bottom: 20px;" />
        <h1 style="color: #4F46E5; margin-bottom: 20px;">Welcome to ${APP_NAME}!</h1>
        <p>Hello ${name},</p>
        <p>Thank you for creating an account with ${APP_NAME}. We're excited to have you on board!</p>
        <p>With ${APP_NAME}, you can:</p>
        <ul>
          <li>Create professional performance reviews</li>
          <li>Manage employee feedback</li>
          <li>Track performance over time</li>
          <li>Download reviews in multiple formats</li>
        </ul>
        <p>If you have any questions, feel free to reply to this email.</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea;">
          <p style="color: #666; font-size: 12px;">
            &copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error };
  }
};

/**
 * Send a password reset email with a reset link
 */
export const sendPasswordResetEmail = async (email: string, resetLink: string) => {
  const msg = {
    to: email,
    from: SENDER_EMAIL,
    subject: `Reset Your ${APP_NAME} Password`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <img src="${APP_URL}/logo.png" alt="${APP_NAME}" style="max-width: 150px; margin-bottom: 20px;" />
        <h1 style="color: #4F46E5; margin-bottom: 20px;">Reset Your Password</h1>
        <p>We received a request to reset your password for ${APP_NAME}.</p>
        <p>To reset your password, click the button below:</p>
        <div style="margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #4F46E5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Reset Password</a>
        </div>
        <p>If you didn't request a password reset, please ignore this email.</p>
        <p>This password reset link will expire in 1 hour for security reasons.</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea;">
          <p style="color: #666; font-size: 12px;">
            &copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error };
  }
};

/**
 * Send email confirmation that password was changed
 */
export const sendPasswordChangedEmail = async (email: string) => {
  const msg = {
    to: email,
    from: SENDER_EMAIL,
    subject: `Your ${APP_NAME} Password Has Been Changed`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <img src="${APP_URL}/logo.png" alt="${APP_NAME}" style="max-width: 150px; margin-bottom: 20px;" />
        <h1 style="color: #4F46E5; margin-bottom: 20px;">Password Changed Successfully</h1>
        <p>Your password for ${APP_NAME} has been changed successfully.</p>
        <p>If you did not make this change, please contact us immediately.</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea;">
          <p style="color: #666; font-size: 12px;">
            &copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error('Error sending password changed email:', error);
    return { success: false, error };
  }
};

/**
 * Send review completion notification
 */
export const sendReviewCompletionEmail = async (
  email: string, 
  employeeName: string, 
  reviewPeriod: string,
  reviewId: string
) => {
  const reviewLink = `${APP_URL}/dashboard/reviews/${reviewId}`;
  
  const msg = {
    to: email,
    from: SENDER_EMAIL,
    subject: `${employeeName}'s Performance Review is Complete`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <img src="${APP_URL}/logo.png" alt="${APP_NAME}" style="max-width: 150px; margin-bottom: 20px;" />
        <h1 style="color: #4F46E5; margin-bottom: 20px;">Performance Review Completed</h1>
        <p>The performance review for ${employeeName} (${reviewPeriod}) has been completed successfully.</p>
        <p>You can view and download the review by clicking the button below:</p>
        <div style="margin: 30px 0;">
          <a href="${reviewLink}" style="background-color: #4F46E5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">View Review</a>
        </div>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea;">
          <p style="color: #666; font-size: 12px;">
            &copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error('Error sending review completion email:', error);
    return { success: false, error };
  }
};

/**
 * Send a team invitation email with an invite link
 */
export const sendTeamInviteEmail = async (
  recipientEmail: string,
  recipientName: string,
  senderEmail: string,
  senderName: string,
  inviteUrl: string
): Promise<void> => {
  // In production, replace this with actual SendGrid API call
  console.log('Sending team invitation email:');
  console.log(`To: ${recipientName} <${recipientEmail}>`);
  console.log(`From: ${senderName} <${senderEmail}>`);
  console.log(`Invite URL: ${inviteUrl}`);
  
  // This would be replaced with actual API call in production
  // Example SendGrid implementation:
  /*
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
  const msg = {
    to: recipientEmail,
    from: 'noreply@yourdomain.com',
    subject: `${senderName} invited you to join their team on PerformAI`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>You've been invited to join a team</h2>
        <p>Hello ${recipientName},</p>
        <p>${senderName} (${senderEmail}) has invited you to join their team on PerformAI.</p>
        <p>Click the button below to accept this invitation:</p>
        <p>
          <a href="${inviteUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 4px;">
            Accept Invitation
          </a>
        </p>
        <p>If you have any questions, please contact the person who invited you.</p>
        <p>Best regards,<br>The PerformAI Team</p>
      </div>
    `,
  };
  
  await sgMail.send(msg);
  */
  
  // For now, we'll simulate a successful email send
  return Promise.resolve();
}; 