/**
 * Email Templates for Creator Platform (Patreon-like)
 * Black & White Theme with Tailwind CSS
 * Compatible with Resend email API
 */
import { envConfig } from '../config/env.js';
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
      from: envConfig.EMAIL_FROM,
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


export const postCreationEmailTemplate = (creatorName, postTitle, postId, postUrl) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Post Created Successfully</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * {
          font-family: 'Inter', sans-serif;
        }
      </style>
    </head>
    <body class="bg-black m-0 p-0">
      <div class="max-w-2xl mx-auto my-8 bg-white rounded-none overflow-hidden">
        <!-- Header - Black -->
        <div class="bg-black text-white px-8 py-12 text-center border-b border-gray-200">
          <div class="text-4xl font-extrabold tracking-tight">CONTREON</div>
          <p class="text-gray-400 mt-2 text-sm">Creator Platform</p>
        </div>
        
        <!-- Content -->
        <div class="bg-white text-black px-8 py-12">
          <h1 class="text-3xl font-bold mb-2">Hello ${creatorName}! 👋</h1>
          <p class="text-gray-600 text-base leading-relaxed mb-6">
            Your post has been successfully created and is now live on Contreon.
          </p>
          
          <!-- Post Card -->
          <div class="bg-gray-50 border border-gray-200 p-6 my-6">
            <p class="text-xs text-gray-500 uppercase tracking-wide mb-2">Post Created</p>
            <h2 class="text-2xl font-bold text-black mb-2">"${postTitle}"</h2>
            <p class="text-xs text-gray-400 font-mono">ID: ${postId}</p>
          </div>
          
          <!-- Info Grid -->
          <div class="border border-gray-200 divide-y divide-gray-200 my-6">
            <div class="flex py-3 px-4">
              <span class="w-1/3 text-sm font-medium text-gray-600">Status</span>
              <span class="w-2/3 text-sm text-black font-semibold">✓ Published</span>
            </div>
            <div class="flex py-3 px-4">
              <span class="w-1/3 text-sm font-medium text-gray-600">Created</span>
              <span class="w-2/3 text-sm text-black">${new Date().toLocaleString()}</span>
            </div>
            <div class="flex py-3 px-4">
              <span class="w-1/3 text-sm font-medium text-gray-600">Post ID</span>
              <span class="w-2/3 text-sm font-mono text-black">${postId}</span>
            </div>
          </div>
          
          <!-- Button -->
          <div class="text-center my-8">
            <a href="${postUrl}" class="inline-block bg-black text-white px-6 py-3 text-base font-semibold no-underline hover:bg-gray-800 transition-colors">
              View Your Post →
            </a>
          </div>
          
          <!-- Tips Box -->
          <div class="bg-gray-50 border border-gray-200 p-6 my-6">
            <p class="font-semibold text-black mb-3">💡 Pro Tips:</p>
            <ul class="space-y-2 text-sm text-gray-600">
              <li class="flex items-start">
                <span class="mr-2">•</span>
                Share your post on social media platforms
              </li>
              <li class="flex items-start">
                <span class="mr-2">•</span>
                Engage with comments from your audience
              </li>
              <li class="flex items-start">
                <span class="mr-2">•</span>
                Track your post performance in dashboard
              </li>
              <li class="flex items-start">
                <span class="mr-2">•</span>
                Promote your post through newsletters
              </li>
            </ul>
          </div>
          
          <p class="text-gray-600 my-6">Keep creating amazing content! ✨</p>
          
          <p class="text-gray-600">
            Best regards,<br>
            <strong class="text-black">The Contreon Team</strong>
          </p>
        </div>
        
        <!-- Footer - Black -->
        <div class="bg-black text-gray-400 px-8 py-8 text-center text-xs">
          <p>© 2024 Contreon. All rights reserved.</p>
          <div class="flex justify-center gap-4 mt-4">
            <a href="#" class="text-gray-400 hover:text-white no-underline text-xs">Twitter</a>
            <a href="#" class="text-gray-400 hover:text-white no-underline text-xs">Instagram</a>
            <a href="#" class="text-gray-400 hover:text-white no-underline text-xs">Facebook</a>
          </div>
          <p class="mt-6 text-gray-500 text-xs">
            You're receiving this email because you created a post on Contreon.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};





export const creatorRecommendationTemplate = (currentCreatorName, recommendedCreatorName) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Someone Recommended You</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-black m-0 p-0">
      <div class="max-w-2xl mx-auto my-8 bg-white rounded-none overflow-hidden">
        <!-- Header -->
        <div class="bg-black text-white px-8 py-12 text-center">
          <div class="text-4xl font-extrabold tracking-tight">CONTREON</div>
        </div>
        
        <!-- Content -->
        <div class="bg-white text-black px-8 py-12 text-center">
          <div class="text-7xl mb-6">⭐</div>
          
          <h1 class="text-3xl font-bold mb-4">Hey ${currentCreatorName}!</h1>
          
          <p class="text-xl text-gray-700 mb-6">
            <span class="font-semibold text-black">${recommendedCreatorName}</span> recommended you on Contreon
          </p>
          
          <div class="bg-gray-50 border border-gray-200 p-6 my-8">
            <p class="text-gray-600">
              Someone thinks you're doing great work and wants others to know about you!
            </p>
          </div>
          
          <a href="#" class="inline-block bg-black text-white px-8 py-3 text-base font-semibold no-underline">
            Check Your Profile →
          </a>
        </div>
        
        <!-- Footer -->
        <div class="bg-black text-gray-500 px-8 py-6 text-center text-xs">
          <p>© 2024 Contreon</p>
        </div>
      </div>
    </body>
    </html>
  `;
};