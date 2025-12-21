import React from "react";
import { Link } from "react-router-dom";
import { XCircle } from "lucide-react";

const PaymentFailed = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 px-6">
      <XCircle className="text-red-500" size={80} />

      <h1 className="text-3xl font-bold text-red-700 mt-4">
        Payment Failed
      </h1>

      <p className="text-gray-700 text-center mt-2 max-w-md">
        Your payment was not completed. No amount has been deducted.
        Please try again or choose a different payment method.
      </p>

      <div className="flex gap-4 mt-8">
        <Link
          to="/payment"
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg shadow"
        >
          Try Again
        </Link>

        <Link
          to="/cart"
          className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg shadow"
        >
          Go to Cart
        </Link>

        <Link
          to="/"
          className="px-6 py-3 bg-white border border-gray-400 text-gray-700 font-semibold rounded-lg shadow"
        >
          Home
        </Link>
      </div>
    </div>
  );
};

export default PaymentFailed;
