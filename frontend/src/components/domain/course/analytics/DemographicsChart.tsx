import { BarChart, PieChart } from '@/components/ui/charts';
import type { StudentDemographics } from '@/services/api/analytics.api';

interface DemographicsChartProps {
  data: StudentDemographics;
}

export function DemographicsChart({ data }: DemographicsChartProps) {
  // Age groups chart data
  const ageGroupData = Object.entries(data.ageGroups)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({
      name,
      value,
    }));

  // Gender distribution - only show if we have data
  const genderData = data.genderDistribution
    ?.filter((item) => item.student_count > 0 && item.gender && item.gender !== 'Unknown' && item.gender !== 'Không xác định')
    .map((item) => ({
      name: item.gender === 'male' ? 'Nam' : item.gender === 'female' ? 'Nữ' : item.gender === 'other' ? 'Khác' : item.gender,
      value: item.student_count,
    })) || [];

  // Top locations (top 10) - only show if we have location data
  const locationEntries = Object.entries(data.locations)
    .filter(([, value]) => value > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const locationData = locationEntries.map(([name, value]) => ({
    name: name.length > 15 ? `${name.substring(0, 15)}...` : name,
    value,
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Age Groups */}
      {ageGroupData.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Phân bố theo độ tuổi</h3>
          <BarChart
            data={ageGroupData}
            dataKey="value"
            name="Số lượng"
            color="#10b981"
            height={250}
            showGrid
          />
        </div>
      )}

      {/* Gender Distribution */}
      {genderData.length > 0 ? (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Phân bố theo giới tính</h3>
          <BarChart
            data={genderData}
            dataKey="value"
            name="Số lượng"
            color="#3b82f6"
            height={250}
            showGrid
          />
        </div>
      ) : locationData.length > 0 ? (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Phân bố theo địa điểm (Top 10)</h3>
          <BarChart
            data={locationData}
            dataKey="value"
            name="Số lượng"
            color="#8b5cf6"
            height={250}
            showGrid
            horizontal
          />
        </div>
      ) : (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Thông tin nhân khẩu học</h3>
          <div className="flex items-center justify-center h-[250px] text-gray-500">
            Chưa có dữ liệu địa điểm
          </div>
        </div>
      )}
    </div>
  );
}

