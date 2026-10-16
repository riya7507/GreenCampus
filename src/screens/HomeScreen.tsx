import { useState } from 'react';
import { SustainabilityTips } from '@/components/SustainabilityTips';

interface HomeScreenProps {
  onNavigateLogin?: () => void;
  onNavigateRegister?: () => void;
}

export function HomeScreen({ onNavigateLogin, onNavigateRegister }: HomeScreenProps) {
  const handleLogin = () => {
    if (onNavigateLogin) onNavigateLogin();
  };

  const handleCreateAccount = () => {
    if (onNavigateRegister) onNavigateRegister();
  };

  return (
    <div className="flex flex-col items-center justify-between w-full px-4 py-8 min-h-[calc(100vh-80px)] bg-[#F8FAF8]">
      <div className="w-full max-w-[420px] flex flex-col items-center justify-between flex-1 gap-6">
        {/* Center Hero & Branding */}
        <section className="flex flex-col items-center justify-center gap-4 text-center w-full pt-4">
          {/* Main Visual: Multi-color Layered Emblem */}
          <div className="relative flex items-center justify-center mb-1">
            {/* Outer soft light-green ring */}
            <div className="w-[120px] h-[120px] rounded-full bg-[#E8F5E9] border-2 border-[#81C784] flex items-center justify-center shadow-inner">
              {/* Inner deep green circle */}
              <div className="w-[86px] h-[86px] rounded-full bg-[#2E7D32] flex items-center justify-center shadow-md">
                <span className="text-[44px] select-none">🌱</span>
              </div>
            </div>

            {/* Small Teal accent badge on the bottom-right */}
            <div className="absolute bottom-0 right-1 w-7 h-7 rounded-full bg-[#00897B] border-2 border-white flex items-center justify-center shadow text-white text-xs font-bold">
              ✓
            </div>
          </div>

          {/* Title: Deep Green + Charcoal */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center justify-center text-[38px] font-extrabold tracking-tight">
              <span className="text-[#2E7D32]">Green</span>
              <span className="text-[#263238]">Campus</span>
            </div>
            <p className="text-[15px] font-medium text-[#546E7A]">
              Smarter Campus. Greener Future.
            </p>
          </div>

          {/* 3 Balanced Feature Cards (Teal, Blue, Amber) */}
          <div className="grid grid-cols-3 gap-2.5 w-full mt-2">
            {/* Card 1: Teal Accent */}
            <div className="bg-white rounded-2xl p-3 flex flex-col items-center border border-[#ECEFF1] shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#E0F2F1] flex items-center justify-center mb-1.5 text-lg">
                🌿
              </div>
              <span className="text-[12px] font-bold text-[#263238]">Eco Audit</span>
              <span className="text-[10px] font-medium text-[#78909C]">Track Impact</span>
            </div>

            {/* Card 2: Blue Accent */}
            <div className="bg-white rounded-2xl p-3 flex flex-col items-center border border-[#ECEFF1] shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#E3F2FD] flex items-center justify-center mb-1.5 text-lg">
                ⚡
              </div>
              <span className="text-[12px] font-bold text-[#263238]">Clean Power</span>
              <span className="text-[10px] font-medium text-[#78909C]">Save Energy</span>
            </div>

            {/* Card 3: Amber Accent */}
            <div className="bg-white rounded-2xl p-3 flex flex-col items-center border border-[#ECEFF1] shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#FFF8E1] flex items-center justify-center mb-1.5 text-lg">
                ♻️
              </div>
              <span className="text-[12px] font-bold text-[#263238]">Smart Waste</span>
              <span className="text-[10px] font-medium text-[#78909C]">Earn Points</span>
            </div>
          </div>
        </section>

        {/* Daily Sustainability Tips Component */}
        <SustainabilityTips />

        {/* Action Buttons Section */}
        <section className="w-full flex flex-col gap-3 pb-4">
          {/* Primary Button: Deep Green */}
          <button
            type="button"
            onClick={handleLogin}
            className="w-full h-[52px] rounded-[16px] bg-[#2E7D32] hover:bg-[#256629] active:scale-[0.98] text-white font-bold text-[16px] tracking-wide shadow-md transition-all cursor-pointer flex items-center justify-center"
          >
            Login
          </button>

          {/* Secondary Button: Clean White with Teal border */}
          <button
            type="button"
            onClick={handleCreateAccount}
            className="w-full h-[52px] rounded-[16px] border-2 border-[#00897B] text-[#00897B] bg-white hover:bg-[#E0F2F1]/40 active:scale-[0.98] font-bold text-[16px] tracking-wide shadow-xs transition-all cursor-pointer flex items-center justify-center"
          >
            Create Account
          </button>

          {/* Clean Subtext */}
          <p className="text-center font-medium text-[11px] text-[#90A4AE] mt-1">
            Campus Environmental & Resource Stewardship
          </p>
        </section>
      </div>
    </div>
  );
}
