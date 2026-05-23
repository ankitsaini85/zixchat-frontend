"use client";

import { useState } from "react";
import { X, Check, Zap, Shield, Heart } from "lucide-react";
import { getToken } from "@/lib/auth";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  trialExpired: boolean;
}

export default function SubscriptionModal({ isOpen, onClose, trialExpired }: SubscriptionModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"weekly" | "monthly" | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  if (!isOpen) return null;

  const handleSubscribe = async (plan: "weekly" | "monthly") => {
    setLoading(true);
    setSelectedPlan(plan);
    
    try {
      const token = getToken();
      const payWin = window.open("", "_blank");
      
      if (!payWin) {
        alert("Please allow popups for this site to continue payment.");
        setLoading(false);
        setSelectedPlan(null);
        return;
      }

      if (!token) {
        payWin.close();
        alert("Please login again to subscribe.");
        setLoading(false);
        setSelectedPlan(null);
        return;
      }

      const res = await fetch(`${apiBase}/api/payment/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ plan })
      });

      // Safely parse JSON; fallback to text
      let data: any = null;
      try {
        data = await res.json();
      } catch (e) {
        try {
          const txt = await res.text();
          data = { message: txt };
        } catch {
          data = { message: "Payment creation failed" };
        }
      }
      
      if (!res.ok) {
        // If token expired/invalid, prompt re-login
        if (res.status === 401) {
          payWin.close();
          setLoading(false);
          setSelectedPlan(null);
          alert("Session expired. Please login again.");
          return;
        }
        throw new Error((data && data.message) || "Payment creation failed");
      }

      if (data.payInfo) {
        payWin.location.href = data.payInfo;
      } else if (data.html) {
        payWin.document.open();
        payWin.document.write(data.html);
        payWin.document.close();
      } else {
        payWin.close();
        throw new Error("No payment URL returned");
      }

      // Poll for payment status
      if (data.orderId) {
        pollPaymentStatus(data.orderId);
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert(err instanceof Error ? err.message : "Payment failed");
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  const pollPaymentStatus = (orderId: string) => {
    const token = getToken();
    if (!token) return;
    let attempts = 0;
    const maxAttempts = 40;

    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`${apiBase}/api/payment/status/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();

        if (data.status === "PAID") {
          clearInterval(interval);
          setLoading(false);
          setSelectedPlan(null);
          alert("Payment successful! Your subscription is now active.");
          window.location.reload();
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          setLoading(false);
          setSelectedPlan(null);
          alert("Payment verification timeout. Please check your subscription status.");
        }
      } catch (err) {
        console.error("Poll error:", err);
      }
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/60 backdrop-blur-sm pt-16 sm:pt-20 px-3 sm:px-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-2xl overflow-hidden max-h-[calc(100vh-3rem)] sm:max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/50 transition z-10"
        >
          <X className="w-6 h-6 text-gray-700" />
        </button>

        <div className="p-6 sm:p-8 md:p-10 overflow-y-auto sm:overflow-visible max-h-[calc(100vh-6rem)] sm:max-h-none space-y-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              {trialExpired ? "Continue Chatting" : "Unlock Premium Features"}
            </h2>
            <p className="text-gray-600 text-lg">
              {trialExpired 
                ? "Your free trial has ended. Choose a plan to continue chatting!" 
                : "Get unlimited access to all features"}
            </p>
          </div>

          <div className="grid gap-4 md:gap-6 md:grid-cols-2">
            {/* Weekly Plan */}
            <div className="relative bg-white rounded-xl p-6 border-2 border-purple-200 hover:border-purple-400 transition shadow-lg hover:shadow-xl">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Popular
              </div>
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Weekly</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-purple-600">₹105</span>
                  <span className="text-gray-500">/week</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Best for trying out</p>
              </div>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-gray-700">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Unlimited chats</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>All premium features</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Priority support</span>
                </li>
              </ul>

              <button
                onClick={() => handleSubscribe("weekly")}
                disabled={loading && selectedPlan !== "weekly"}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && selectedPlan === "weekly" ? "Processing..." : "Choose Weekly"}
              </button>
            </div>

            {/* Monthly Plan */}
            <div className="relative bg-white rounded-xl p-6 border-2 border-pink-200 hover:border-pink-400 transition shadow-lg hover:shadow-xl">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Best Value
              </div>
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Monthly</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-pink-600">₹199</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <p className="text-sm text-green-600 font-semibold mt-2">Save 53%</p>
              </div>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-gray-700">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Everything in Weekly</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Exclusive features</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Better value</span>
                </li>
              </ul>

              <button
                onClick={() => handleSubscribe("monthly")}
                disabled={loading && selectedPlan !== "monthly"}
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && selectedPlan === "monthly" ? "Processing..." : "Choose Monthly"}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8 text-sm text-gray-600 border-t border-gray-200 pt-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-500" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" />
              <span>Cancel Anytime</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
