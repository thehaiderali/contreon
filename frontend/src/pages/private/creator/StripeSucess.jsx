import React from 'react'
import { Link } from 'react-router'
import { CheckCircle } from 'lucide-react'

const StripeSuccess = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="text-center max-w-md mx-auto px-4">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Welcome aboard! 🎉
        </h1>
        
        <p className="text-gray-600 mb-8">
          Your Stripe account has been successfully connected. You're now ready to start selling subscriptions.
        </p>

        {/* Action Button */}
        <Link to="/creator/">
          <button className="px-6 py-3 bg-linear-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg">
            Go to Dashboard →
          </button>
        </Link>
      </div>
    </div>
  )
}

export default StripeSuccess