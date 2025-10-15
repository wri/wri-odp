// Minimal Osano stub for E2E tests - prevents banner and satisfies consent checks
window.Osano = window.Osano || {
  cm: {
    getConsent: function () { return { ANALYTICS: 'GRANT' }; },
    showDrawer: function () {},
  }
};

