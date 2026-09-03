import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar
} from 'recharts';

const COLORS = ['#2c7be5', '#ff9f43', '#28c76f', '#ea5455'];

function AnalyticsChart({ dailyClicks, deviceBreakdown, referrerBreakdown }) {
  const parsedDeviceBreakdown = deviceBreakdown.map(d => ({
    ...d,
    count: Number(d.count)
  }));

  const parsedReferrerBreakdown = (referrerBreakdown || []).map(r => ({
    ...r,
    count: Number(r.count)
  }));

  return (
    <div className="charts">
      <div className="chart-box">
        <h3>Clicks Over Time</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={dailyClicks}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="clicks" stroke="#2c7be5" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-box">
        <h3>Device Breakdown</h3>
        <div style={{ width: '100%', height: 250 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={parsedDeviceBreakdown}
                dataKey="count"
                nameKey="device"
                cx="50%"
                cy="50%"
                outerRadius={70}
              >
                {parsedDeviceBreakdown.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-box">
        <h3>Top Referrers</h3>
        <div style={{ width: '100%', height: 250 }}>
          <ResponsiveContainer>
            <BarChart data={parsedReferrerBreakdown} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="referrer" width={120} />
              <Tooltip />
              <Bar dataKey="count" fill="#28c76f" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsChart;
