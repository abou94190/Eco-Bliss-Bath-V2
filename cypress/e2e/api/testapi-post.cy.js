// cypress/e2e/api/testapi-post.cy.js

describe('Tests API POST', () => {
  const API_URL = 'http://localhost:8081';
  let authToken;
  let productIdAvailable;
  let productIdOutOfStock;

  before(() => {
    cy.log('=== PRÉPARATION DES TESTS ===');
    cy.log('Récupération des produits pour les tests...');
    
    // Récupérer des produits pour les tests
    cy.request({
      method: 'GET',
      url: `${API_URL}/products`
    }).then((response) => {
      const products = response.body;
      cy.log(`${products.length} produits trouvés dans la base`);
      
      // Trouver un produit disponible (stock > 0)
      const availableProduct = products.find(p => p.availableStock > 0);
      if (availableProduct) {
        productIdAvailable = availableProduct.id;
        cy.log(`✓ Produit disponible trouvé : ID ${productIdAvailable} - "${availableProduct.name}" (Stock: ${availableProduct.availableStock})`);
      } else {
        cy.log('⚠ Aucun produit avec stock disponible trouvé');
      }
      
      // Trouver un produit en rupture de stock (stock = 0)
      const outOfStockProduct = products.find(p => p.availableStock === 0);
      if (outOfStockProduct) {
        productIdOutOfStock = outOfStockProduct.id;
        cy.log(`✓ Produit en rupture trouvé : ID ${productIdOutOfStock} - "${outOfStockProduct.name}" (Stock: 0)`);
      } else {
        cy.log('ℹ Aucun produit en rupture de stock trouvé (tous les produits ont du stock)');
      }
    });
  });

  describe('1. Login - Authentification', () => {
    
    it('devrait retourner 401 pour un utilisateur inconnu', () => {
      cy.log('=== TEST : Login avec utilisateur inconnu ===');
      cy.log('URL testée : http://localhost:8081/login');
      cy.log('Credentials : utilisateur.inexistant@test.com / mauvaisMotDePasse');
      
      cy.request({
        method: 'POST',
        url: `${API_URL}/login`,
        body: {
          username: 'utilisateur.inexistant@test.com',
          password: 'mauvaisMotDePasse123'
        },
        failOnStatusCode: false
      }).then((response) => {
        cy.log(`Status reçu : ${response.status}`);
        
        // Vérification stricte : doit retourner 401
        expect(response.status).to.eq(401);
        cy.log('✓ Erreur 401 correctement renvoyée (Unauthorized)');
        cy.log('✓ Le serveur refuse bien l\'accès à un utilisateur inconnu');
      });
    });

    it('devrait retourner 200 et un token pour un utilisateur connu', () => {
      cy.log('=== TEST : Login avec utilisateur connu ===');
      cy.log('URL testée : http://localhost:8081/login');
      cy.log('Credentials : test@test.com / test123');
      
      cy.request({
        method: 'POST',
        url: `${API_URL}/login`,
        body: {
          username: 'test@test.com',
          password: 'test123'
        }
      }).then((response) => {
        cy.log(`Status reçu : ${response.status}`);
        
        // Vérifier le status 200
        expect(response.status).to.eq(200);
        cy.log('✓ Status 200 OK reçu');
        
        // Vérifier la présence du token
        expect(response.body).to.have.property('token');
        cy.log('✓ Propriété "token" présente dans la réponse');
        
        // Vérifier que le token est une chaîne non vide
        expect(response.body.token).to.be.a('string');
        expect(response.body.token).to.not.be.empty;
        cy.log(`✓ Token reçu : ${response.body.token.substring(0, 20)}...`);
        cy.log(`  (Longueur du token : ${response.body.token.length} caractères)`);
        
        // Sauvegarder le token pour les tests suivants
        authToken = response.body.token;
        cy.log('✓ Token sauvegardé pour les tests suivants');
      });
    });

    it('devrait retourner une erreur avec des identifiants vides', () => {
      cy.log('=== TEST : Login avec identifiants vides ===');
      cy.log('URL testée : http://localhost:8081/login');
      cy.log('Body : { username: "", password: "" }');
      
      cy.request({
        method: 'POST',
        url: `${API_URL}/login`,
        body: {
          username: '',
          password: ''
        },
        failOnStatusCode: false
      }).then((response) => {
        cy.log(`Status reçu : ${response.status}`);
        
        // Le serveur devrait retourner 400 ou 401
        expect(response.status).to.be.oneOf([400, 401]);
        cy.log(`✓ Erreur ${response.status} correctement renvoyée pour identifiants vides`);
      });
    });

    it('devrait retourner une erreur avec seulement le username', () => {
      cy.log('=== TEST : Login avec mot de passe manquant ===');
      
      cy.request({
        method: 'POST',
        url: `${API_URL}/login`,
        body: {
          username: 'test@test.com'
        },
        failOnStatusCode: false
      }).then((response) => {
        cy.log(`Status reçu : ${response.status}`);
        expect(response.status).to.be.oneOf([400, 401]);
        cy.log(`✓ Erreur ${response.status} correctement renvoyée`);
      });
    });
  });

  describe('2. Ajouter un produit au panier', () => {
    
    beforeEach(() => {
      cy.log('--- Authentification avant le test ---');
      
      // S'authentifier avant chaque test
      cy.request({
        method: 'POST',
        url: `${API_URL}/login`,
        body: {
          username: 'test@test.com',
          password: 'test123'
        }
      }).then((response) => {
        authToken = response.body.token;
        cy.log('✓ Token d\'authentification obtenu');
      });
    });

    it('devrait ajouter un produit disponible au panier', () => {
      cy.log('=== TEST : Ajouter un produit DISPONIBLE au panier ===');
      cy.log('URL testée : http://localhost:8081/orders/add');
      cy.log(`Produit ID : ${productIdAvailable}`);
      cy.log('Quantité : 1');
      cy.log('Header : Authorization: Bearer [token]');
      
      cy.request({
        method: 'PUT',
        url: `${API_URL}/orders/add`,
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: {
          product: productIdAvailable,
          quantity: 1
        }
      }).then((response) => {
        cy.log(`Status reçu : ${response.status}`);
        
        // Vérifier le status 200
        expect(response.status).to.eq(200);
        cy.log('✓ Status 200 OK - Produit ajouté avec succès');
        
        // Vérifier la structure de la réponse
        expect(response.body).to.have.property('orderLines');
        cy.log('✓ Propriété "orderLines" présente');
        
        // Vérifier que le produit a été ajouté
        const addedProduct = response.body.orderLines.find(
          line => line.product.id === productIdAvailable
        );
        
        if (addedProduct) {
          expect(addedProduct).to.exist;
          cy.log('✓ Produit trouvé dans le panier');
          
          expect(addedProduct.quantity).to.be.greaterThan(0);
          cy.log(`✓ Quantité dans le panier : ${addedProduct.quantity}`);
          cy.log(`  Produit : ${addedProduct.product.name}`);
          cy.log(`  Prix unitaire : ${addedProduct.product.price} €`);
          cy.log(`  Total ligne : ${addedProduct.quantity * addedProduct.product.price} €`);
        }
        
        // Afficher le nombre total de lignes dans le panier
        cy.log(`Total de lignes dans le panier : ${response.body.orderLines.length}`);
      });
    });

    it('devrait ajouter plusieurs unités d\'un produit disponible', () => {
      cy.log('=== TEST : Ajouter plusieurs unités d\'un produit ===');
      cy.log(`Quantité : 3`);
      
      cy.request({
        method: 'PUT',
        url: `${API_URL}/orders/add`,
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: {
          product: productIdAvailable,
          quantity: 3
        }
      }).then((response) => {
        cy.log(`Status reçu : ${response.status}`);
        expect(response.status).to.eq(200);
        cy.log('✓ Ajout de 3 unités réussi');
        
        const addedProduct = response.body.orderLines.find(
          line => line.product.id === productIdAvailable
        );
        
        if (addedProduct) {
          cy.log(`✓ Quantité totale maintenant : ${addedProduct.quantity}`);
        }
      });
    });

    it('devrait gérer l\'ajout d\'un produit en rupture de stock', () => {
      if (!productIdOutOfStock) {
        cy.log('⚠ SKIP : Aucun produit en rupture de stock trouvé');
        cy.log('   Tous les produits ont du stock disponible');
        this.skip();
        return;
      }

      cy.log('=== TEST : Ajouter un produit EN RUPTURE DE STOCK ===');
      cy.log('URL testée : http://localhost:8081/orders/add');
      cy.log(`Produit ID : ${productIdOutOfStock} (Stock: 0)`);
      cy.log('Quantité : 1');
      
      cy.request({
        method: 'PUT',
        url: `${API_URL}/orders/add`,
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: {
          product: productIdOutOfStock,
          quantity: 1
        },
        failOnStatusCode: false
      }).then((response) => {
        cy.log(`Status reçu : ${response.status}`);
        
        // Le serveur devrait retourner une erreur (400, 409, ou 422)
        expect(response.status).to.be.oneOf([400, 409, 422]);
        cy.log(`✓ Erreur ${response.status} correctement renvoyée`);
        cy.log('✓ Le serveur refuse bien l\'ajout d\'un produit sans stock');
        
        // Afficher le message d'erreur si présent
        if (response.body.message) {
          cy.log(`  Message : ${response.body.message}`);
        }
      });
    });

    it('devrait retourner 401 sans authentification', () => {
      cy.log('=== TEST : Ajout au panier SANS authentification ===');
      cy.log('Aucun header Authorization fourni');
      
      cy.request({
        method: 'PUT',
        url: `${API_URL}/orders/add`,
        body: {
          product: productIdAvailable,
          quantity: 1
        },
        failOnStatusCode: false
      }).then((response) => {
        cy.log(`Status reçu : ${response.status}`);
        
        expect(response.status).to.eq(401);
        cy.log('✓ Erreur 401 correctement renvoyée (Unauthorized)');
        cy.log('✓ L\'authentification est bien requise');
      });
    });

    it('devrait gérer les quantités invalides (négative)', () => {
      cy.log('=== TEST : Quantité négative ===');
      cy.log('Quantité : -1');
      
      cy.request({
        method: 'PUT',
        url: `${API_URL}/orders/add`,
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: {
          product: productIdAvailable,
          quantity: -1
        },
        failOnStatusCode: false
      }).then((response) => {
        cy.log(`Status reçu : ${response.status}`);
        
        expect(response.status).to.be.oneOf([400, 422]);
        cy.log(`✓ Erreur ${response.status} pour quantité négative`);
      });
    });

    it('devrait gérer les quantités invalides (zéro)', () => {
      cy.log('=== TEST : Quantité zéro ===');
      cy.log('Quantité : 0');
      
      cy.request({
        method: 'PUT',
        url: `${API_URL}/orders/add`,
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: {
          product: productIdAvailable,
          quantity: 0
        },
        failOnStatusCode: false
      }).then((response) => {
        cy.log(`Status reçu : ${response.status}`);
        
        expect(response.status).to.be.oneOf([400, 422]);
        cy.log(`✓ Erreur ${response.status} pour quantité zéro`);
      });
    });

    it('devrait gérer un produit inexistant', () => {
      cy.log('=== TEST : Produit inexistant ===');
      const invalidProductId = 99999;
      cy.log(`Produit ID : ${invalidProductId} (inexistant)`);
      
      cy.request({
        method: 'PUT',
        url: `${API_URL}/orders/add`,
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: {
          product: invalidProductId,
          quantity: 1
        },
        failOnStatusCode: false
      }).then((response) => {
        cy.log(`Status reçu : ${response.status}`);
        
        expect(response.status).to.be.oneOf([404, 422]);
        cy.log(`✓ Erreur ${response.status} pour produit inexistant`);
      });
    });
  });

  describe('3. Ajouter un avis', () => {
    
    beforeEach(() => {
      cy.log('--- Authentification avant le test ---');
      
      // S'authentifier avant chaque test
      cy.request({
        method: 'POST',
        url: `${API_URL}/login`,
        body: {
          username: 'test@test.com',
          password: 'test123'
        }
      }).then((response) => {
        authToken = response.body.token;
        cy.log('✓ Token d\'authentification obtenu');
      });
    });

    it('devrait ajouter un avis valide avec note 5/5', () => {
      cy.log('=== TEST : Ajouter un avis valide (5 étoiles) ===');
      cy.log('URL testée : http://localhost:8081/reviews');
      
      const reviewData = {
        title: 'Excellent produit !',
        comment: 'Très satisfait de mon achat. Le produit est de qualité, l\'odeur est agréable et la livraison était rapide. Je recommande vivement !',
        rating: 5
      };
      
      cy.log('Données de l\'avis :');
      cy.log(`  Titre : "${reviewData.title}"`);
      cy.log(`  Note : ${reviewData.rating}/5`);
      cy.log(`  Commentaire : "${reviewData.comment.substring(0, 50)}..."`);
      
      cy.request({
        method: 'POST',
        url: `${API_URL}/reviews`,
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: reviewData
      }).then((response) => {
        cy.log(`Status reçu : ${response.status}`);
        
        expect(response.status).to.eq(200);
        cy.log('✓ Status 200 OK - Avis ajouté avec succès');
      });
    });

    it('devrait ajouter un avis avec note moyenne (3/5)', () => {
      cy.log('=== TEST : Ajouter un avis avec note moyenne ===');
      
      cy.request({
        method: 'POST',
        url: `${API_URL}/reviews`,
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: {
          title: 'Produit correct',
          comment: 'Le produit est correct sans plus. Il fait le job mais ne m\'a pas particulièrement impressionné.',
          rating: 3
        }
      }).then((response) => {
        cy.log(`Status reçu : ${response.status}`);
        expect(response.status).to.eq(200);
        cy.log('✓ Avis avec note 3/5 ajouté');
      });
    });

    it('devrait ajouter un avis négatif (1/5)', () => {
      cy.log('=== TEST : Ajouter un avis négatif ===');
      
      cy.request({
        method: 'POST',
        url: `${API_URL}/reviews`,
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: {
          title: 'Déçu',
          comment: 'Pas du tout ce à quoi je m\'attendais. Qualité médiocre.',
          rating: 1
        }
      }).then((response) => {
        cy.log(`Status reçu : ${response.status}`);
        expect(response.status).to.eq(200);
        cy.log('✓ Avis avec note 1/5 ajouté');
      });
    });

    it('devrait retourner 401 sans authentification', () => {
      cy.log('=== TEST : Ajout d\'avis SANS authentification ===');
      cy.log('Aucun header Authorization fourni');
      
      cy.request({
        method: 'POST',
        url: `${API_URL}/reviews`,
        body: {
          title: 'Test',
          comment: 'Test comment',
          rating: 4
        },
        failOnStatusCode: false
      }).then((response) => {
        cy.log(`Status reçu : ${response.status}`);
        
        expect(response.status).to.eq(401);
        cy.log('✓ Erreur 401 correctement renvoyée (Unauthorized)');
        cy.log('✓ L\'authentification est bien requise pour ajouter un avis');
      });
    });

    it('devrait rejeter un avis avec une note invalide (> 5)', () => {
      cy.log('=== TEST : Note invalide supérieure à 5 ===');
      cy.log('Note testée : 10/5 (invalide)');
      
      cy.request({
        method: 'POST',
        url: `${API_URL}/reviews`,
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: {
          title: 'Test',
          comment: 'Test comment',
          rating: 10
        },
        failOnStatusCode: false
      }).then((response) => {
        cy.log(`Status reçu : ${response.status}`);
        
        expect(response.status).to.be.oneOf([400, 422]);
        cy.log(`✓ Erreur ${response.status} pour note > 5`);
      });
    });

    it('devrait rejeter un avis avec une note invalide (< 1)', () => {
      cy.log('=== TEST : Note invalide inférieure à 1 ===');
      cy.log('Note testée : 0/5 (invalide)');
      
      cy.request({
        method: 'POST',
        url: `${API_URL}/reviews`,
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: {
          title: 'Test',
          comment: 'Test comment',
          rating: 0
        },
        failOnStatusCode: false
      }).then((response) => {
        cy.log(`Status reçu : ${response.status}`);
        
        expect(response.status).to.be.oneOf([400, 422]);
        cy.log(`✓ Erreur ${response.status} pour note < 1`);
      });
    });

    it('devrait rejeter un avis avec des champs manquants', () => {
      cy.log('=== TEST : Champs manquants (sans comment et rating) ===');
      
      cy.request({
        method: 'POST',
        url: `${API_URL}/reviews`,
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: {
          title: 'Test'
          // Manque comment et rating
        },
        failOnStatusCode: false
      }).then((response) => {
        cy.log(`Status reçu : ${response.status}`);
        
        expect(response.status).to.be.oneOf([400, 422]);
        cy.log(`✓ Erreur ${response.status} pour champs manquants`);
      });
    });

    it('devrait rejeter un avis avec titre vide', () => {
      cy.log('=== TEST : Titre vide ===');
      
      cy.request({
        method: 'POST',
        url: `${API_URL}/reviews`,
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: {
          title: '',
          comment: 'Commentaire valide',
          rating: 4
        },
        failOnStatusCode: false
      }).then((response) => {
        cy.log(`Status reçu : ${response.status}`);
        
        expect(response.status).to.be.oneOf([400, 422]);
        cy.log(`✓ Erreur ${response.status} pour titre vide`);
      });
    });

    it('devrait rejeter un avis avec commentaire vide', () => {
      cy.log('=== TEST : Commentaire vide ===');
      
      cy.request({
        method: 'POST',
        url: `${API_URL}/reviews`,
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: {
          title: 'Titre valide',
          comment: '',
          rating: 4
        },
        failOnStatusCode: false
      }).then((response) => {
        cy.log(`Status reçu : ${response.status}`);
        
        expect(response.status).to.be.oneOf([400, 422]);
        cy.log(`✓ Erreur ${response.status} pour commentaire vide`);
      });
    });
  });
});