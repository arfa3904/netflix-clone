import './RouteLoading.css';

export default function RouteLoading() {
  return (
    <div className="route-loading" role="status" aria-live="polite">
      <div className="route-loading-spinner" aria-hidden="true" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
