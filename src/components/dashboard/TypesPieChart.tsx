
import { memo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';

interface TypesPieChartProps {
  data: Array<{ name: string; value: number }>;
  isLoading: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const TypesPieChart = memo(({ data, isLoading }: TypesPieChartProps) => {
  const { t } = useTranslation();

  if (isLoading) {
    return <Skeleton className="h-80 w-full" />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">{t('dashboard.noData')}</p>
      </div>
    );
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={true}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} ${t('dashboard.files')}`, t('dashboard.count')]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
});

TypesPieChart.displayName = 'TypesPieChart';

export default TypesPieChart;
