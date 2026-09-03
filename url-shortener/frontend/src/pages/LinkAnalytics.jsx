import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAnalytics } from '../api';
import AnalyticsChart from '../components/AnalyticsChart';

function LinkAnalytics() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getAnalytics(id).then((res) => setData(res.data));
  }, [id]);

  if (!data) return <p>Loading...</p>;

  return (
    <div className="analytics-page">
      <button onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
      <h1>Link Analytics</h1>
      <AnalyticsChart
        dailyClicks={data.dailyClicks}
        deviceBreakdown={data.deviceBreakdown}
        referrerBreakdown={data.referrerBreakdown}
      />
    </div>
  );
}

export default LinkAnalytics;
