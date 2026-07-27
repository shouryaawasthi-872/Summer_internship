import React from 'react';
import krmuCrestImg from '../../assets/krmu-crest.png';
import krmuBannerImg from '../../assets/krmu-banner.png';

/**
 * KRMUCrest — Renders the exact official K.R. Mangalam University crest emblem image.
 */
export function KRMUCrest({ size = 48, className = '' }) {
  return (
    <img
      src={krmuCrestImg}
      alt="K.R. Mangalam University Crest"
      width={size}
      height={size}
      className={`object-contain flex-shrink-0 ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
}

/**
 * KRMULogoBanner — Rectangular banner matching official KRMU logo.
 * Left box: Blue "K.R. MANGALAM"
 * Right box: Red "UNIVERSITY"
 * Bottom box: White bar "THE COMPLETE WORLD OF EDUCATION"
 */
export function KRMULogoBanner({ size = 'medium', className = '' }) {
  const isSmall = size === 'small';
  const isLarge = size === 'large';

  const textPrimaryClass = isSmall
    ? 'text-xs'
    : isLarge
    ? 'text-lg'
    : 'text-sm';
  const textSubClass = isSmall
    ? 'text-[7.5px] px-1 py-0.2'
    : isLarge
    ? 'text-[10.5px] px-2 py-0.5'
    : 'text-[8.5px] px-1.5 py-0.3';

  return (
    <div className={`inline-flex flex-col select-none ${className}`}>
      {/* Top row: Blue & Red boxes */}
      <div className="flex items-stretch font-sans font-extrabold uppercase text-white tracking-wider leading-none shadow-xs">
        <div
          className={`bg-[#0054A6] ${textPrimaryClass} px-2.5 py-1.5 rounded-tl-sm flex items-center justify-center`}
          style={{ letterSpacing: '0.04em' }}
        >
          K.R. MANGALAM
        </div>
        <div
          className={`bg-[#E31E24] ${textPrimaryClass} px-2.5 py-1.5 rounded-tr-sm flex items-center justify-center`}
          style={{ letterSpacing: '0.04em' }}
        >
          UNIVERSITY
        </div>
      </div>

      {/* Bottom row: White box tagline */}
      <div
        className={`bg-white border border-t-0 border-gray-300 ${textSubClass} font-bold tracking-[0.14em] text-gray-900 uppercase text-center rounded-b-sm shadow-xs`}
        style={{ color: '#111827' }}
      >
        THE COMPLETE WORLD OF EDUCATION
      </div>
    </div>
  );
}

/**
 * KRMUBrandHeader — Combined Circular Crest + Banner Header.
 * Uses the exact uploaded official crest image.
 */
export default function KRMUBrandHeader({
  crestSize = 44,
  bannerSize = 'medium',
  className = '',
  useBannerImage = false,
}) {
  if (useBannerImage) {
    return (
      <img
        src={krmuBannerImg}
        alt="K.R. Mangalam University Logo"
        className={`object-contain max-h-12 ${className}`}
      />
    );
  }

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <KRMUCrest size={crestSize} />
      <KRMULogoBanner size={bannerSize} />
    </div>
  );
}
