'use client';

import { type CSSProperties, useCallback, useEffect, useMemo, useState } from "react";
import type { IPInsight } from "../lib/ipService";
import { fetchIPInsight } from "../lib/ipService";

const REFRESH_INTERVAL_MS = 60_000;

const fallbackValue = (value?: string | number | null) => {
  if (value === null || value === undefined) return "—";
  if (typeof value === "number") return Number.isFinite(value) ? value.toString() : "—";
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : "—";
};

const formatCoordinates = (latitude?: number, longitude?: number) => {
  if (typeof latitude !== "number" || typeof longitude !== "number") return "—";
  const lat = `${latitude.toFixed(3)}°`;
  const lng = `${longitude.toFixed(3)}°`;
  return `${lat}, ${lng}`;
};

const formatLocation = (insight?: IPInsight) => {
  if (!insight) return "—";
  const segments = [insight.city, insight.region, insight.country]
    .filter(Boolean)
    .map((segment) => segment!.trim())
    .filter((segment) => segment.length > 0);

  if (segments.length === 0) return "—";

  return segments.join(", ");
};

const threatCopy: Record<Exclude<IPInsight["threatLevel"], undefined>, { label: string; tone: string }> = {
  low: {
    label: "Residential / low risk",
    tone: "status-low"
  },
  medium: {
    label: "Potential VPN or proxy detected",
    tone: "status-medium"
  },
  high: {
    label: "Likely TOR or anonymizer exit node",
    tone: "status-high"
  }
};

export default function IPDashboard() {
  const [insight, setInsight] = useState<IPInsight | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadInsight = useCallback(
    async (options: { silent?: boolean } = {}) => {
      if (!options.silent) {
        setIsRefreshing(true);
      }

      try {
        const data = await fetchIPInsight();

        if (!data.ip) {
          throw new Error("Unable to resolve IP information.");
        }

        setInsight(data);
        setError(null);
        setLastUpdated(new Date());
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
      } finally {
        if (!options.silent) {
          setIsRefreshing(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    void loadInsight();

    const interval = setInterval(() => {
      void loadInsight({ silent: true });
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [loadInsight]);

  const cards = useMemo(() => {
    const provider = [insight?.isp, insight?.asn].filter((token): token is string => Boolean(token));

    return [
      { label: "Public IP", value: fallbackValue(insight?.ip) },
      { label: "Hostname", value: fallbackValue(insight?.hostname) },
      { label: "Geolocation", value: formatLocation(insight ?? undefined) },
      { label: "Coordinates", value: formatCoordinates(insight?.latitude, insight?.longitude) },
      { label: "Timezone", value: fallbackValue(insight?.timezone) },
      {
        label: "ISP / ASN",
        value: provider.length > 0 ? provider.join(" • ") : "—"
      },
      { label: "Country Calling Code", value: fallbackValue(insight?.callingCode) },
      { label: "Currency", value: fallbackValue(insight?.currency) }
    ];
  }, [insight]);

  const sourceName = useMemo(() => {
    if (!insight?.source || insight.source === "unknown") {
      return "network probe";
    }

    if (insight.source === "ipapi") {
      return "IPAPI";
    }

    if (insight.source === "ipwhois") {
      return "IPWhois";
    }

    return insight.source;
  }, [insight?.source]);

  const threatDescriptor = insight?.threatLevel ? threatCopy[insight.threatLevel] : undefined;

  const threatStyle = useMemo(() => {
    if (!threatDescriptor) {
      return {
        background: "rgba(52, 211, 153, 0.18)",
        color: "#34d399"
      } satisfies CSSProperties;
    }

    if (threatDescriptor.tone === "status-medium") {
      return {
        background: "rgba(250, 204, 21, 0.16)",
        color: "#facc15"
      } satisfies CSSProperties;
    }

    if (threatDescriptor.tone === "status-high") {
      return {
        background: "rgba(248, 113, 113, 0.18)",
        color: "#f87171"
      } satisfies CSSProperties;
    }

    return {
      background: "rgba(52, 211, 153, 0.18)",
      color: "#34d399"
    } satisfies CSSProperties;
  }, [threatDescriptor]);

  return (
    <section aria-labelledby="ip-intel-title" className="panel">
      <div className="meta-row" style={{ justifyContent: "space-between" }}>
        <div style={{ alignItems: "center", display: "flex", gap: "0.75rem" }}>
          <span aria-hidden className="status-dot" />
          <div>
            <h2 id="ip-intel-title">Live IP profile</h2>
            <p className="timestamp">
              Sourced via {sourceName}
              {lastUpdated ? ` • Updated ${lastUpdated.toLocaleTimeString()}` : ""}
            </p>
          </div>
        </div>

        <button
          aria-busy={isRefreshing}
          className="refresh-button"
          disabled={isRefreshing}
          type="button"
          onClick={() => void loadInsight()}
        >
          <svg
            fill="none"
            height="18"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="18"
            xmlns="http://www.w3.org/2000/svg"
          >
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10" />
            <path d="M20.49 15a9 9 0 0 1-14.13 3.36L1 14" />
          </svg>
          {isRefreshing ? "Refreshing…" : "Refresh now"}
        </button>
      </div>

      {error ? (
        <p className="error">{error}</p>
      ) : (
        <div className="ip-grid" role="list">
          {cards.map((card) => (
            <article className="ip-card" key={card.label} role="listitem">
              <strong>{card.label}</strong>
              <span>{card.value}</span>
            </article>
          ))}
        </div>
      )}

      <div className="ip-meta">
        <div className="meta-row">
          <span className="tag" style={threatStyle}>
            {threatDescriptor?.label ?? "No anonymizer detected"}
          </span>
          {insight?.vpn && <span className="metric-pill">VPN detected by upstream</span>}
          {insight?.proxy && <span className="metric-pill">Proxy flag present</span>}
          {insight?.tor && <span className="metric-pill">TOR exit relay flagged</span>}
        </div>
      </div>
    </section>
  );
}
