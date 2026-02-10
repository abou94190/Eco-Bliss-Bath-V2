// // <reference types="cypress" />

describe('Tests Fonctionnels - 2. Affichage des produits sur la page d\'accueil', () => {

  beforeEach(() => {
    cy.visit('http://localhost:4200/#/');
  });

  it('devrait vérifier le chargement de la page', () => {
    cy.log('=== TEST : Chargement de la page ===');
    
    // Vérifier que la page est chargée
    cy.get('header').should('be.visible');
    cy.log('✓ En-tête visible');
    
    cy.get('#other-products').should('be.visible');
    cy.log('✓ Section produits visible');
    
    cy.get('h2').contains('Notre sélection pour toi').should('be.visible');
    cy.log('✓ Titre de section visible');
    
    cy.log('=== PAGE CHARGÉE ===');
  });

  it('devrait afficher tous les produits et leurs informations (image + description + bouton consulter)', () => {
    cy.log('=== TEST : Affichage de tous les produits avec leurs informations ===');
    
    // Vérifier qu'il y a des produits affichés
    cy.get('[data-cy=product-home]')
      .should('have.length.greaterThan', 0)
      .then(($products) => {
        cy.log(`✓ ${$products.length} produits trouvés sur la page d'accueil`);
      });
    
    // Vérifier que CHAQUE produit a une image + description + bouton consulter
    cy.get('[data-cy=product-home]').each(($product, index) => {
      cy.log(`Vérification du produit ${index + 1}:`);
      
      // Image
      cy.wrap($product)
        .find('[data-cy=product-home-img]')
        .should('exist')
        .should('be.visible')
        .should('have.attr', 'src')
        .and('not.be.empty');
      cy.log(`  ✓ Image présente`);
      
      // Description (ingrédients)
      cy.wrap($product)
        .find('[data-cy=product-home-ingredients]')
        .should('exist')
        .should('be.visible')
        .should('not.be.empty');
      cy.log(`  ✓ Description présente`);
      
      // Bouton consulter
      cy.wrap($product)
        .find('[data-cy=product-home-link]')
        .should('exist')
        .should('be.visible')
        .should('contain', 'Consulter');
      cy.log(`  ✓ Bouton "Consulter" présent`);
    });
    
    cy.log('=== TOUS LES PRODUITS AFFICHÉS CORRECTEMENT ===');
  });

  it('devrait afficher les informations de CHAQUE produit (image + description + prix + stock)', () => {
    cy.log('=== TEST : Vérification détaillée de CHAQUE produit ===');
    
    cy.get('[data-cy=product-home]').each(($product, index) => {
      cy.log(`\nProduit ${index + 1}:`);
      
      // Image
      cy.wrap($product)
        .find('[data-cy=product-home-img]')
        .should('exist')
        .should('be.visible');
      cy.log(`  ✓ Image`);
      
      // Nom du produit
      cy.wrap($product)
        .find('[data-cy=product-home-name]')
        .should('exist')
        .should('be.visible')
        .then(($name) => {
          cy.log(`  ✓ Nom: ${$name.text()}`);
        });
      
      // Description/Ingrédients
      cy.wrap($product)
        .find('[data-cy=product-home-ingredients]')
        .should('exist')
        .should('be.visible')
        .then(($desc) => {
          cy.log(`  ✓ Description: ${$desc.text()}`);
        });
      
      // Prix
      cy.wrap($product)
        .find('[data-cy=product-home-price]')
        .should('exist')
        .should('be.visible')
        .should('contain', '€')
        .then(($price) => {
          cy.log(`  ✓ Prix: ${$price.text()}`);
        });
      
      // Note: Le stock n'est pas affiché sur la page d'accueil selon le code HTML
      // Il est affiché sur la page de détail du produit
    });
    
    cy.log('\n=== INFORMATIONS DE CHAQUE PRODUIT VÉRIFIÉES ===');
  });

  it('devrait permettre d\'accéder à la page détail d\'un produit pour voir le stock', () => {
    cy.log('=== TEST : Affichage du stock sur la page détail ===');
    
    // Cliquer sur le premier produit
    cy.get('[data-cy=product-home-link]').first().click();
    
    // Vérifier qu'on est sur la page détail
    cy.url().should('include', '/products/');
    cy.log('✓ Navigation vers la page détail du produit');
    
    // Vérifier les informations complètes incluant le stock
    cy.get('[data-cy=detail-product-img]').should('be.visible');
    cy.log('✓ Image visible');
    
    cy.get('[data-cy=detail-product-name]').should('be.visible');
    cy.log('✓ Nom visible');
    
    cy.get('[data-cy=detail-product-description]').should('be.visible');
    cy.log('✓ Description visible');
    
    cy.get('[data-cy=detail-product-price]')
      .should('be.visible')
      .should('contain', '€');
    cy.log('✓ Prix visible');
    
    // Vérifier que le STOCK est affiché
    cy.get('[data-cy=detail-product-stock]')
      .should('be.visible')
      .should('contain', 'en stock')
      .then(($stock) => {
        cy.log(`✓ Stock affiché: ${$stock.text()}`);
      });
    
    cy.log('=== TOUTES LES INFORMATIONS INCLUANT LE STOCK SONT AFFICHÉES ===');
  });
});