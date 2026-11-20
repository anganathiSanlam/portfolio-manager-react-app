import { newsItems, fundUniverse, pageData } from "../../data";
import type { NewsItem } from "../../data/types";

function linkedLabel(item: NewsItem): string | null {
  if (item.linkedFundId) {
    const fund = fundUniverse.find(f => f.id === item.linkedFundId);
    return fund ? fund.name : null;
  }
  if (item.linkedPortfolio) return item.linkedPortfolio;
  return null;
}

export default function News() {
  const data = pageData.news;
  const watchItems = newsItems.filter(n => n.impact === "watch");

  return (
    <div className="news-page">
      {data?.eyebrow && <div className="news-eyebrow">{data.eyebrow}</div>}
      <h1 className="news-title">{data?.title ?? "News"}</h1>
      <p className="news-subtitle">{data?.subtitle}</p>

      {data?.metrics && (
        <div className="metric-grid news-metrics">
          {data.metrics.map(([label, value, delta]) => (
            <div key={label} className="metric-card">
              <div className="metric-label">{label}</div>
              <div className="metric-value">{value}</div>
              <div className="metric-delta">{delta}</div>
            </div>
          ))}
        </div>
      )}

      {watchItems.length > 0 && (
        <div className="why-panel news-watch-panel">
          <div className="why-panel-label">Watch</div>
          <strong>{watchItems[0].headline}</strong>
          <p style={{ margin: "6px 0 0" }}>{watchItems[0].summary}</p>
        </div>
      )}

      <div className="news-feed-label">Recent updates</div>
      <div className="news-feed">
        {newsItems.map(item => {
          const link = linkedLabel(item);
          return (
            <div key={item.id} className={`news-card news-impact-${item.impact}`}>
              <div className="news-card-dot" aria-hidden />
              <div className="news-card-body">
                <div className="news-card-headline">{item.headline}</div>
                <div className="news-card-summary">{item.summary}</div>
                <div className="news-card-tags">
                  <span className={`news-tag news-tag-category`}>{item.category}</span>
                  {link && <span className="news-tag news-tag-link">{link}</span>}
                </div>
              </div>
              <div className="news-card-date">
                <span>{item.date}</span>
                <span className="news-card-time">{item.time}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
