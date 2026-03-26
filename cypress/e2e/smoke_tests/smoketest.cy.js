// <reference types="cypress" />

describe('SMOKE TESTS - Bilan de campagne', () => {
  
  describe('Smoke Test 1 : Vérifier la présence des champs et boutons de connexion', () => {
    
    it('devrait afficher tous les éléments du formulaire de connexion', () => {
      cy.visit('http://localhost:4200/#/login');
      
      cy.contains('h1', 'Se connecter').should('be.visible');

      cy.get('[data-cy=login-form]').should('be.visible');

      cy.get('[data-cy=login-input-username]')
        .should('be.visible')
        .should('have.attr', 'type', 'text');

      cy.get('label[for="username"]')
        .should('contain', 'Email');

      cy.get('[data-cy=login-input-password]')
        .should('be.visible')
        .should('have.attr', 'type', 'password');

      cy.get('label[for="password"]')
        .should('contain', 'Mot de passe');

      cy.get('[data-cy=login-submit]')
        .should('be.visible')
        .should('contain', 'Se connecter');

      cy.get('[data-cy=login-input-username]').should('not.be.disabled');
      cy.get('[data-cy=login-input-password]').should('not.be.disabled');

      cy.contains('a', "S'inscrire").should('be.visible');
    });
  });

  describe("Smoke Test 2 : Vérifier la présence des boutons d'ajout au panier quand vous êtes connecté", () => {
    
    beforeEach(() => {
      cy.request({
        method: 'POST',
        url: 'http://localhost:8081/login',
        body: { username: 'test2@test.fr', password: 'testtest' }
      }).then((response) => {
        expect(response.status).to.eq(200);
        const token = response.body.token;

        // ✅ Injection AVANT chargement Angular (solution propre)
        cy.visit('http://localhost:4200/#/', {
          onBeforeLoad(win) {
            win.localStorage.setItem('user', token);
          }
        });

        // Vérification que l'utilisateur est bien connecté
        cy.get('[data-cy=nav-link-cart]').should('be.visible');
      });
    });

    it('devrait afficher les boutons "Consulter" sur la page d\'accueil', () => {
      cy.get('[data-cy=product-home]').should('have.length.greaterThan', 0);

      cy.get('[data-cy=product-home]').each(($product) => {
        cy.wrap($product)
          .find('[data-cy=product-home-link]')
          .should('be.visible')
          .should('contain', 'Consulter');
      });
    });

    it('devrait afficher les boutons "Consulter" sur la page produits', () => {
      cy.visit('http://localhost:4200/#/products');

      cy.get('[data-cy=product]').should('have.length.greaterThan', 0);

      cy.get('[data-cy=product]').each(($product) => {
        cy.wrap($product)
          .find('[data-cy=product-link]')
          .should('be.visible')
          .should('contain', 'Consulter');
      });
    });

    it('devrait afficher le bouton "Ajouter au panier" sur la page détail produit', () => {
      cy.visit('http://localhost:4200/#/products');

      cy.get('[data-cy=product-link]').first().click();

      cy.url().should('include', '/products/');

      cy.get('[data-cy=detail-product-form]').should('be.visible');

      cy.get('[data-cy=detail-product-quantity]')
        .should('be.visible')
        .should('have.attr', 'type', 'number');

      cy.get('[data-cy=detail-product-add]')
        .should('be.visible')
        .should('contain', 'Ajouter au panier')
        .should('not.be.disabled');
    });

    it('devrait afficher le lien "Mon panier" dans la navigation quand connecté', () => {
      // ✅ IMPORTANT : PAS de cy.visit ici
      cy.get('[data-cy=nav-link-cart]')
        .should('be.visible')
        .should('contain', 'Mon panier');
    });
  });

  describe('Smoke Test Bonus : Vérifier que les boutons ne sont PAS présents pour un utilisateur NON connecté', () => {
    
    beforeEach(() => {
      cy.visit('http://localhost:4200/#/', {
        onBeforeLoad(win) {
          win.localStorage.removeItem('user');
        }
      });
    });

    it('ne devrait PAS afficher le lien "Mon panier" dans la navigation si non connecté', () => {
      cy.get('[data-cy=nav-link-cart]').should('not.exist');

      cy.get('[data-cy=nav-link-login]').should('be.visible');
      cy.get('[data-cy=nav-link-register]').should('be.visible');
    });
  });
});