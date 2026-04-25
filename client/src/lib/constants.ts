import {
  HeartPulse,
  Heart,
  Sprout,
  TrendingUp,
  Zap,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export const CATEGORIES = [
  'Healing',
  'Marriage',
  'Fruitfulness',
  'Finance',
  'Breakthrough',
  'Deliverance',
  'General'
] as const;

export type Category = typeof CATEGORIES[number];

export const CATEGORY_COLORS: Record<Category, string> = {
  Healing: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700',
  Marriage: 'bg-rose-100 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-700',
  Fruitfulness: 'bg-violet-100 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-700',
  Finance: 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-700',
  Breakthrough: 'bg-sky-100 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-700',
  Deliverance: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-700',
  General: 'bg-slate-100 dark:bg-slate-800/30 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-600',
};

export const CATEGORY_ACCENT_COLORS: Record<Category, string> = {
  Healing:      '#10b981',
  Marriage:     '#f43f5e',
  Fruitfulness: '#8b5cf6',
  Finance:      '#f59e0b',
  Breakthrough: '#0ea5e9',
  Deliverance:  '#6366f1',
  General:      '#64748b',
};

export const CATEGORY_META: Record<Category, {
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  bgLight: string;
  bgDark: string;
}> = {
  Healing: {
    icon: HeartPulse,
    description: "Stories of miraculous healing and divine restoration",
    bgLight: "bg-emerald-50",
    bgDark: "dark:bg-emerald-900/20",
  },
  Marriage: {
    icon: Heart,
    description: "Testimonies of restored relationships and covenant faithfulness",
    bgLight: "bg-rose-50",
    bgDark: "dark:bg-rose-900/20",
  },
  Fruitfulness: {
    icon: Sprout,
    description: "Victories of growth, abundance, and multiplication",
    bgLight: "bg-violet-50",
    bgDark: "dark:bg-violet-900/20",
  },
  Finance: {
    icon: TrendingUp,
    description: "God's provision, debt freedom, and financial breakthroughs",
    bgLight: "bg-amber-50",
    bgDark: "dark:bg-amber-900/20",
  },
  Breakthrough: {
    icon: Zap,
    description: "The impossible made possible through faith and prayer",
    bgLight: "bg-sky-50",
    bgDark: "dark:bg-sky-900/20",
  },
  Deliverance: {
    icon: ShieldCheck,
    description: "Freedom from bondage and the power of God's liberation",
    bgLight: "bg-indigo-50",
    bgDark: "dark:bg-indigo-900/20",
  },
  General: {
    icon: Sparkles,
    description: "Any other remarkable work of God in your life",
    bgLight: "bg-slate-50",
    bgDark: "dark:bg-slate-800/20",
  },
};

export const DEFAULT_VERSES = [
  {
    verse: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.",
    reference: "Jeremiah 29:11"
  },
  {
    verse: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.",
    reference: "Proverbs 3:5-6"
  },
  {
    verse: "The Lord is my shepherd, I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters, he refreshes my soul.",
    reference: "Psalm 23:1-3"
  },
  {
    verse: "I can do all this through him who gives me strength.",
    reference: "Philippians 4:13"
  },
  {
    verse: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.",
    reference: "Romans 8:28"
  }
];
