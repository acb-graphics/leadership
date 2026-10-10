(function () {
  var KEY = 'ab-analytics-consent';
  var ID = 'G-G57L4DKF4V';
  var loaded = false;

  function getConsent() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function setConsent(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  function loadAnalytics() {
    if (loaded) return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', ID);
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
    document.head.appendChild(s);
  }

  function showBanner() {
    var banner = document.createElement('div');
    banner.id = 'consent-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Analytics consent');
    banner.innerHTML =
      '<div style="background:#f5f5f5; border-top:1px solid #ddd; padding:16px 24px; font-size:14px; position:fixed; bottom:0; left:0; right:0; z-index:9999; display:flex; align-items:center; justify-content:center; gap:12px;">' +
        '<span style="flex:1; color:#555;">This site uses Google Analytics to understand how visitors use it.</span>' +
        '<button type="button" id="consent-accept" style="background:#333; color:#fff; border:none; padding:8px 16px; border-radius:4px; cursor:pointer; font-size:14px; font-weight:500;">Accept</button>' +
        '<button type="button" id="consent-reject" style="background:#fff; color:#333; border:1px solid #ddd; padding:8px 16px; border-radius:4px; cursor:pointer; font-size:14px; font-weight:500;">Reject</button>' +
      '</div>';
    document.body.appendChild(banner);

    document.getElementById('consent-accept').addEventListener('click', function () {
      setConsent('accepted');
      banner.remove();
      loadAnalytics(); // start tracking immediately, no reload
    });
    document.getElementById('consent-reject').addEventListener('click', function () {
      setConsent('rejected');
      banner.remove();
    });
  }

  var consent = getConsent();
  if (consent === 'accepted') {
    loadAnalytics();
  } else if (consent !== 'rejected') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showBanner);
    } else {
      showBanner();
    }
  }
})();
