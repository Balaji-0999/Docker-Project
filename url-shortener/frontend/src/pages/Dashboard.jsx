import { useState, useEffect } from 'react';
import { getLinks } from '../api';
import ShortenForm from '../components/ShortenForm';
import LinkList from '../components/LinkList';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [links, setLinks] = useState([]);
  const navigate = useNavigate();

  const fetchLinks = async () => {
    const res = await getLinks();
    setLinks(res.data);
  };

  useEffect(() => {
    fetchLinks();
  }, []); // khali array = "sirf ek baar page load pe chalao"

  return (
    <div className="dashboard">
      <h1>URL Shortener Dashboard</h1>
      <ShortenForm onNewLink={fetchLinks} />
      <h2>Your Links</h2>
      <LinkList links={links} onSelectLink={(id) => navigate(`/analytics/${id}`)} />
    </div>
  );
}

export default Dashboard;
