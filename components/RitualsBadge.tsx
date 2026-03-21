import React from 'react';

/** Stała etykieta marki w prawym dolnym rogu (desktop + mobile). */
const RitualsBadge: React.FC = () => {
  return (
    <div
      className="pointer-events-none fixed z-[35] select-none"
      style={{
        bottom: 'max(1rem, env(safe-area-inset-bottom, 0px))',
        right: 'max(1rem, env(safe-area-inset-right, 0px))',
      }}
    >
      <img
        src="/rituals....png"
        alt="Rituals"
        width={200}
        height={80}
        className="h-10 w-auto max-h-[12vh] max-w-[min(42vw,11rem)] object-contain object-right-bottom drop-shadow-[0_2px_10px_rgba(0,0,0,0.12)] sm:h-12 sm:max-w-[13rem] md:h-14 md:max-w-[14rem]"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
};

export default RitualsBadge;
