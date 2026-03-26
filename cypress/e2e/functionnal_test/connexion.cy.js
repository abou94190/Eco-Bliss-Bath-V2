// cypress/e2e/functionnal_test/connexion.cy.js

describe('Tests Fonctionnels - 1. Connexion', () => {

  beforeEach(() => {
    cy.visit('http://localhost:4200/#/login');
  });

  it('devrait afficher la page de connexion avec le formulaire', () => {
    cy.log('=== TEST : Affichage de la page de connexion ===');

    // Vérifier que la page de connexion s'affiche
    cy.url().should('include', '/login');
    cy.log('✓ URL contient "/login"');

    // Vérifier la présence du formulaire
    cy.get('[data-cy=login-form]')
      .should('exist')
      .should('be.visible');
    cy.log('✓ Formulaire de connexion présent et visible');

    // Vérifier la présence du champ email
    cy.get('[data-cy=login-input-username]')
      .should('exist')
      .should('be.visible');
    cy.log('✓ Champ email présent');

    // Vérifier la présence du champ mot de passe
    cy.get('[data-cy=login-input-password]')
      .should('exist')
      .should('be.visible');
    cy.log('✓ Champ mot de passe présent');

    // Vérifier la présence du bouton de connexion
    cy.get('[data-cy=login-submit]')
      .should('exist')
      .should('be.visible')
      .should('contain', 'Se connecter');
    cy.log('✓ Bouton "Se connecter" présent');

    cy.log('=== PAGE DE CONNEXION AFFICHÉE CORRECTEMENT ===');
  });

  it('devrait connecter l\'utilisateur avec des identifiants valides', () => {
    cy.log('=== TEST : Connexion avec identifiants valides ===');

    // Saisir l'email
    cy.get('[data-cy=login-input-username]')
      .should('be.visible')
      .type('test2@test.fr');
    cy.log('✓ Email "test2@test.fr" saisi');

    // Saisir le mot de passe
    cy.get('[data-cy=login-input-password]')
      .should('be.visible')
      .type('testtest');
    cy.log('✓ Mot de passe saisi');

    // Cliquer sur le bouton de connexion
    cy.get('[data-cy=login-submit]').click();
    cy.log('✓ Bouton "Se connecter" cliqué');

    // Vérifier que l'utilisateur est redirigé (hors de la page login)
    cy.url().should('not.include', '/login');
    cy.log('✓ Redirection effectuée après connexion');

    // Vérifier que le bouton panier est visible (signe que l'on est connecté)
    cy.get('[data-cy=nav-link-cart]')
      .should('exist')
      .should('be.visible')
      .should('contain', 'Mon panier');
    cy.log('✓ Bouton panier visible → utilisateur connecté');

    cy.log('=== CONNEXION RÉUSSIE ===');
  });

  it('devrait afficher une erreur avec un email inconnu', () => {
    cy.log('=== TEST : Connexion avec email inconnu ===');

    cy.get('[data-cy=login-input-username]').type('inconnu@test.fr');
    cy.get('[data-cy=login-input-password]').type('testtest');
    cy.get('[data-cy=login-submit]').click();
    cy.log('✓ Tentative de connexion avec un email inconnu');

    // Vérifier qu'un message d'erreur s'affiche
    cy.get('[data-cy=login-errors]')
      .should('exist')
      .should('be.visible')
      .should('contain', 'Identifiants incorrects');
    cy.log('✓ Message d\'erreur affiché');

    // Vérifier que l'on reste sur la page de connexion
    cy.url().should('include', '/login');
    cy.log('✓ L\'utilisateur reste sur la page de connexion');

    cy.log('=== ÉCHEC DE CONNEXION CORRECTEMENT GÉRÉ ===');
  });

  it('devrait afficher une erreur avec un mauvais mot de passe', () => {
    cy.log('=== TEST : Connexion avec mauvais mot de passe ===');

    cy.get('[data-cy=login-input-username]').type('test2@test.fr');
    cy.get('[data-cy=login-input-password]').type('mauvaismdp');
    cy.get('[data-cy=login-submit]').click();
    cy.log('✓ Tentative de connexion avec un mauvais mot de passe');

    cy.get('[data-cy=login-errors]')
      .should('exist')
      .should('be.visible')
      .should('contain', 'Identifiants incorrects');
    cy.log('✓ Message d\'erreur affiché');

    cy.url().should('include', '/login');
    cy.log('✓ L\'utilisateur reste sur la page de connexion');

    cy.log('=== MAUVAIS MOT DE PASSE CORRECTEMENT GÉRÉ ===');
  });

  it('devrait afficher une erreur si les champs sont vides', () => {
    cy.log('=== TEST : Connexion avec champs vides ===');

    // Cliquer directement sans rien saisir
    cy.get('[data-cy=login-submit]').click();
    cy.log('✓ Tentative de connexion sans saisie');

    // Vérifier qu'un message d'erreur s'affiche
    cy.get('[data-cy=login-errors]')
      .should('exist')
      .should('be.visible');
    cy.log('✓ Message d\'erreur affiché pour champs vides');

    // Vérifier que l'on reste sur la page de connexion
    cy.url().should('include', '/login');
    cy.log('✓ L\'utilisateur reste sur la page de connexion');

    cy.log('=== CHAMPS VIDES CORRECTEMENT GÉRÉS ===');
  });

  it('devrait déconnecter l\'utilisateur après connexion', () => {
    cy.log('=== TEST : Déconnexion après connexion ===');

    // Connexion
    cy.get('[data-cy=login-input-username]').type('test2@test.fr');
    cy.get('[data-cy=login-input-password]').type('testtest');
    cy.get('[data-cy=login-submit]').click();
    cy.url().should('not.include', '/login');
    cy.log('✓ Connexion effectuée');

    // Déconnexion
    cy.get('[data-cy=nav-link-logout]')
      .should('be.visible')
      .click();
    cy.log('✓ Bouton déconnexion cliqué');

    // Vérifier que le lien panier n'est plus visible
    cy.get('[data-cy=nav-link-cart]').should('not.exist');
    cy.log('✓ Lien "Mon panier" disparu après déconnexion');

    // Vérifier que les liens connexion/inscription sont de nouveau présents
    cy.get('[data-cy=nav-link-login]').should('be.visible');
    cy.log('✓ Lien "Connexion" de nouveau visible');

    cy.log('=== DÉCONNEXION RÉUSSIE ===');
  });

});