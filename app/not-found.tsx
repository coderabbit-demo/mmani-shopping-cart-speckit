import Link from "next/link";
export default function NotFound({ onBack }: { onBack?: (event: React.MouseEvent<HTMLAnchorElement>) => void } = {}) {
  return <section className="not-found wrap"><span className="eyebrow">404 / A LITTLE DETOUR</span><h1>Page not found</h1><p>This page wandered off. Let’s get you back to the good stuff.</p><Link className="primary-button" href="/" onClick={onBack}>Back to the shop <span aria-hidden="true">↗</span></Link></section>;
}
