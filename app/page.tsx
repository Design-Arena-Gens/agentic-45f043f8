import { Suspense } from "react";
import IPDashboard from "../components/IPDashboard";
import ProviderShowcase from "../components/ProviderShowcase";

export default function HomePage() {
  return (
    <main className="page-wrapper">
      <header className="page-header">
        <span className="badge">Realtime IP Intelligence</span>
        <h1>
          Understand your online fingerprint &amp; switch to a trusted VPN provider in
          seconds.
        </h1>
        <p>
          This web app monitors geo, privacy, and network metadata tied to your public
          IP address. Pair those insights with battle-tested VPN providers to stay in
          control of your digital footprint wherever you connect from.
        </p>
      </header>

      <Suspense fallback={<div className="panel">Loading IP telemetry…</div>}>
        <IPDashboard />
      </Suspense>

      <ProviderShowcase />
    </main>
  );
}
