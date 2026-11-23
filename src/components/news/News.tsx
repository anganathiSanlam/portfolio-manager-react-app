import { newsItems, fundUniverse, pageData } from "../../data";
import type { NewsItem } from "../../data/types";

const CATEGORY_ICON: Record<string, string> = {
  Market: "📈", Macro: "🌍", Manager: "🏢", Portfolio: "📂",
};

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

      <div className="news-feed-label">Recent updates</div>
      <div className="news-feed">
        {newsItems.map(item => {
          const link = linkedLabel(item);
          return (
            <div key={item.id} className={`news-card news-impact-${item.impact}`}>
              <div className="news-card-header">
                <span className="news-card-category">
                  <span className="news-card-icon">{CATEGORY_ICON[item.category]}</span>
                  {item.category}
                </span>
                <span className="news-card-time-stamp">{item.time} · {item.date}</span>
              </div>
              <div className="news-card-body">
                <div className="news-card-headline">{item.headline}</div>
                <div className="news-card-summary">{item.summary}</div>
                {link && (
                  <div className="news-card-footer">
                    <span className="news-tag news-tag-link">{link}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
