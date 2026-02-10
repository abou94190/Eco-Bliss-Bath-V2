// cypress/e2e/api/testapi-post.cy.js

describe('Tests API POST', () => {
  const API_URL = 'http://localhost:8081';
  let authToken;
  let productIdAvailable;
  let productIdOutOfStock;

  before(() => {
    cy.log('=== PRÉPARATION DES TESTS ===');
    
    cy.request({
      method: 'GET',
      url: `${API_URL}/products`
    }).then((response) => {
      const products = response.body;
      
      const availableProduct = products.find(p => p.availableStock > 0);
      if (availableProduct) {
        productIdAvailable = availableProduct.id;
      }
      
      const outOfStockProduct = products.find(p => p.availableStock === 0);
      if (outOfStockProduct) {
        productIdOutOfStock = outOfStockProduct.id;
      }
    });
  });

  describe('1. Login - Authentification', () => {
    it('devrait retourner 401 pour un utilisateur inconnu', () => {
      cy.request({
        method: 'POST',
        url: `${API_URL}/login`,
        body: {
          username: 'utilisateur.inexistant@test.com',
          password: 'mauvaisMotDePasse123'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });

    it('devrait retourner 200 et un token pour un utilisateur connu', () => {
      cy.request({
        method: 'POST',
        url: `${API_URL}/login`,
        body: {
          username: 'test2@test.fr',
          password: 'testtest'
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('token');
        authToken = response.body.token;
      });
    });

    it('devrait retourner une erreur avec des identifiants vides', () => {
      cy.request({
        method: 'POST',
        url: `${API_URL}/login`,
        body: { username: '', password: '' },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 401]);
      });
    });

    it('devrait retourner une erreur avec seulement le username', () => {
      cy.request({
        method: 'POST',
        url: `${API_URL}/login`,
        body: { username: 'test@test.com' },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 401]);
      });
    });
  });

  describe('2. Ajouter un produit au panier', () => {
    beforeEach(() => {
      cy.request({
        method: 'POST',
        url: `${API_URL}/login`,
        body: {
          username: 'test2@test.fr',
          password: 'testtest'
        }
      }).then((response) => {
        authToken = response.body.token;
      });
    });

    it('devrait ajouter un produit disponible au panier', () => {
      cy.request({
        method: 'PUT',
        url: `${API_URL}/orders/add`,
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: { product: productIdAvailable, quantity: 1 }
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it('devrait ajouter plusieurs unités d\'un produit disponible', () => {
      cy.request({
        method: 'PUT',
        url: `${API_URL}/orders/add`,
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: { product: productIdAvailable, quantity: 3 }
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    // CORRECTION : Utilisation de function() pour permettre l'usage de this.skip()
    it('devrait gérer l\'ajout d\'un produit en rupture de stock', function() {
      if (!productIdOutOfStock) {
        cy.log('⚠ SKIP : Aucun produit en rupture de stock trouvé');
        this.skip(); 
        return;
      }

      cy.request({
        method: 'PUT',
        url: `${API_URL}/orders/add`,
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: { product: productIdOutOfStock, quantity: 1 },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 409, 422]);
      });
    });

    it('devrait retourner 401 sans authentification', () => {
      cy.request({
        method: 'PUT',
        url: `${API_URL}/orders/add`,
        body: { product: productIdAvailable, quantity: 1 },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });

    it('devrait gérer les quantités invalides (négative)', () => {
      cy.request({
        method: 'PUT',
        url: `${API_URL}/orders/add`,
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: { product: productIdAvailable, quantity: -1 },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 422]);
      });
    });

    it('devrait gérer les quantités invalides (zéro)', () => {
      cy.request({
        method: 'PUT',
        url: `${API_URL}/orders/add`,
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: { product: productIdAvailable, quantity: 0 },
        failOnStatusCode: false
      }).then((response) => {
        // Attend une erreur (400 ou 422)
        expect(response.status).to.be.oneOf([400, 422]);
      });
    });

    it('devrait gérer un produit inexistant', () => {
      const invalidProductId = 99999;
      cy.request({
        method: 'PUT',
        url: `${API_URL}/orders/add`,
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: { product: invalidProductId, quantity: 1 },
        failOnStatusCode: false
      }).then((response) => {
        // Attend 404 ou 422
        expect(response.status).to.be.oneOf([404, 422]);
      });
    });
  });

  describe('3. Ajouter un avis', () => {
    beforeEach(() => {
      cy.request({
        method: 'POST',
        url: `${API_URL}/login`,
        body: {
          username: 'test2@test.fr',
          password: 'testtest'
        }
      }).then((response) => {
        authToken = response.body.token;
      });
    });

    it('devrait ajouter un avis valide avec note 5/5', () => {
      const reviewData = {
        title: 'Excellent produit !',
        comment: 'Très satisfait de mon achat.',
        rating: 5
      };
      
      cy.request({
        method: 'POST',
        url: `${API_URL}/reviews`,
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: reviewData
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it('devrait ajouter un avis avec note moyenne (3/5)', () => {
      cy.request({
        method: 'POST',
        url: `${API_URL}/reviews`,
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: { title: 'Correct', comment: 'Moyen.', rating: 3 }
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it('devrait ajouter un avis négatif (1/5)', () => {
      cy.request({
        method: 'POST',
        url: `${API_URL}/reviews`,
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: { title: 'Déçu', comment: 'Bof.', rating: 1 }
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it('devrait retourner 401 sans authentification', () => {
      cy.request({
        method: 'POST',
        url: `${API_URL}/reviews`,
        body: { title: 'Test', comment: 'Test', rating: 4 },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });

    it('devrait rejeter un avis avec une note invalide (> 5)', () => {
      cy.request({
        method: 'POST',
        url: `${API_URL}/reviews`,
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: { title: 'Test', comment: 'Test', rating: 10 },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 422]);
      });
    });

    it('devrait rejeter un avis avec une note invalide (< 1)', () => {
      cy.request({
        method: 'POST',
        url: `${API_URL}/reviews`,
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: { title: 'Test', comment: 'Test', rating: 0 },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 422]);
      });
    });

    it('devrait rejeter un avis avec des champs manquants', () => {
      cy.request({
        method: 'POST',
        url: `${API_URL}/reviews`,
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: { title: 'Test' },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 422]);
      });
    });

    it('devrait rejeter un avis avec titre vide', () => {
      cy.request({
        method: 'POST',
        url: `${API_URL}/reviews`,
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: { title: '', comment: 'Commentaire', rating: 4 },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 422]);
      });
    });

    it('devrait rejeter un avis avec commentaire vide', () => {
      cy.request({
        method: 'POST',
        url: `${API_URL}/reviews`,
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: { title: 'Titre', comment: '', rating: 4 },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 422]);
      });
    });
  });
});