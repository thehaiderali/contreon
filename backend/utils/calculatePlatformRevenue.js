// utils/platform-fees.js
export async function calculatePlatformRevenue(connectedAccountId, dateRange) {
  const balance = await stripe.balanceTransactions.list({
    type: 'application_fee',
    created: {
      gte: dateRange.start,
      lte: dateRange.end,
    },
  }, {
    stripeAccount: connectedAccountId,
  });
  
  let totalFees = 0;
  balance.data.forEach(transaction => {
    totalFees += transaction.amount;
  });
  
  return {
    totalFees: totalFees / 100, 
    currency: 'usd',
    transactionCount: balance.data.length,
  };
}