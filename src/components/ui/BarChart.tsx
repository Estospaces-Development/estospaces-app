interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartData[];
  title?: string;
  height?: number;
  showValues?: boolean;
}

const BarChart = ({ data, title, height = 200, showValues = true }: BarChartProps) => {
  const maxValue = Math.max(...data.map((item) => item.value));
  const minValue = Math.min(...data.map((item) => item.value));
  const range = maxValue - minValue || 1;

  return (
    <div className="w-full">
      {title && <h3 className="text-sm font-semibold text-gray-800 mb-4">{title}</h3>}
      <div className="relative w-full" style={{ height: `${height}px` }}>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between pr-2 text-xs text-gray-500">
          <span>${(maxValue / 1000).toFixed(0)}k</span>
          <span>${((maxValue * 0.75) / 1000).toFixed(0)}k</span>
          <span>${((maxValue * 0.5) / 1000).toFixed(0)}k</span>
          <span>${((maxValue * 0.25) / 1000).toFixed(0)}k</span>
          <span>$0</span>
        </div>

        {/* Chart area */}
        <div className="ml-12 h-full flex items-end justify-between gap-2 md:gap-4">
          {data.map((item, index) => {
            const barHeight = ((item.value - minValue) / range) * 100;
            const normalizedHeight = Math.max(barHeight, 5); // Minimum 5% height for visibility
            
            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center justify-end group h-full"
              >
                {/* Value tooltip on hover */}
                {showValues && (
                  <div className="absolute bottom-full mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    ${item.value.toLocaleString()}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                  </div>
                )}
                
                {/* Bar */}
                <div
                  className="w-full rounded-t-lg transition-all hover:opacity-90 cursor-pointer relative group/bar"
                  style={{
                    height: `${normalizedHeight}%`,
                    backgroundColor: item.color || '#FF6B35',
                    minHeight: '8px',
                  }}
                  title={`${item.label}: $${item.value.toLocaleString()}`}
                >
                  {/* Value inside bar if there's space */}
                  {showValues && normalizedHeight > 25 && (
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-white text-xs font-semibold">
                      ${(item.value / 1000).toFixed(0)}k
                    </div>
                  )}
                  
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover/bar:opacity-100 transition-opacity rounded-t-lg"></div>
                </div>
                
                {/* Month label */}
                <div className="text-xs text-gray-600 mt-2 text-center px-1 font-medium">
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Grid lines */}
        <div className="absolute inset-0 ml-12 pointer-events-none">
          {[0, 25, 50, 75, 100].map((percent) => (
            <div
              key={percent}
              className="absolute left-0 right-0 border-t border-gray-200"
              style={{ bottom: `${percent}%` }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BarChart;

