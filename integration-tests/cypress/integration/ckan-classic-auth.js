const ckanUserName = Cypress.env('CKAN_USERNAME')
const ckanUserPassword = Cypress.env('CKAN_PASSWORD')

Cypress.on('uncaught:exception', (err, runnable) => {
  console.log(err);
  return false;
})

describe('Anonymous users access', () => {
  it('Anonymous user can see the UI', () => {
    cy.clearCookies()
    cy.request({ url: '/', failOnStatusCode: false }).then((resp) => {
      expect(resp.status).to.eq(200)
    })
  })

})


describe('Authorized users', () => {
  beforeEach(function () {
    cy.login(ckanUserName, ckanUserPassword)

  })

  it('Should Login Successfully', () => {
    cy.get('.username')
  })

})
