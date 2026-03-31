const GA_MEASUREMENT_ID = 'G-NC03JX1KGG';

let loaded = false;

export function loadGoogleAnalytics(): void {
  if (typeof document === 'undefined' || loaded) return;
  if (document.getElementById('ga-gtag-inline')) return;

  loaded = true;

  const asyncScript = document.createElement('script');
  asyncScript.id = 'ga-gtag-async';
  asyncScript.async = true;
  asyncScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(asyncScript);

  const inline = document.createElement('script');
  inline.id = 'ga-gtag-inline';
  inline.textContent = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}', { anonymize_ip: true });
`;
  document.head.appendChild(inline);
}
