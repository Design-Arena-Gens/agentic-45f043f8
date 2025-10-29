import { vpnProviders } from "../data/vpnProviders";

export default function ProviderShowcase() {
  return (
    <section aria-labelledby="vpn-providers" className="providers">
      <div className="meta-row" style={{ alignItems: "flex-start" }}>
        <div>
          <h2 id="vpn-providers">Trusted VPN server networks</h2>
          <p>
            Compare audited providers powered by high-speed WireGuard and dedicated bare-metal
            infrastructure. Launch the app of your choice to mask the above fingerprint and route
            through privacy-friendly jurisdictions.
          </p>
        </div>
      </div>

      <div className="provider-grid" role="list">
        {vpnProviders.map((provider) => (
          <article className="provider-card" key={provider.name} role="listitem">
            <header>
              <h3>{provider.name}</h3>
              <p>{provider.summary}</p>
            </header>

            <div className="provider-metrics">
              <span className="metric-pill">{provider.serverCount.toLocaleString()} servers</span>
              <span className="metric-pill">{provider.countries} countries</span>
              <span className="metric-pill">Speed {provider.speedScore}</span>
              <span className="metric-pill">{provider.pricePerMonth}</span>
            </div>

            <p className="highlight">{provider.highlight}</p>

            <div className="provider-tags">
              <span className="tag" style={{ background: "rgba(148, 163, 184, 0.18)", color: "#e2e8f0" }}>
                HQ: {provider.headquarters}
              </span>
              {provider.tags.map((tag) => (
                <span className="tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
