function LinkList({ links, onSelectLink }) {
  if (links.length === 0) {
    return <p className="empty-state">No links yet. Shorten one above to get started!</p>;
  }

  return (
    <div className="link-list">
      {links.map((link) => (
        <div key={link.id} className="link-card" onClick={() => onSelectLink(link.id)}>
          <div className="link-info">
            <p className="short-code">/{link.short_code}</p>
            <p className="original-url">{link.original_url}</p>
          </div>
          <div className="click-count">
            <span>{link.total_clicks}</span>
            <small>clicks</small>
          </div>
        </div>
      ))}
    </div>
  );
}

export default LinkList;
