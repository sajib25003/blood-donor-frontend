// Brighten the charcoal lettering in dark mode while keeping the same PNG,
// red emblem, white cross and transparent background in both site locations.
export default function LogoThemeFilter() {
  return (
    <svg
      aria-hidden="true"
      width="0"
      height="0"
      className="pointer-events-none absolute"
    >
      <defs>
        <filter id="brand-logo-dark" colorInterpolationFilters="sRGB">
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  -4 0 0 0 2"
            result="lightLettering"
          />
          <feComposite
            in="lightLettering"
            in2="SourceGraphic"
            operator="in"
            result="maskedLettering"
          />
          <feComposite
            in="maskedLettering"
            in2="SourceGraphic"
            operator="over"
          />
        </filter>
      </defs>
    </svg>
  );
}
