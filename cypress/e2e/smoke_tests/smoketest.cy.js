// // <reference types="cypress" />

describe('SMOKE TESTS - Bilan de campagne', () => {
  
  describe('Smoke Test 1 : Vérifier la présence des champs et boutons de connexion', () => {
    
    it('devrait afficher tous les éléments du formulaire de connexion', () => {
      cy.log('=== SMOKE TEST : Présence des champs et boutons de connexion ===');
      
      cy.visit('http://localhost:4200/#/login');
      
      // Vérifier la présence du titre
      cy.contains('h1', 'Se connecter').should('be.visible');
      cy.log('✓ Titre "Se connecter" présent');

      // Vérifier la présence du formulaire
      cy.get('[data-cy=login-form]').should('exist').should('be.visible');
      cy.log('✓ Formulaire de connexion présent');

      // Vérifier la présence du champ email/username
      cy.get('[data-cy=login-input-username]')
        .should('exist')
        .should('be.visible')
        .should('have.attr', 'type', 'text');
      cy.log('✓ Champ email présent et visible');

      // Vérifier le label du champ email
      cy.get('label[for="username"]')
        .should('exist')
        .should('be.visible')
        .should('contain', 'Email');
      cy.log('✓ Label "Email" présent');

      // Vérifier la présence du champ mot de passe
      cy.get('[data-cy=login-input-password]')
        .should('exist')
        .should('be.visible')
        .should('have.attr', 'type', 'password');
      cy.log('✓ Champ mot de passe présent et visible');

      // Vérifier le label du champ mot de passe
      cy.get('label[for="password"]')
        .should('exist')
        .should('be.visible')
        .should('contain', 'Mot de passe');
      cy.log('✓ Label "Mot de passe" présent');

      // Vérifier la présence du bouton de connexion
      cy.get('[data-cy=login-submit]')
        .should('exist')
        .should('be.visible')
        .should('contain', 'Se connecter');
      cy.log('✓ Bouton "Se connecter" présent et visible');

      // Vérifier que les champs sont modifiables
      cy.get('[data-cy=login-input-username]')
        .should('not.be.disabled');
      cy.log('✓ Champ email est modifiable');

      cy.get('[data-cy=login-input-password]')
        .should('not.be.disabled');
      cy.log('✓ Champ mot de passe est modifiable');
      
      // Vérifier le lien vers l'inscription
      cy.contains('a', 'S\'inscrire')
        .should('exist')
        .should('be.visible');
      cy.log('✓ Lien "S\'inscrire" présent');

      cy.log('=== ✓ SMOKE TEST RÉUSSI : Tous les éléments de connexion présents ===');
    });
  });

  describe('Smoke Test 2 : Vérifier la présence des boutons d\'ajout au panier quand vous êtes connecté', () => {
    
    before(() => {
      cy.log('=== CONNEXION PRÉALABLE POUR LES SMOKE TESTS ===');
      
      // Se connecter
      cy.visit('http://localhost:4200/#/login');
      cy.get('[data-cy=login-input-username]').type('test@test.com');
      cy.get('[data-cy=login-input-password]').type('test123');
      cy.get('[data-cy=login-submit]').click();
      cy.url().should('not.include', '/login');
      cy.log('✓ Connexion effectuée');
    });

    it('devrait afficher les boutons "Consulter" sur la page d\'accueil', () => {
      cy.log('=== SMOKE TEST : Boutons sur la page d\'accueil ===');
      
      cy.visit('http://localhost:4200/#/');
      
      // Vérifier qu'il y a des produits affichés
      cy.get('[data-cy=product-home]').should('have.length.greaterThan', 0);
      cy.log('✓ Produits affichés sur la page d\'accueil');

      // Vérifier que chaque produit a un bouton "Consulter"
      cy.get('[data-cy=product-home]').each(($product) => {
        cy.wrap($product)
          .find('[data-cy=product-home-link]')
          .should('exist')
          .should('be.visible')
          .should('contain', 'Consulter');
      });
      
      cy.log('=== ✓ SMOKE TEST RÉUSSI : Boutons "Consulter" présents sur page d\'accueil ===');
    });

    it('devrait afficher les boutons "Consulter" sur la page produits', () => {
      cy.log('=== SMOKE TEST : Boutons sur la page produits ===');
      
      cy.visit('http://localhost:4200/#/products');
      
      // Vérifier qu'il y a des produits affichés
      cy.get('[data-cy=product]').should('have.length.greaterThan', 0);
      cy.log('✓ Produits affichés sur la page produits');

      // Vérifier que chaque produit a un bouton "Consulter"
      cy.get('[data-cy=product]').each(($product) => {
        cy.wrap($product)
          .find('[data-cy=product-link]')
          .should('exist')
          .should('be.visible')
          .should('contain', 'Consulter');
      });
      
      cy.log('=== ✓ SMOKE TEST RÉUSSI : Boutons "Consulter" présents sur page produits ===');
    });

    it('devrait afficher le bouton "Ajouter au panier" sur la page détail produit', () => {
      cy.log('=== SMOKE TEST : Bouton "Ajouter au panier" sur page détail ===');
      
      cy.visit('http://localhost:4200/#/products');
      cy.get('[data-cy=product-link]').first().click();
      
      // Vérifier l'URL
      cy.url().should('include', '/products/');
      cy.log('✓ Navigation vers la page détail produit');

      // Vérifier la présence du formulaire d'ajout au panier
      cy.get('[data-cy=detail-product-form]')
        .should('exist')
        .should('be.visible');
      cy.log('✓ Formulaire d\'ajout au panier présent');

      // Vérifier la présence du champ quantité
      cy.get('[data-cy=detail-product-quantity]')
        .should('exist')
        .should('be.visible')
        .should('have.attr', 'type', 'number');
      cy.log('✓ Champ quantité présent');

      // Vérifier la présence du bouton "Ajouter au panier"
      cy.get('[data-cy=detail-product-add]')
        .should('exist')
        .should('be.visible')
        .should('contain', 'Ajouter au panier')
        .should('not.be.disabled');
      cy.log('✓ Bouton "Ajouter au panier" présent et cliquable');

      cy.log('=== ✓ SMOKE TEST RÉUSSI : Bouton "Ajouter au panier" présent ===');
    });

    it('devrait afficher le lien "Mon panier" dans la navigation quand connecté', () => {
      cy.log('=== SMOKE TEST : Lien panier dans navigation ===');
      
      cy.visit('http://localhost:4200/#/');
      
      // Vérifier que le lien "Mon panier" est présent
      cy.get('[data-cy=nav-link-cart]')
        .should('exist')
        .should('be.visible')
        .should('contain', 'Mon panier');
      cy.log('✓ Lien "Mon panier" présent dans la navigation');

      cy.log('=== ✓ SMOKE TEST RÉUSSI : Lien panier présent ===');
    });

    after(() => {
      cy.log('=== NETTOYAGE : Déconnexion ===');
      cy.visit('http://localhost:4200/#/');
      cy.get('[data-cy=nav-link-logout]').click();
      cy.log('✓ Déconnexion effectuée');
    });
  });

  describe('Smoke Test Bonus : Vérifier que les boutons ne sont PAS présents pour un utilisateur NON connecté', () => {
    
    beforeEach(() => {
      // S'assurer qu'on est déconnecté
      cy.window().then((win) => {
        win.localStorage.removeItem('user');
      });
    });

    it('ne devrait PAS afficher le lien "Mon panier" dans la navigation si non connecté', () => {
      cy.log('=== SMOKE TEST : Pas de lien panier si non connecté ===');
      
      cy.visit('http://localhost:4200/#/');
      
      // Vérifier que le lien "Mon panier" n'existe pas
      cy.get('[data-cy=nav-link-cart]').should('not.exist');
      cy.log('✓ Lien "Mon panier" non présent');

      // Vérifier que les liens connexion/inscription sont présents
      cy.get('[data-cy=nav-link-login]')
        .should('exist')
        .should('be.visible');
      cy.log('✓ Lien "Connexion" présent');

      cy.get('[data-cy=nav-link-register]')
        .should('exist')
        .should('be.visible');
      cy.log('✓ Lien "Inscription" présent');

      cy.log('=== ✓ SMOKE TEST RÉUSSI : Interface correcte pour utilisateur non connecté ===');
    });
  });
});