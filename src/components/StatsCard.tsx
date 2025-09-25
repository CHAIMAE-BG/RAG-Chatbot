
import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: string | number | ReactNode;
  change?: {
    value: string | number;
    positive: boolean;
  };
  icon: LucideIcon;
  color: string;
}

const StatsCard = ({ title, value, change, icon: Icon, color }: StatsCardProps) => {
  return (
    <Card className="hover-scale transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`rounded-full p-2 ${color}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={`text-xs ${change.positive ? 'text-green-600' : 'text-red-600'}`}>
            {change.positive ? '+' : '-'}{change.value}% par rapport au mois dernier
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;
