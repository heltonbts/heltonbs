// Google Analytics 4
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag('js', new Date());
gtag('config', 'G-99V8RYFSHT');

(function () {
  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-99V8RYFSHT';
  document.head.appendChild(script);
})();

// Track CTA clicks via data-analytics-event attributes
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-analytics-event]').forEach(function (el) {
    el.addEventListener('click', function () {
      if (typeof gtag === 'function') {
        gtag('event', this.getAttribute('data-analytics-event'), {
          event_label: this.getAttribute('data-analytics-label') || '',
        });
      }
    });
  });
});
