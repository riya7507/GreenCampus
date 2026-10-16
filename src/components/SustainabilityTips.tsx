import { useState, useEffect } from 'react';
import {
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Zap,
  Recycle,
  Share2,
  Flame,
  Leaf,
  Info
} from 'lucide-react';

export interface EcoTip {
  id: string;
  title: string;
  tip: string;
  category: 'water' | 'energy' | 'waste' | 'greenshare' | 'dining' | 'transit';
  impact: string;
  source?: string;
  sdg?: string;
}

const CURATED_TIPS: EcoTip[] = [
  {
    id: 'tip-1',
    title: 'Report Dripping Faucets',
    tip: 'A single dripping tap in campus restrooms can waste over 15–20 liters of water every day. Log it on ResourceCare to get it repaired swiftly!',
    category: 'water',
    impact: 'Estimated ~15L water saved/day',
    source: 'Campus Facilities Benchmark',
    sdg: 'SDG 6: Clean Water'
  },
  {
    id: 'tip-2',
    title: 'Vampire Power Cutoff',
    tip: 'Lab computer monitors, chargers, and empty study hall consoles draw standby energy even when idle. Switch off multi-plugs when departing.',
    category: 'energy',
    impact: 'Estimated ~0.8 kWh conserved',
    source: 'Campus Energy Audit',
    sdg: 'SDG 7: Affordable Energy'
  },
  {
    id: 'tip-3',
    title: 'Borrow Before You Buy',
    tip: 'Need a scientific calculator, lab coat, or semester reference book? Request it from a senior on GreenShare instead of purchasing a single-use replacement.',
    category: 'greenshare',
    impact: 'Avoids ~3.5 kg embedded CO2e',
    source: 'Circular Economy Initiative',
    sdg: 'SDG 12: Responsible Consumption'
  },
  {
    id: 'tip-4',
    title: 'Rinse Before Recycling',
    tip: 'Food and drink residue in plastic and tetra-pack drink containers can contaminate entire recycling batches. Give them a quick rinse at the wash station!',
    category: 'waste',
    impact: 'Prevents batch contamination',
    source: 'Municipal Waste Standards',
    sdg: 'SDG 12: Waste Reduction'
  },
  {
    id: 'tip-5',
    title: 'Stairs Over Elevators',
    tip: 'Taking the stairs for trips under 3 floors cuts building lift motor electricity demand and promotes personal fitness during class transitions.',
    category: 'energy',
    impact: 'Estimated ~0.2 kWh saved per trip',
    source: 'Facilities Sustainability',
    sdg: 'SDG 11: Sustainable Cities'
  },
  {
    id: 'tip-6',
    title: 'Mindful Cafeteria Portions',
    tip: 'Start with moderate meal helpings at the campus dining hall. Edible food waste contributes heavily to municipal landfill methane emissions.',
    category: 'dining',
    impact: 'Reduces food footprint by ~200g CO2e',
    source: 'Campus Dining Services',
    sdg: 'SDG 12: Food Waste Avoidance'
  },
  {
    id: 'tip-7',
    title: 'Campus Refill Stations',
    tip: 'Carrying a durable bottle and using filtered campus water fountains eliminates single-use plastic bottles and saves students personal expenses.',
    category: 'water',
    impact: 'Saves 1 plastic bottle per refill',
    source: 'GreenCampus Water Watch',
    sdg: 'SDG 6: Clean Water'
  },
  {
    id: 'tip-8',
    title: 'Digital-First Note Taking',
    tip: 'Switching lecture notes, assignment submissions, and review guides to digital formats preserves campus forests and diverts paper waste.',
    category: 'waste',
    impact: 'Saves ~2,000 sheets/year per student',
    source: 'Academic Resource Council',
    sdg: 'SDG 15: Life on Land'
  },
  {
    id: 'tip-9',
    title: 'Pedal or Walk Across Campus',
    tip: 'Choosing walking paths or shared campus cycles for inter-hostel transit keeps campus roads quiet, safe, and free from vehicle tailpipe emissions.',
    category: 'transit',
    impact: 'Zero carbon transit',
    source: 'Campus Mobility Plan',
    sdg: 'SDG 13: Climate Action'
  },
  {
    id: 'tip-10',
    title: 'Double-Sided Project Prints',
    tip: 'When physical printing is mandatory for lab manuals or campus projects, always default to duplex printing to instantly halve paper consumption.',
    category: 'waste',
    impact: '50% paper usage reduction',
    source: 'Green Printing Guidelines',
    sdg: 'SDG 12: Responsible Consumption'
  }
];

export function SustainabilityTips() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isPledged, setIsPledged] = useState<boolean>(false);
  const [streakCount, setStreakCount] = useState<number>(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filter list based on selected category
  const filteredTips = selectedCategory === 'all'
    ? CURATED_TIPS
    : CURATED_TIPS.filter(t => t.category === selectedCategory);

  // Determine Daily Seed Index based on Day of the Year
  const getDailyIndex = (length: number) => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return dayOfYear % length;
  };

  // Initialize on mount
  useEffect(() => {
    const dailyIdx = getDailyIndex(CURATED_TIPS.length);
    setCurrentIndex(dailyIdx);

    // Retrieve local streak and pledged status
    try {
      const savedStreak = localStorage.getItem('greencampus_eco_streak');
      const lastPledgedDate = localStorage.getItem('greencampus_last_pledged');
      const todayStr = new Date().toDateString();

      if (savedStreak) {
        setStreakCount(parseInt(savedStreak, 10) || 1);
      }
      if (lastPledgedDate === todayStr) {
        setIsPledged(true);
      }
    } catch {
      // LocalStorage not available or restricted
    }
  }, []);

  // Ensure index stays in bounds if filter changes
  useEffect(() => {
    if (currentIndex >= filteredTips.length) {
      setCurrentIndex(0);
    }
  }, [selectedCategory, filteredTips.length, currentIndex]);

  const currentTip = filteredTips[currentIndex] || CURATED_TIPS[0];

  // Fetch or shuffle a new tip (with external API simulation / refresh)
  const handleRefresh = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // Fetch advice from external API to optionally enrich tips
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      try {
        const res = await fetch('https://api.adviceslip.com/advice', {
          signal: controller.signal,
          cache: 'no-store'
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          // External API successful: pick next rotating tip
        }
      } catch {
        // Fallback gracefully without throwing
      }

      // Smooth index rotation
      const nextIdx = (currentIndex + 1) % filteredTips.length;
      setCurrentIndex(nextIdx);
    } catch (err: any) {
      setErrorMsg('Showing curated campus tip');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredTips.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredTips.length) % filteredTips.length);
  };

  const handleCopy = () => {
    if (!currentTip) return;
    const shareText = `🌿 GreenCampus Eco-Tip: ${currentTip.title}\n"${currentTip.tip}"\nEstimated Impact: ${currentTip.impact}`;
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // fallback
    });
  };

  const handlePledge = () => {
    if (isPledged) return;
    const newStreak = streakCount + 1;
    setStreakCount(newStreak);
    setIsPledged(true);
    try {
      localStorage.setItem('greencampus_eco_streak', newStreak.toString());
      localStorage.setItem('greencampus_last_pledged', new Date().toDateString());
    } catch {
      // Ignore storage errors
    }
  };

  // Category Theme Details
  const getCategoryMeta = (cat: string) => {
    switch (cat) {
      case 'water':
        return {
          icon: <Droplets className="w-3.5 h-3.5 text-[#00897B]" />,
          label: 'Water Care',
          bg: 'bg-[#E0F2F1]',
          text: 'text-[#00695C]',
          border: 'border-[#80CBC4]'
        };
      case 'energy':
        return {
          icon: <Zap className="w-3.5 h-3.5 text-[#1976D2]" />,
          label: 'Clean Energy',
          bg: 'bg-[#E3F2FD]',
          text: 'text-[#1565C0]',
          border: 'border-[#90CAF9]'
        };
      case 'waste':
        return {
          icon: <Recycle className="w-3.5 h-3.5 text-[#2E7D32]" />,
          label: 'Zero Waste',
          bg: 'bg-[#E8F5E9]',
          text: 'text-[#2E7D32]',
          border: 'border-[#A5D6A7]'
        };
      case 'greenshare':
        return {
          icon: <Share2 className="w-3.5 h-3.5 text-[#F9A825]" />,
          label: 'GreenShare',
          bg: 'bg-[#FFF8E1]',
          text: 'text-[#F57F17]',
          border: 'border-[#FFE082]'
        };
      case 'dining':
        return {
          icon: <Leaf className="w-3.5 h-3.5 text-[#388E3C]" />,
          label: 'Eco Dining',
          bg: 'bg-[#F1F8E9]',
          text: 'text-[#33691E]',
          border: 'border-[#C5E1A5]'
        };
      default:
        return {
          icon: <Sparkles className="w-3.5 h-3.5 text-[#2E7D32]" />,
          label: 'Campus Eco',
          bg: 'bg-[#E8F5E9]',
          text: 'text-[#2E7D32]',
          border: 'border-[#A5D6A7]'
        };
    }
  };

  const meta = getCategoryMeta(currentTip?.category || 'water');

  return (
    <section className="w-full bg-white rounded-2xl border border-[#ECEFF1] shadow-xs p-4 flex flex-col gap-3 transition-all duration-200">
      {/* Header Row: Title, Streak Badge, Shuffle */}
      <div className="flex items-center justify-between gap-2 border-b border-[#F5F5F5] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#E8F5E9] flex items-center justify-center text-[#2E7D32]">
            <Sparkles className="w-4 h-4 text-[#2E7D32]" />
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-[#263238] flex items-center gap-1.5 leading-none">
              Daily Sustainability Tip
            </h3>
            <span className="text-[11px] font-medium text-[#78909C]">
              Everyday actions for a greener campus
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Streak Badge */}
          <div
            title="Daily eco-pledge streak"
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#FFF8E1] border border-[#FFE082] text-[#F57F17] text-[11px] font-bold"
          >
            <Flame className="w-3.5 h-3.5 fill-[#F9A825] text-[#F9A825]" />
            <span>{streakCount}d</span>
          </div>

          {/* Shuffle / Refresh Button */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading}
            title="Load another daily tip"
            aria-label="Refresh daily tip"
            className="w-7 h-7 rounded-lg bg-[#F8FAF8] hover:bg-[#ECEFF1] active:scale-95 border border-[#ECEFF1] flex items-center justify-center text-[#546E7A] transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#2E7D32]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-semibold scrollbar-none">
        {[
          { id: 'all', label: 'All Tips' },
          { id: 'water', label: '💧 Water' },
          { id: 'energy', label: '⚡ Energy' },
          { id: 'waste', label: '♻️ Waste' },
          { id: 'greenshare', label: '🤝 GreenShare' }
        ].map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => {
              setSelectedCategory(chip.id);
              setCurrentIndex(0);
            }}
            className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer border ${
              selectedCategory === chip.id
                ? 'bg-[#2E7D32] text-white border-[#2E7D32] shadow-2xs'
                : 'bg-[#F8FAF8] text-[#546E7A] border-[#ECEFF1] hover:bg-[#ECEFF1]'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Tip Card Body */}
      {isLoading ? (
        <div className="p-4 rounded-xl bg-[#F8FAF8] border border-[#ECEFF1] animate-pulse flex flex-col gap-2.5">
          <div className="h-4 bg-[#E0E0E0] rounded w-1/3"></div>
          <div className="h-3 bg-[#E0E0E0] rounded w-full"></div>
          <div className="h-3 bg-[#E0E0E0] rounded w-4/5"></div>
          <div className="h-4 bg-[#E0E0E0] rounded w-1/2 mt-1"></div>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-[#F8FAF8] border border-[#ECEFF1] flex flex-col gap-2 relative">
          {/* Category Tag & Impact Row */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${meta.bg} ${meta.text} ${meta.border}`}
            >
              {meta.icon}
              {meta.label}
            </span>

            {currentTip.sdg && (
              <span className="text-[10px] font-semibold text-[#78909C] bg-white px-1.5 py-0.5 rounded border border-[#ECEFF1]">
                {currentTip.sdg}
              </span>
            )}
          </div>

          {/* Tip Title & Description */}
          <div>
            <h4 className="text-[13px] font-bold text-[#263238] mb-1">
              {currentTip.title}
            </h4>
            <p className="text-[12px] font-normal text-[#455A64] leading-relaxed">
              "{currentTip.tip}"
            </p>
          </div>

          {/* Estimated Environmental Impact Pill */}
          <div className="mt-1 flex items-center justify-between gap-2 pt-2 border-t border-[#ECEFF1]/70">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#00695C]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00897B]"></span>
              <span>{currentTip.impact}</span>
            </div>

            {/* Quick Copy Tip Button */}
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#546E7A] hover:text-[#2E7D32] transition-colors cursor-pointer"
              title="Copy tip to share with classmates"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-[#2E7D32]" />
                  <span className="text-[#2E7D32]">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Footer Navigation & Pledge Interaction */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        {/* Carousel Stepper Buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrev}
            className="w-7 h-7 rounded-lg bg-[#F8FAF8] hover:bg-[#ECEFF1] active:scale-95 border border-[#ECEFF1] flex items-center justify-center text-[#546E7A] cursor-pointer"
            title="Previous tip"
            aria-label="Previous tip"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-semibold text-[#78909C] px-1">
            {currentIndex + 1} / {filteredTips.length}
          </span>
          <button
            type="button"
            onClick={handleNext}
            className="w-7 h-7 rounded-lg bg-[#F8FAF8] hover:bg-[#ECEFF1] active:scale-95 border border-[#ECEFF1] flex items-center justify-center text-[#546E7A] cursor-pointer"
            title="Next tip"
            aria-label="Next tip"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Daily Pledge Button */}
        <button
          type="button"
          onClick={handlePledge}
          disabled={isPledged}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer ${
            isPledged
              ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]'
              : 'bg-[#2E7D32] text-white hover:bg-[#256629] active:scale-95 shadow-xs'
          }`}
        >
          {isPledged ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32]" />
              <span>Pledged Today!</span>
            </>
          ) : (
            <>
              <Leaf className="w-3.5 h-3.5" />
              <span>I'll do this today</span>
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <p className="text-[10px] text-[#78909C] italic text-center">
          <Info className="w-3 h-3 inline mr-1" />
          {errorMsg}
        </p>
      )}
    </section>
  );
}

export default SustainabilityTips;
