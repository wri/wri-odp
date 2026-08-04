describe(
  "Meta Robots Tag Test",
  {
    retries: {
      runMode: 2,
      openMode: 0,
    },
  },
  () => {
    it('should contain a "noindex, nofollow" robots meta tag on the homepage', () => {
      cy.visit("http://ckan-dev:5000/private-admin/");
      cy.get('head meta[name="robots"]').should(
        "have.attr",
        "content",
        "noindex,nofollow",
      );
    });
  },
);
