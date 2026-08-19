"use client";

import { CheckCircle2, Award, Sparkles } from "lucide-react";

export default function ProfessionalStatusCard() {
  return (
    <section className="rounded-2xl border border-green-100 bg-gradient-to-b from-white to-green-50/30 p-5 shadow-sm overflow-hidden relative">
      {/* Decorative background element */}
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-green-100/50 rounded-full blur-2xl" />
      
      <div className="flex items-center gap-3 mb-4 relative">
        <div className="w-11 h-11 rounded-xl bg-green-600 flex items-center justify-center shrink-0 shadow-lg shadow-green-200">
          <Award className="text-white w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-[#111827] leading-tight">Professional Account</h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Sparkles className="w-3 h-3 text-green-600" />
            <p className="text-[11px] font-bold text-green-700 uppercase tracking-wider">Premium Member</p>
          </div>
        </div>
      </div>

      <div className="border-t border-green-100/80 my-4" />

      <p className="text-sm text-[#4B5563] leading-relaxed mb-5">
        Congratulations! Your account is upgraded to **Professional status**. You now have unrestricted access to all career growth tools and priority job matching.
      </p>

      <div className="space-y-2.5">
        {[
          "Advanced Job Insights",
          "Priority Profile Visibility",
          "AI-Powered Recommendations"
        ].map((feature) => (
          <div key={feature} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-2.5 h-2.5 text-green-600" />
            </div>
            <span className="text-xs font-medium text-[#374151]">{feature}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-5 pt-4 border-t border-green-100/80">
        <div className="flex items-center justify-center gap-2 bg-green-600 rounded-xl py-2 shadow-md shadow-green-100">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span className="text-xs font-bold text-white uppercase tracking-widest">Active Status</span>
        </div>
      </div>
    </section>
  );
}
