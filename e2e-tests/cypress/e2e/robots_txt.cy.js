describe('robots.txt Test', () => {
  it('should only contain custom rule', () => {
    cy.request('http://ckan-dev:5000/private-admin/robots.txt').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.contain('User-agent: *');
      expect(response.body).to.contain('Disallow: /');
      expect(response.body).not.to.contain('Disallow: /dataset/rate/');
      expect(response.body).not.to.contain('Disallow: /revision/');
      expect(response.body).not.to.contain('Crawl-Delay: 10');
    });
  });
});