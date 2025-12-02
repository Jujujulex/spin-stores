// Email notification service (Mock/Base implementation)
// In production, integrate with services like SendGrid, AWS SES, or Resend

interface EmailParams {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: EmailParams): Promise<boolean> {
    // Mock implementation - log to console
    console.log('📧 Email would be sent:', { to, subject });

    // In production, use a real email service:
    /*
    try {
      await emailClient.send({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html,
      });
      return true;
    } catch (error) {
      console.error('Email send error:', error);
      return false;
    }
    */

    return true; // Mock success
}

export async function sendOrderUpdateEmail(
    userEmail: string,
    orderId: string,
    status: string
): Promise<boolean> {
    const subject = `Order Update: ${status}`;
    const html = `
    <h1>Your order has been updated</h1>
    <p>Order ID: ${orderId}</p>
    <p>New Status: ${status}</p>
  `;

    return sendEmail({ to: userEmail, subject, html });
}

export async function sendNewMessageEmail(
    userEmail: string,
    senderName: string
): Promise<boolean> {
    const subject = `New message from ${senderName}`;
    const html = `
    <h1>You have a new message</h1>
    <p>From: ${senderName}</p>
    <p>Log in to view your messages.</p>
  `;

    return sendEmail({ to: userEmail, subject, html });
}

export async function sendPriceDropAlert(
    userEmail: string,
    productTitle: string,
    oldPrice: number,
    newPrice: number
): Promise<boolean> {
    const subject = `Price Drop Alert: ${productTitle}`;
    const html = `
    <h1>Price Drop on ${productTitle}</h1>
    <p>Old Price: ${oldPrice} ETH</p>
    <p>New Price: ${newPrice} ETH</p>
    <p>Save ${oldPrice - newPrice} ETH!</p>
  `;

    return sendEmail({ to: userEmail, subject, html });
}
