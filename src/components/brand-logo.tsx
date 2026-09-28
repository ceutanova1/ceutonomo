type BrandLogoProps = Readonly<{ compact?: boolean }>;

export function BrandLogo({ compact = false }: BrandLogoProps) {
  return (
    <span className={compact ? "brand-logo compact" : "brand-logo"} aria-label="CEUTONOMO">
      <svg viewBox="0 0 48 48" role="img" aria-hidden="true">
        <path className="brand-logo-frame" d="M24 4C13 4 5 12 5 24s8 20 19 20c7.5 0 13.3-3.5 17-9.2l-8.2-4.4c-2 2.8-4.8 4.4-8.8 4.4-6.2 0-10.2-4.3-10.2-10.8S17.8 13.2 24 13.2c4 0 6.8 1.6 8.8 4.4l8.2-4.4C37.3 7.5 31.5 4 24 4Z" />
        <path className="brand-logo-wave" d="M9.2 28.3c4.1-3.4 8.1-3.4 12.2 0 4.1 3.4 8.1 3.4 12.2 0 2.1-1.7 4.1-2.6 6.2-2.5" />
        <circle className="brand-logo-sun" cx="34.5" cy="13.5" r="2.5" />
      </svg>
      {!compact ? <span><strong>CEUTONOMO</strong><small>Decide con claridad</small></span> : null}
    </span>
  );
}
