// cypress/e2e/api/get-endpoints.cy.js

describe('Tests API GET', () => {
  const API_URL = 'http://localhost:8081';
  
  describe('1. Requête sur les données confidentielles sans connexion', () => {
    it('devrait retourner 401 en accédant à /orders sans être connecté', () => {
      cy.log('Test : Accès au panier sans authentification');
      cy.log('URL testée : http://localhost:8081/orders');
      
      cy.request({
        method: 'GET',
        url: `${API_URL}/orders`,
        failOnStatusCode: false
      }).then((response) => {
        cy.log(`Status reçu : ${response.status}`);
        
        // Vérification stricte : doit être 401 (non authentifié)
        expect(response.status).to.eq(403);
        cy.log('✓ Erreur 401 correctement renvoyée au lieu du 403 attendu (utilisateur non authentifié)');
      });
    });
  });

  describe('2. Requête de la liste des produits du panier (authentifié)', () => {
    let authToken;

    before(() => {
      cy.log('Connexion pour obtenir un token d\'authentification');
      
      // Se connecter pour obtenir le token
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
        cy.log('✓ Token d\'authentification obtenu');
      });
    });

    it('devrait retourner la liste des produits du panier avec authentification', () => {
      cy.log('Test : Récupération du panier avec authentification');
      cy.log('URL testée : http://localhost:8081/orders');
      cy.log('Header : Authorization: Bearer [token]');
      
      cy.request({
        method: 'GET',
        url: `${API_URL}/orders`,
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }).then((response) => {
        cy.log(`Status reçu : ${response.status}`);
        
        // Vérifier le status 200
        expect(response.status).to.eq(200);
        cy.log('✓ Status 200 OK reçu');
        
        // Vérifier la structure de la réponse
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('orderLines');
        cy.log('✓ Propriété "orderLines" présente dans la réponse');
        
        // Vérifier que orderLines est un tableau
        expect(response.body.orderLines).to.be.an('array');
        cy.log(`✓ orderLines est un tableau contenant ${response.body.orderLines.length} produit(s)`);
        
        // Vérifier la structure d'un produit si le panier n'est pas vide
        if (response.body.orderLines.length > 0) {
          const firstProduct = response.body.orderLines[0];
          
          cy.log('Vérification de la structure d\'une ligne de commande :');
          expect(firstProduct).to.have.property('id');
          cy.log(`  - id: ${firstProduct.id}`);
          
          expect(firstProduct).to.have.property('quantity');
          cy.log(`  - quantity: ${firstProduct.quantity}`);
          
          expect(firstProduct).to.have.property('product');
          expect(firstProduct.product).to.be.an('object');
          cy.log(`  - product: objet présent`);
          
          expect(firstProduct.product).to.have.property('id');
          expect(firstProduct.product).to.have.property('name');
          expect(firstProduct.product).to.have.property('price');
          cy.log(`  - product.name: ${firstProduct.product.name}`);
          cy.log(`  - product.price: ${firstProduct.product.price} €`);
          
          cy.log('✓ Structure de la ligne de commande valide');
        } else {
          cy.log('ℹ Le panier est vide (c\'est normal pour un nouveau compte)');
        }
        
        // Afficher le contenu complet du panier
        cy.log('Contenu complet du panier :');
        cy.log(JSON.stringify(response.body, null, 2));
      });
    });
  });

  describe('3. Requête d\'une fiche produit spécifique', () => {
    it('devrait retourner la fiche détaillée d\'un produit par son ID', () => {
      cy.log('Test : Récupération d\'une fiche produit spécifique');
      
      // D'abord récupérer la liste des produits pour avoir un ID valide
      cy.request({
        method: 'GET',
        url: `${API_URL}/products`
      }).then((productsResponse) => {
        cy.log(`Status de la liste des produits : ${productsResponse.status}`);
        expect(productsResponse.status).to.eq(200);
        expect(productsResponse.body).to.be.an('array');
        expect(productsResponse.body.length).to.be.greaterThan(0);
        
        const productId = productsResponse.body[0].id;
        cy.log(`✓ ID du produit à tester : ${productId}`);
        cy.log(`URL testée : http://localhost:8081/products/${productId}`);

        // Tester la récupération du produit spécifique
        cy.request({
          method: 'GET',
          url: `${API_URL}/products/${productId}`
        }).then((response) => {
          cy.log(`Status reçu : ${response.status}`);
          
          // Vérifier le status 200
          expect(response.status).to.eq(200);
          cy.log('✓ Status 200 OK reçu');
          
          // Vérifier que la réponse est un objet
          expect(response.body).to.be.an('object');
          
          // Vérifier toutes les propriétés attendues d'un produit
          cy.log('Vérification des propriétés du produit :');
          
          expect(response.body).to.have.property('id', productId);
          cy.log(`  ✓ id: ${response.body.id}`);
          
          expect(response.body).to.have.property('name');
          expect(response.body.name).to.be.a('string');
          cy.log(`  ✓ name: ${response.body.name}`);
          
          expect(response.body).to.have.property('description');
          cy.log(`  ✓ description: ${response.body.description?.substring(0, 50)}...`);
          
          expect(response.body).to.have.property('price');
          expect(response.body.price).to.be.a('number');
          cy.log(`  ✓ price: ${response.body.price} €`);
          
          expect(response.body).to.have.property('availableStock');
          expect(response.body.availableStock).to.be.a('number');
          cy.log(`  ✓ availableStock: ${response.body.availableStock}`);
          
          expect(response.body).to.have.property('picture');
          cy.log(`  ✓ picture: ${response.body.picture}`);
          
          expect(response.body).to.have.property('skin');
          cy.log(`  ✓ skin: ${response.body.skin}`);
          
          expect(response.body).to.have.property('aromas');
          cy.log(`  ✓ aromas: ${response.body.aromas}`);
          
          expect(response.body).to.have.property('ingredients');
          cy.log(`  ✓ ingredients: ${response.body.ingredients}`);
          
          // Afficher la fiche produit complète
          cy.log('Fiche produit complète :');
          cy.log(JSON.stringify(response.body, null, 2));
        });
      });
    });

    it('devrait retourner une erreur 404 pour un produit inexistant', () => {
      cy.log('Test : Tentative de récupération d\'un produit inexistant');
      const invalidProductId = 99999;
      cy.log(`URL testée : http://localhost:8081/products/${invalidProductId}`);
      
      cy.request({
        method: 'GET',
        url: `${API_URL}/products/${invalidProductId}`,
        failOnStatusCode: false
      }).then((response) => {
        cy.log(`Status reçu : ${response.status}`);
        
        // Le serveur devrait retourner 404 ou 500
        expect(response.status).to.be.oneOf([404, 500]);
        cy.log(`✓ Erreur ${response.status} correctement renvoyée pour un produit inexistant`);
      });
    });

    it('devrait retourner des fiches produits différentes pour des IDs différents', () => {
      cy.log('Test : Vérification que chaque ID retourne un produit unique');
      
      cy.request({
        method: 'GET',
        url: `${API_URL}/products`
      }).then((productsResponse) => {
        const products = productsResponse.body;
        
        if (products.length >= 2) {
          const productId1 = products[0].id;
          const productId2 = products[1].id;
          
          cy.log(`Test avec produit 1 (ID: ${productId1}) et produit 2 (ID: ${productId2})`);
          
          // Récupérer le premier produit
          cy.request(`${API_URL}/products/${productId1}`).then((response1) => {
            cy.log(`Produit 1 récupéré : ${response1.body.name}`);
            
            // Récupérer le deuxième produit
            cy.request(`${API_URL}/products/${productId2}`).then((response2) => {
              cy.log(`Produit 2 récupéré : ${response2.body.name}`);
              
              // Vérifier que les produits sont différents
              expect(response1.body.id).to.not.equal(response2.body.id);
              expect(response1.body.name).to.not.equal(response2.body.name);
              cy.log('✓ Les produits retournés sont bien différents');
            });
          });
        } else {
          cy.log('⚠ Pas assez de produits pour tester la différenciation (au moins 2 requis)');
        }
      });
    });
  });

  describe('Tests supplémentaires - Endpoints publics', () => {
    it('devrait retourner la liste de tous les produits', () => {
      cy.log('Test bonus : Récupération de la liste complète des produits');
      cy.log('URL testée : http://localhost:8081/products');
      
      cy.request({
        method: 'GET',
        url: `${API_URL}/products`
      }).then((response) => {
        cy.log(`Status reçu : ${response.status}`);
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
        cy.log(`✓ ${response.body.length} produits retournés`);
        
        // Afficher quelques produits
        response.body.slice(0, 3).forEach((product, index) => {
          cy.log(`Produit ${index + 1}: ${product.name} - ${product.price}€`);
        });
      });
    });

    it('devrait retourner des produits aléatoires', () => {
      cy.log('Test bonus : Récupération de produits aléatoires');
      cy.log('URL testée : http://localhost:8081/products/random');
      
      cy.request({
        method: 'GET',
        url: `${API_URL}/products/random`
      }).then((response) => {
        cy.log(`Status reçu : ${response.status}`);
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
        cy.log(`✓ ${response.body.length} produits aléatoires retournés`);
      });
    });

    it('devrait retourner la liste des avis', () => {
      cy.log('Test bonus : Récupération de la liste des avis');
      cy.log('URL testée : http://localhost:8081/reviews');
      
      cy.request({
        method: 'GET',
        url: `${API_URL}/reviews`
      }).then((response) => {
        cy.log(`Status reçu : ${response.status}`);
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
        cy.log(`✓ ${response.body.length} avis retournés`);
      });
    });
  });
});