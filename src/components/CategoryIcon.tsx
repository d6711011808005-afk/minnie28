import React from 'react';
import {
  Utensils,
  Car,
  ShoppingBag,
  Home,
  Film,
  HeartPulse,
  BookOpen,
  Receipt,
  Users,
  Briefcase,
  Laptop,
  Gift,
  TrendingUp,
  Store,
  Heart,
  CircleDollarSign,
  MoreHorizontal,
  CreditCard,
  Send,
  QrCode,
  Banknote,
  Smartphone,
  HelpCircle,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Utensils,
  Car,
  ShoppingBag,
  Home,
  Film,
  HeartPulse,
  BookOpen,
  Receipt,
  Users,
  Briefcase,
  Laptop,
  Gift,
  TrendingUp,
  Store,
  Heart,
  CircleDollarSign,
  MoreHorizontal,
  CreditCard,
  Send,
  QrCode,
  Banknote,
  Smartphone,
};

interface CategoryIconProps {
  name: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-5 h-5' }) => {
  const IconComponent = ICON_MAP[name] || HelpCircle;
  return <IconComponent className={className} />;
};
