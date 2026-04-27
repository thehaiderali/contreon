// emailTemplates.js

/**
 * Email Templates for Creator Platform (Patreon-like)
 * Black & White Theme with Tailwind CSS
 * Compatible with Resend email API
 */

// Helper function to generate random receipt ID
const generateReceiptId = () => Math.random().toString(36).substr(2, 8).toUpperCase();

// 1. Welcome Email (New Member)
export const welcomeEmail = (userName, creatorName, membershipTier) => `
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
        <a href="https://yourplatform.com/members" class="bg-black text-white no-underline text-base font-semibold py-3 px-8 border border-black inline-block hover:bg-white hover:text-black transition">
          VIEW MEMBERSHIP
        </a>
      </div>
    </div>
    <div class="pt-6 mt-6 border-t border-black text-center">
      <p class="text-black text-xs m-0">© 2025 Your Platform — Black & White</p>
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
export const paymentReceiptEmail = (userName, creatorName, amount, paymentDate, tierName) => `
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
        <a href="https://yourplatform.com/membership" class="bg-black text-white no-underline text-base font-semibold py-3 px-8 border border-black inline-block hover:bg-white hover:text-black transition">
          MANAGE MEMBERSHIP
        </a>
      </div>
    </div>
    <div class="pt-6 mt-6 border-t border-black text-center">
      <p class="text-black text-xs m-0">Receipt ID: ${generateReceiptId()}</p>
    </div>
  </div>
</body>
</html>
`;

// 4. Membership Cancellation Confirmation
export const cancellationEmail = (userName, creatorName, tierName) => `
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
        <a href="https://yourplatform.com/restore/${creatorName}" class="bg-black text-white no-underline text-base font-semibold py-3 px-8 border border-black inline-block hover:bg-white hover:text-black transition">
          RESTORE MEMBERSHIP
        </a>
      </div>
      <p class="text-black text-sm text-center opacity-80 mt-6">
        We're sad to see you go. You can rejoin anytime.
      </p>
    </div>
    <div class="pt-6 mt-6 border-t border-black text-center">
      <p class="text-black text-xs m-0">© 2025 Your Platform — Black & White</p>
    </div>
  </div>
</body>
</html>
`;

// 5. Payment Failed (Grace Period Notice)
export const paymentFailedEmail = (userName, creatorName, tierName, retryDate) => `
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
        <a href="https://yourplatform.com/billing" class="bg-black text-white no-underline text-base font-semibold py-3 px-8 border border-black inline-block hover:bg-white hover:text-black transition">
          UPDATE PAYMENT
        </a>
      </div>
    </div>
    <div class="pt-6 mt-6 border-t border-black text-center">
      <p class="text-black text-xs m-0">© 2025 Your Platform — Black & White</p>
    </div>
  </div>
</body>
</html>
`;

// 6. Bonus: Membership Upgrade Confirmation
export const upgradeEmail = (userName, creatorName, oldTier, newTier, newBenefits) => `
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
          ${newBenefits.map(benefit => `<li>${benefit}</li>`).join('')}
        </ul>
      </div>
      <div class="text-center my-8">
        <a href="https://yourplatform.com/membership" class="bg-black text-white no-underline text-base font-semibold py-3 px-8 border border-black inline-block hover:bg-white hover:text-black transition">
          VIEW BENEFITS
        </a>
      </div>
    </div>
    <div class="pt-6 mt-6 border-t border-black text-center">
      <p class="text-black text-xs m-0">© 2025 Your Platform — Black & White</p>
    </div>
  </div>
</body>
</html>
`;

// 7. Bonus: Creator Announcement Email
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
      <p class="text-black text-xs m-0">© 2025 Your Platform — Black & White</p>
    </div>
  </div>
</body>
</html>
`;

// Usage Example with Resend:
/*
import { Resend } from 'resend';
import { welcomeEmail, newPostEmail, paymentReceiptEmail } from './emailTemplates.js';

const resend = new Resend('re_YourApiKey');

// Send welcome email
await resend.emails.send({
  from: 'noreply@yourplatform.com',
  to: 'member@example.com',
  subject: 'Welcome to CreatorName!',
  html: welcomeEmail('John', 'CreatorName', 'Supporter Tier')
});

// Send new post notification
await resend.emails.send({
  from: 'noreply@yourplatform.com',
  to: 'member@example.com',
  subject: 'New post from CreatorName',
  html: newPostEmail('John', 'CreatorName', 'My Latest Artwork', 'Check out my new painting...', 'https://yourplatform.com/posts/123')
});
*/