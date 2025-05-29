let ip = "74.117.171.111";

describe('app', () => {



  beforeEach(() => {
    cy.clearLocalStorage();
  });


  it('login', () => {


    cy.visit(`https://${ip}`);

    cy.viewport('iphone-se2');
    cy.pause()

    cy.viewport('macbook-13');
    cy.pause()

    cy.get('input[name=username]').type('uafs', { delay: 50 });
    cy.get('input[name=email]').type('uafs@uafs', { delay: 50 });
    cy.get('input[name=password]').type('uafs', { delay: 50 });
    cy.get('button[type=submit]').click();

    cy.viewport('iphone-se2');
    cy.pause()

    cy.viewport('macbook-13');
    cy.pause()
  });


  it('Analytics', () => { 
    cy.log('Analytics');
    cy.viewport('macbook-13');
    cy.visit(`https://${ip}/analytics`);
    cy.pause()
  });


  it('PMA', () => {
    cy.log('PMA');
    cy.viewport('macbook-13');
    cy.visit(`https://${ip}/pma`);
    cy.pause()
  });
  


});
