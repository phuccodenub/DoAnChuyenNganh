import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BarChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface BarChartProps {
  data: BarChartData[];
  dataKey: string;
  name?: string;
  color?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  horizontal?: boolean;
}

export function BarChart({
  data,
  dataKey,
  name,
  color = '#3b82f6',
  height = 300,
  showGrid = true,
  showLegend = false,
  horizontal = false,
}: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart 
        data={data} 
        layout={horizontal ? 'vertical' : 'horizontal'}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
        {horizontal ? (
          <>
            <XAxis type="number" stroke="#6b7280" style={{ fontSize: '12px' }} />
            <YAxis dataKey="name" type="category" stroke="#6b7280" style={{ fontSize: '12px' }} width={100} />
          </>
        ) : (
          <>
            <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} />
            <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
          </>
        )}
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '8px 12px',
          }}
        />
        {showLegend && <Legend />}
        <Bar
          dataKey={dataKey}
          name={name || dataKey}
          fill={color}
          radius={[4, 4, 0, 0]}
        />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}

