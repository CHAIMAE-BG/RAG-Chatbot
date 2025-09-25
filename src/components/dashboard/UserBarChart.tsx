
import { memo } from 'react';
import { BarChart, Bar, ResponsiveContainer, Tooltip, Legend, XAxis, YAxis } from 'recharts';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';

interface UserBarChartProps {
  data: Array<{ name: string; count: number }>;
  isLoading: boolean;
}

const UserBarChart = memo(({ data, isLoading }: UserBarChartProps) => {
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
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 50,
          }}
        >
          <XAxis 
            dataKey="name" 
            height={70} 
            tick={(props) => {
              const { x, y, payload } = props;
              return (
                <g transform={`translate(${x},${y})`}>
                  <text 
                    x={0} 
                    y={0} 
                    dy={16} 
                    textAnchor="end" 
                    transform="rotate(-45)"
                    fill="#666"
                    fontSize={12}
                  >
                    {payload.value}
                  </text>
                </g>
              );
            }} 
          />
          <YAxis />
          <Tooltip formatter={(value) => [`${value} ${t('dashboard.files')}`, t('dashboard.count')]} />
          <Legend />
          <Bar dataKey="count" name={t('dashboard.filesCount')} fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

UserBarChart.displayName = 'UserBarChart';

export default UserBarChart;
