/// <reference types="cypress" />

describe('Smoke Tests - Vérification de la présence des éléments UI', () => {
  
  describe('1. Vérifier la présence des champs et boutons de connexion', () => {
    
    beforeEach(() => {
      cy.visit('http://localhost:4200/#/login');
    });

    it('devrait afficher le formulaire de connexion complet', () => {
      cy.log('=== TEST : Vérification du formulaire de connexion ===');
      
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
      cy.log('✓ Champ email/username présent et visible');

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
        .should('not.be.disabled')
        .type('test@example.com')
        .should('have.value', 'test@example.com');
      cy.log('✓ Champ email est modifiable');

      cy.get('[data-cy=login-input-password]')
        .should('not.be.disabled')
        .type('password123')
        .should('have.value', 'password123');
      cy.log('✓ Champ mot de passe est modifiable');

      cy.log('=== TOUS LES ÉLÉMENTS DU FORMULAIRE DE CONNEXION SONT PRÉSENTS ===');
    });

    it('devrait afficher le lien vers l\'inscription', () => {
      cy.log('=== TEST : Vérification du lien vers l\'inscription ===');
      
      cy.contains('a', 'S\'inscrire')
        .should('exist')
        .should('be.visible')
        .should('have.attr', 'href')
        .and('include', 'register');
      
      cy.log('✓ Lien vers la page d\'inscription présent');
    });

    it('devrait permettre de naviguer vers la page d\'inscription', () => {
      cy.log('=== TEST : Navigation vers l\'inscription ===');
      
      cy.contains('a', 'S\'inscrire').click();
      cy.url().should('include', '/register');
      
      cy.log('✓ Navigation vers la page d\'inscription fonctionne');
    });
  });

  describe('2. Vérifier la présence des boutons d\'ajout au panier (utilisateur connecté)', () => {
    
    before(() => {
      cy.log('=== CONNEXION AVANT LES TESTS ===');
      
      // Se connecter une fois avant tous les tests
      cy.visit('http://localhost:4200/#/login');
      cy.get('[data-cy=login-input-username]').type('test@test.com');
      cy.get('[data-cy=login-input-password]').type('test123');
      cy.get('[data-cy=login-submit]').click();
      
      // Attendre que la connexion soit effective
      cy.url().should('not.include', '/login');
      cy.log('✓ Connexion effectuée avec succès');
    });

    beforeEach(() => {
      // Vérifier que l'utilisateur est toujours connecté
      cy.window().then((win) => {
        const token = win.localStorage.getItem('user');
        if (!token) {
          // Reconnecter si nécessaire
          cy.visit('http://localhost:4200/#/login');
          cy.get('[data-cy=login-input-username]').type('test@test.com');
          cy.get('[data-cy=login-input-password]').type('test123');
          cy.get('[data-cy=login-submit]').click();
          cy.url().should('not.include', '/login');
        }
      });
    });

    it('devrait afficher les boutons "Consulter" sur la page d\'accueil', () => {
      cy.log('=== TEST : Boutons sur la page d\'accueil ===');
      
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
      
      cy.log('✓ Tous les produits ont un bouton "Consulter"');
    });

    it('devrait afficher les boutons "Consulter" sur la page produits', () => {
      cy.log('=== TEST : Boutons sur la page produits ===');
      
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
      
      cy.log('✓ Tous les produits ont un bouton "Consulter"');
    });

    it('devrait afficher le bouton "Ajouter au panier" sur la page détail produit', () => {
      cy.log('=== TEST : Bouton "Ajouter au panier" sur page détail ===');
      
      // Aller sur la page produits
      cy.visit('http://localhost:4200/#/products');
      
      // Cliquer sur le premier produit
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
      cy.log('✓ Champ quantité présent et visible');

      // Vérifier la présence du bouton "Ajouter au panier"
      cy.get('[data-cy=detail-product-add]')
        .should('exist')
        .should('be.visible')
        .should('contain', 'Ajouter au panier');
      cy.log('✓ Bouton "Ajouter au panier" présent et visible');

      // Vérifier que le bouton n'est pas désactivé
      cy.get('[data-cy=detail-product-add]')
        .should('not.be.disabled');
      cy.log('✓ Bouton "Ajouter au panier" est cliquable');
    });

    it('devrait permettre de modifier la quantité avant d\'ajouter au panier', () => {
      cy.log('=== TEST : Modification de la quantité ===');
      
      cy.visit('http://localhost:4200/#/products');
      cy.get('[data-cy=product-link]').first().click();
      
      // Vérifier la valeur par défaut
      cy.get('[data-cy=detail-product-quantity]')
        .should('have.value', '1');
      cy.log('✓ Quantité par défaut = 1');

      // Modifier la quantité
      cy.get('[data-cy=detail-product-quantity]')
        .clear()
        .type('3')
        .should('have.value', '3');
      cy.log('✓ Quantité modifiable (testée avec 3)');

      // Vérifier que le bouton est toujours cliquable
      cy.get('[data-cy=detail-product-add]')
        .should('not.be.disabled');
      cy.log('✓ Bouton reste cliquable après modification de la quantité');
    });

    it('devrait afficher toutes les informations du produit sur la page détail', () => {
      cy.log('=== TEST : Informations produit complètes ===');
      
      cy.visit('http://localhost:4200/#/products');
      cy.get('[data-cy=product-link]').first().click();
      
      // Vérifier les éléments d'information
      cy.get('[data-cy=detail-product-img]')
        .should('exist')
        .should('be.visible');
      cy.log('✓ Image du produit présente');

      cy.get('[data-cy=detail-product-name]')
        .should('exist')
        .should('be.visible')
        .should('not.be.empty');
      cy.log('✓ Nom du produit présent');

      cy.get('[data-cy=detail-product-description]')
        .should('exist')
        .should('be.visible')
        .should('not.be.empty');
      cy.log('✓ Description du produit présente');

      cy.get('[data-cy=detail-product-price]')
        .should('exist')
        .should('be.visible')
        .should('not.be.empty');
      cy.log('✓ Prix du produit présent');

      cy.get('[data-cy=detail-product-stock]')
        .should('exist')
        .should('be.visible')
        .should('not.be.empty');
      cy.log('✓ Stock du produit présent');

      cy.get('[data-cy=detail-product-skin]')
        .should('exist')
        .should('be.visible');
      cy.log('✓ Information "Peau" présente');

      cy.get('[data-cy=detail-product-aromas]')
        .should('exist')
        .should('be.visible');
      cy.log('✓ Information "Arômes" présente');

      cy.get('[data-cy=detail-product-ingredients]')
        .should('exist')
        .should('be.visible');
      cy.log('✓ Information "Ingrédients" présente');

      cy.log('=== TOUTES LES INFORMATIONS PRODUIT SONT PRÉSENTES ===');
    });

    it('devrait afficher le lien vers le panier dans la navigation', () => {
      cy.log('=== TEST : Lien panier dans la navigation ===');
      
      cy.visit('http://localhost:4200/#/');
      
      // Vérifier que le lien "Mon panier" est présent
      cy.get('[data-cy=nav-link-cart]')
        .should('exist')
        .should('be.visible')
        .should('contain', 'Mon panier');
      
      cy.log('✓ Lien "Mon panier" présent dans la navigation');

      // Vérifier que le lien fonctionne
      cy.get('[data-cy=nav-link-cart]').click();
      cy.url().should('include', '/cart');
      
      cy.log('✓ Navigation vers le panier fonctionne');
    });

    after(() => {
      cy.log('=== NETTOYAGE : Déconnexion ===');
      
      // Se déconnecter à la fin des tests
      cy.visit('http://localhost:4200/#/');
      cy.get('[data-cy=nav-link-logout]').click();
      
      cy.log('✓ Déconnexion effectuée');
    });
  });

  describe('3. Vérifier que les boutons ne sont PAS présents pour un utilisateur non connecté', () => {
    
    beforeEach(() => {
      // S'assurer qu'on est déconnecté
      cy.window().then((win) => {
        win.localStorage.removeItem('user');
      });
    });

    it('devrait rediriger vers la page de connexion au clic sur "Ajouter au panier"', () => {
      cy.log('=== TEST : Redirection non connecté ===');
      
      cy.visit('http://localhost:4200/#/products');
      cy.get('[data-cy=product-link]').first().click();
      
      // Le bouton doit être présent mais rediriger vers login
      cy.get('[data-cy=detail-product-add]')
        .should('exist')
        .should('be.visible')
        .click();
      
      // Vérifier la redirection
      cy.url().should('include', '/login');
      
      cy.log('✓ Redirection vers la page de connexion pour utilisateur non connecté');
    });

    it('ne devrait PAS afficher le lien "Mon panier" dans la navigation', () => {
      cy.log('=== TEST : Pas de lien panier pour utilisateur non connecté ===');
      
      cy.visit('http://localhost:4200/#/');
      
      // Vérifier que le lien "Mon panier" n'existe pas
      cy.get('[data-cy=nav-link-cart]').should('not.exist');
      
      cy.log('✓ Lien "Mon panier" non présent pour utilisateur non connecté');

      // Vérifier que les liens connexion/inscription sont présents
      cy.get('[data-cy=nav-link-login]')
        .should('exist')
        .should('be.visible');
      cy.log('✓ Lien "Connexion" présent');

      cy.get('[data-cy=nav-link-register]')
        .should('exist')
        .should('be.visible');
      cy.log('✓ Lien "Inscription" présent');
    });
  });
});