/**
 * Email Templates for Creator Platform (Patreon-like)
 * Black & White Theme with Tailwind CSS
 * Compatible with Resend email API
 */
import resend from '../config/resend.js';

const generateReceiptId = () => Math.random().toString(36).substr(2, 8).toUpperCase();
const getCurrentYear = () => new Date().getFullYear();

// ============================================
// SUBSCRIBER EMAILS
// ============================================

// 1. Welcome Email (New Subscriber to Creator)
export const welcomeEmail = (userName, creatorName, membershipTier, dashboardUrl) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ${creatorName}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white m-0 p-0 font-sans">
  <div class="max-w-2xl mx-auto my-10 p-6 border border-black">
    <div class="text-center pb-6 mb-6 border-b border-black">
      <h1 class="text-3xl font-bold text-black tracking-tight m-0">WELCOME</h1>
    </div>
    <div class="py-4">
      <p class="text-black text-lg mb-5">Hello ${userName},</p>
      <p class="text-black text-base mb-5">
        Thank you for becoming a member of <strong>${creatorName}</strong>.
      </p>
      <p class="text-black text-base mb-8">
        You now have access to the <strong class="border-b-2 border-black">${membershipTier}</strong> tier.
      </p>
      <div class="text-center my-8">
        <a href="${dashboardUrl}" class="bg-black text-white no-underline text-base font-semibold py-3 px-8 border border-black inline-block hover:bg-white hover:text-black transition">
          VIEW MEMBERSHIP
        </a>
      </div>
    </div>
    <div class="pt-6 mt-6 border-t border-black text-center">
      <p class="text-black text-xs m-0">© ${getCurrentYear()} Contreon</p>
    </div>
  </div>
</body>
</html>
`;

// 2. New Post Notification
export const newPostEmail = (userName, creatorName, postTitle, postExcerpt, postUrl) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New post from ${creatorName}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white m-0 p-0 font-sans">
  <div class="max-w-2xl mx-auto my-10 p-6 border border-black">
    <div class="text-center pb-6 mb-6 border-b border-black">
      <p class="text-xs text-black uppercase tracking-wide m-0 mb-2">New Post</p>
      <h2 class="text-2xl font-bold text-black m-0">${creatorName}</h2>
    </div>
    <div class="py-4">
      <p class="text-black text-lg mb-5">Hello ${userName},</p>
      <p class="text-black text-base mb-4">
        <strong>${creatorName}</strong> just published a new post for you:
      </p>
      <div class="border-l-4 border-black pl-5 my-6">
        <h3 class="text-xl font-bold text-black m-0 mb-2">${postTitle}</h3>
        <p class="text-black text-sm opacity-80 mb-3">${postExcerpt}</p>
      </div>
      <div class="text-center my-8">
        <a href="${postUrl}" class="bg-black text-white no-underline text-base font-semibold py-3 px-8 border border-black inline-block hover:bg-white hover:text-black transition">
          READ POST
        </a>
      </div>
    </div>
    <div class="pt-6 mt-6 border-t border-black text-center">
      <p class="text-black text-xs m-0">
        You're receiving this because you're a member of ${creatorName}.
      </p>
    </div>
  </div>
</body>
</html>
`;

// 3. Payment Receipt / Monthly Membership Renewal
export const paymentReceiptEmail = (userName, creatorName, amount, paymentDate, tierName, receiptId, manageUrl) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your payment to ${creatorName}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white m-0 p-0 font-sans">
  <div class="max-w-2xl mx-auto my-10 p-6 border border-black">
    <div class="text-center pb-6 mb-6 border-b border-black">
      <h1 class="text-3xl font-bold text-black tracking-tight m-0">RECEIPT</h1>
    </div>
    <div class="py-4">
      <p class="text-black text-lg mb-5">Hello ${userName},</p>
      <p class="text-black text-base mb-5">
        Thank you for your continued support to <strong>${creatorName}</strong>.
      </p>
      <div class="my-6 border border-black p-5">
        <div class="flex justify-between items-center mb-3 pb-3 border-b border-black">
          <span class="text-black text-sm font-semibold">Membership Tier</span>
          <span class="text-black text-sm">${tierName}</span>
        </div>
        <div class="flex justify-between items-center mb-3 pb-3 border-b border-black">
          <span class="text-black text-sm font-semibold">Payment Date</span>
          <span class="text-black text-sm">${paymentDate}</span>
        </div>
        <div class="flex justify-between items-center pt-2">
          <span class="text-black text-lg font-bold">Total Charged</span>
          <span class="text-black text-xl font-bold">${amount}</span>
        </div>
      </div>
      <div class="text-center my-8">
        <a href="${manageUrl}" class="bg-black text-white no-underline text-base font-semibold py-3 px-8 border border-black inline-block hover:bg-white hover:text-black transition">
          MANAGE MEMBERSHIP
        </a>
      </div>
    </div>
    <div class="pt-6 mt-6 border-t border-black text-center">
      <p class="text-black text-xs m-0">Receipt ID: ${receiptId || generateReceiptId()}</p>
    </div>
  </div>
</body>
</html>
`;

// 4. Membership Cancellation Confirmation
export const cancellationEmail = (userName, creatorName, tierName, restoreUrl) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Membership cancelled for ${creatorName}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white m-0 p-0 font-sans">
  <div class="max-w-2xl mx-auto my-10 p-6 border border-black">
    <div class="text-center pb-6 mb-6 border-b border-black">
      <h1 class="text-3xl font-bold text-black tracking-tight m-0">CANCELLED</h1>
    </div>
    <div class="py-4">
      <p class="text-black text-lg mb-5">Hello ${userName},</p>
      <p class="text-black text-base mb-5">
        Your <strong>${tierName}</strong> membership to <strong>${creatorName}</strong> has been cancelled.
      </p>
      <p class="text-black text-base mb-8">
        You'll no longer be charged, and your access will end at the current billing period.
      </p>
      <div class="text-center my-8">
        <a href="${restoreUrl}" class="bg-black text-white no-underline text-base font-semibold py-3 px-8 border border-black inline-block hover:bg-white hover:text-black transition">
          RESTORE MEMBERSHIP
        </a>
      </div>
      <p class="text-black text-sm text-center opacity-80 mt-6">
        We're sad to see you go. You can rejoin anytime.
      </p>
    </div>
    <div class="pt-6 mt-6 border-t border-black text-center">
      <p class="text-black text-xs m-0">© ${getCurrentYear()} Contreon</p>
    </div>
  </div>
</body>
</html>
`;

// 5. Payment Failed (Grace Period Notice)
export const paymentFailedEmail = (userName, creatorName, tierName, retryDate, updatePaymentUrl) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment issue for ${creatorName}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white m-0 p-0 font-sans">
  <div class="max-w-2xl mx-auto my-10 p-6 border-2 border-black">
    <div class="text-center pb-6 mb-6 border-b border-black">
      <h1 class="text-3xl font-bold text-black tracking-tight m-0">PAYMENT FAILED</h1>
    </div>
    <div class="py-4">
      <p class="text-black text-lg mb-5">Hello ${userName},</p>
      <p class="text-black text-base mb-5">
        We couldn't process your payment for <strong>${creatorName}</strong> (${tierName} tier).
      </p>
      <div class="bg-white border-2 border-black p-5 my-6 text-center">
        <p class="text-black text-sm font-bold mb-2">⚠️ Action Required</p>
        <p class="text-black text-sm">
          Your membership access will be paused if payment isn't updated by <strong>${retryDate}</strong>.
        </p>
      </div>
      <div class="text-center my-8">
        <a href="${updatePaymentUrl}" class="bg-black text-white no-underline text-base font-semibold py-3 px-8 border border-black inline-block hover:bg-white hover:text-black transition">
          UPDATE PAYMENT
        </a>
      </div>
    </div>
    <div class="pt-6 mt-6 border-t border-black text-center">
      <p class="text-black text-xs m-0">© ${getCurrentYear()} Contreon</p>
    </div>
  </div>
</body>
</html>
`;

// 6. Membership Upgrade Confirmation
export const upgradeEmail = (userName, creatorName, oldTier, newTier, newBenefits, benefitsUrl) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Membership upgraded for ${creatorName}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white m-0 p-0 font-sans">
  <div class="max-w-2xl mx-auto my-10 p-6 border border-black">
    <div class="text-center pb-6 mb-6 border-b border-black">
      <h1 class="text-3xl font-bold text-black tracking-tight m-0">UPGRADED</h1>
    </div>
    <div class="py-4">
      <p class="text-black text-lg mb-5">Hello ${userName},</p>
      <p class="text-black text-base mb-5">
        You've upgraded from <strong>${oldTier}</strong> to <strong>${newTier}</strong> for <strong>${creatorName}</strong>!
      </p>
      <div class="bg-white border border-black p-5 my-6">
        <p class="text-black text-sm font-bold mb-3">New benefits include:</p>
        <ul class="text-black text-sm list-disc pl-5 space-y-1">
          ${Array.isArray(newBenefits) ? newBenefits.map(benefit => `<li>${benefit}</li>`).join('') : newBenefits}
        </ul>
      </div>
      <div class="text-center my-8">
        <a href="${benefitsUrl}" class="bg-black text-white no-underline text-base font-semibold py-3 px-8 border border-black inline-block hover:bg-white hover:text-black transition">
          VIEW BENEFITS
        </a>
      </div>
    </div>
    <div class="pt-6 mt-6 border-t border-black text-center">
      <p class="text-black text-xs m-0">© ${getCurrentYear()} Contreon</p>
    </div>
  </div>
</body>
</html>
`;

// 7. Creator Announcement Email
export const announcementEmail = (userName, creatorName, announcementTitle, announcementMessage, ctaUrl, ctaText) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Announcement from ${creatorName}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white m-0 p-0 font-sans">
  <div class="max-w-2xl mx-auto my-10 p-6 border border-black">
    <div class="text-center pb-6 mb-6 border-b border-black">
      <h2 class="text-2xl font-bold text-black m-0">${creatorName}</h2>
      <p class="text-xs text-black uppercase tracking-wide mt-2">Announcement</p>
    </div>
    <div class="py-4">
      <p class="text-black text-lg mb-5">Hello ${userName},</p>
      <h3 class="text-xl font-bold text-black mb-4">${announcementTitle}</h3>
      <p class="text-black text-base leading-relaxed mb-6">${announcementMessage}</p>
      ${ctaUrl && ctaText ? `
      <div class="text-center my-8">
        <a href="${ctaUrl}" class="bg-black text-white no-underline text-base font-semibold py-3 px-8 border border-black inline-block hover:bg-white hover:text-black transition">
          ${ctaText}
        </a>
      </div>
      ` : ''}
    </div>
    <div class="pt-6 mt-6 border-t border-black text-center">
      <p class="text-black text-xs m-0">© ${getCurrentYear()} Contreon</p>
    </div>
  </div>
</body>
</html>
`;

// ============================================
// ACCOUNT & AUTH EMAILS
// ============================================

// 8. Welcome Email (New User Signup)
export const signupWelcomeEmail = (userName, email, loginUrl) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Contreon</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white m-0 p-0 font-sans">
  <div class="max-w-2xl mx-auto my-10 p-6 border border-black">
    <div class="text-center pb-6 mb-6 border-b border-black">
      <h1 class="text-3xl font-bold text-black tracking-tight m-0">WELCOME</h1>
      <p class="text-sm text-black mt-2">To Contreon</p>
    </div>
    <div class="py-4">
      <p class="text-black text-lg mb-5">Hello ${userName},</p>
      <p class="text-black text-base mb-5">
        Thank you for joining <strong>Contreon</strong>! We're excited to have you on board.
      </p>
      <p class="text-black text-base mb-8">
        You can now explore creators, subscribe to their work, and connect with your favorite communities.
      </p>
      <div class="text-center my-8">
        <a href="${loginUrl}" class="bg-black text-white no-underline text-base font-semibold py-3 px-8 border border-black inline-block hover:bg-white hover:text-black transition">
          GET STARTED
        </a>
      </div>
      <div class="bg-gray-50 border border-gray-200 p-4 my-6">
        <p class="text-black text-sm mb-2"><strong>Your account details:</strong></p>
        <p class="text-black text-sm">Email: ${email}</p>
      </div>
    </div>
    <div class="pt-6 mt-6 border-t border-black text-center">
      <p class="text-black text-xs m-0">
        Having trouble? Contact us at support@contreon.com
      </p>
      <p class="text-black text-xs m-0 mt-2">© ${getCurrentYear()} Contreon</p>
    </div>
  </div>
</body>
</html>
`;

// 9. Password Reset Email
export const passwordResetEmail = (userName, resetToken, resetUrl, expiryHours) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your Contreon password</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white m-0 p-0 font-sans">
  <div class="max-w-2xl mx-auto my-10 p-6 border border-black">
    <div class="text-center pb-6 mb-6 border-b border-black">
      <h1 class="text-3xl font-bold text-black tracking-tight m-0">RESET PASSWORD</h1>
    </div>
    <div class="py-4">
      <p class="text-black text-lg mb-5">Hello ${userName},</p>
      <p class="text-black text-base mb-5">
        We received a request to reset your password. Click the button below to create a new password.
      </p>
      <div class="bg-gray-50 border border-gray-200 p-4 my-6">
        <p class="text-black text-sm">
          <strong>Note:</strong> This link will expire in ${expiryHours || 1} hour(s).
        </p>
        <p class="text-black text-sm mt-2">
          If you didn't request this, please ignore this email.
        </p>
      </div>
      <div class="text-center my-8">
        <a href="${resetUrl}" class="bg-black text-white no-underline text-base font-semibold py-3 px-8 border border-black inline-block hover:bg-white hover:text-black transition">
          RESET PASSWORD
        </a>
      </div>
      <p class="text-black text-sm text-center opacity-80 mt-6">
        Or copy and paste this link in your browser:<br/>
        <span class="text-xs break-all">${resetUrl}</span>
      </p>
    </div>
    <div class="pt-6 mt-6 border-t border-black text-center">
      <p class="text-black text-xs m-0">© ${getCurrentYear()} Contreon</p>
    </div>
  </div>
</body>
</html>
`;

// 10. Password Reset Confirmation
export const passwordResetConfirmationEmail = (userName, accountUrl) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password reset successful</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white m-0 p-0 font-sans">
  <div class="max-w-2xl mx-auto my-10 p-6 border border-black">
    <div class="text-center pb-6 mb-6 border-b border-black">
      <h1 class="text-3xl font-bold text-black tracking-tight m-0">PASSWORD RESET</h1>
      <p class="text-sm text-black mt-2">Successful</p>
    </div>
    <div class="py-4">
      <p class="text-black text-lg mb-5">Hello ${userName},</p>
      <p class="text-black text-base mb-5">
        Your password has been successfully reset.
      </p>
      <p class="text-black text-base mb-8">
        If you didn't make this change, please contact us immediately.
      </p>
      <div class="text-center my-8">
        <a href="${accountUrl}" class="bg-black text-white no-underline text-base font-semibold py-3 px-8 border border-black inline-block hover:bg-white hover:text-black transition">
          GO TO ACCOUNT
        </a>
      </div>
    </div>
    <div class="pt-6 mt-6 border-t border-black text-center">
      <p class="text-black text-xs m-0">© ${getCurrentYear()} Contreon</p>
    </div>
  </div>
</body>
</html>
`;

// ============================================
// CREATOR EMAILS
// ============================================

// 11. New Subscriber Notification (to Creator)
export const newSubscriberEmail = (creatorName, subscriberName, tierName, tierPrice, manageUrl) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New subscriber!</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white m-0 p-0 font-sans">
  <div class="max-w-2xl mx-auto my-10 p-6 border border-black">
    <div class="text-center pb-6 mb-6 border-b border-black">
      <h1 class="text-3xl font-bold text-black tracking-tight m-0">NEW SUBSCRIBER</h1>
    </div>
    <div class="py-4">
      <p class="text-black text-lg mb-5">Hello ${creatorName},</p>
      <p class="text-black text-base mb-5">
        Great news! <strong>${subscriberName}</strong> just subscribed to your <strong>${tierName}</strong> tier.
      </p>
      <div class="my-6 border border-black p-5">
        <div class="flex justify-between items-center mb-3 pb-3 border-b border-black">
          <span class="text-black text-sm font-semibold">New Subscriber</span>
          <span class="text-black text-sm">${subscriberName}</span>
        </div>
        <div class="flex justify-between items-center mb-3 pb-3 border-b border-black">
          <span class="text-black text-sm font-semibold">Tier</span>
          <span class="text-black text-sm">${tierName}</span>
        </div>
        <div class="flex justify-between items-center pt-2">
          <span class="text-black text-lg font-bold">Monthly Revenue</span>
          <span class="text-black text-xl font-bold">${tierPrice}</span>
        </div>
      </div>
      <div class="text-center my-8">
        <a href="${manageUrl}" class="bg-black text-white no-underline text-base font-semibold py-3 px-8 border border-black inline-block hover:bg-white hover:text-black transition">
          VIEW SUBSCRIBERS
        </a>
      </div>
    </div>
    <div class="pt-6 mt-6 border-t border-black text-center">
      <p class="text-black text-xs m-0">© ${getCurrentYear()} Contreon</p>
    </div>
  </div>
</body>
</html>
`;

// 12. Subscription Cancelled Notification (to Creator)
export const subscriberCancelledEmail = (creatorName, subscriberName, tierName, manageUrl) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Subscription cancelled</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white m-0 p-0 font-sans">
  <div class="max-w-2xl mx-auto my-10 p-6 border border-black">
    <div class="text-center pb-6 mb-6 border-b border-black">
      <h1 class="text-3xl font-bold text-black tracking-tight m-0">SUBSCRIPTION ENDED</h1>
    </div>
    <div class="py-4">
      <p class="text-black text-lg mb-5">Hello ${creatorName},</p>
      <p class="text-black text-base mb-5">
        <strong>${subscriberName}</strong> has cancelled their <strong>${tierName}</strong> subscription.
      </p>
      <p class="text-black text-base mb-8">
        They will retain access until the end of their billing period.
      </p>
      <div class="text-center my-8">
        <a href="${manageUrl}" class="bg-black text-white no-underline text-base font-semibold py-3 px-8 border border-black inline-block hover:bg-white hover:text-black transition">
          VIEW SUBSCRIBERS
        </a>
      </div>
    </div>
    <div class="pt-6 mt-6 border-t border-black text-center">
      <p class="text-black text-xs m-0">© ${getCurrentYear()} Contreon</p>
    </div>
  </div>
</body>
</html>
`;

// 13. Payout Notification (to Creator)
export const payoutEmail = (creatorName, amount, date, balance, payoutUrl) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payout processed</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white m-0 p-0 font-sans">
  <div class="max-w-2xl mx-auto my-10 p-6 border border-black">
    <div class="text-center pb-6 mb-6 border-b border-black">
      <h1 class="text-3xl font-bold text-black tracking-tight m-0">PAYOUT</h1>
      <p class="text-sm text-black mt-2">Processed</p>
    </div>
    <div class="py-4">
      <p class="text-black text-lg mb-5">Hello ${creatorName},</p>
      <p class="text-black text-base mb-5">
        Your payout of <strong>${amount}</strong> has been processed.
      </p>
      <div class="my-6 border border-black p-5">
        <div class="flex justify-between items-center mb-3 pb-3 border-b border-black">
          <span class="text-black text-sm font-semibold">Amount</span>
          <span class="text-black text-xl font-bold">${amount}</span>
        </div>
        <div class="flex justify-between items-center mb-3 pb-3 border-b border-black">
          <span class="text-black text-sm font-semibold">Processed Date</span>
          <span class="text-black text-sm">${date}</span>
        </div>
        <div class="flex justify-between items-center pt-2">
          <span class="text-black text-sm font-semibold">Available Balance</span>
          <span class="text-black text-sm">${balance}</span>
        </div>
      </div>
      <div class="text-center my-8">
        <a href="${payoutUrl}" class="bg-black text-white no-underline text-base font-semibold py-3 px-8 border border-black inline-block hover:bg-white hover:text-black transition">
          VIEW DETAILS
        </a>
      </div>
    </div>
    <div class="pt-6 mt-6 border-t border-black text-center">
      <p class="text-black text-xs m-0">© ${getCurrentYear()} Contreon</p>
    </div>
  </div>
</body>
</html>
`;

// ============================================
// HELPER FUNCTION
// ============================================

/**
 * Send an email using Resend
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - Email HTML content
 * @returns {Promise} Resend response
 */
export const sendEmail = async (to, subject, html) => {
  try {
    const response = await resend.emails.send({
      from: 'contreon@resend.dev',
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });
    console.log("Email Response : ",response)
    return response;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// ============================================
// USAGE EXAMPLE
// ============================================
/*
import { 
  welcomeEmail, 
  newPostEmail, 
  paymentReceiptEmail, 
  signupWelcomeEmail,
  passwordResetEmail,
  newSubscriberEmail,
  sendEmail 
} from './emails/templates.js';

// Send welcome email to new subscriber
await sendEmail(
  'subscriber@example.com',
  'Welcome to CreatorName!',
  welcomeEmail('John', 'CreatorName', 'Supporter Tier', 'https://contreon.com/members')
);

// Send password reset
await sendEmail(
  'user@example.com',
  'Reset your Contreon password',
  passwordResetEmail('John', 'token123', 'https://contreon.com/reset/token123', 1)
);

// Notify creator of new subscriber
await sendEmail(
  'creator@example.com',
  'New subscriber!',
  newSubscriberEmail('CreatorName', 'John Doe', 'Premium', '$10', 'https://contreon.com/creator/subscribers')
);
*/