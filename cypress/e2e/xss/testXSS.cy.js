// cypress/e2e/security/xss-comment.cy.js
// Test de sécurité - Faille XSS dans l'espace commentaire des avis

describe('Test XSS - Espace commentaire des avis', () => {
  const API_URL = 'http://localhost:8081';
  const APP_URL = 'http://localhost:4200';

  let authToken;

  before(() => {
    // Connexion pour obtenir un token
    cy.request({
      method: 'POST',
      url: `${API_URL}/login`,
      body: { username: 'test2@test.fr', password: 'testtest' },
    }).then((res) => {
      expect(res.status).to.eq(200);
      authToken = res.body.token;
      cy.log('✓ Token obtenu');
    });
  });

  beforeEach(() => {
    // Intercepter tout déclenchement d'alert() - preuve d'une XSS réussie
    cy.on('window:alert', (txt) => {
      throw new Error(`🚨 FAILLE XSS CONFIRMÉE : alert() déclenché avec "${txt}"`);
    });
  });

  it('devrait détecter si une faille XSS existe dans le champ commentaire via [innerHTML]', () => {
    const xssPayload = '<img src=x onerror="document.title=\'XSS_FOUND\'">';

    cy.log('Étape 1 : Injection du payload XSS dans le commentaire via l\'API');
    cy.request({
      method: 'POST',
      url: `${API_URL}/reviews`,
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        title: 'Test sécurité XSS',
        comment: xssPayload,
        rating: 1,
      },
      failOnStatusCode: false,
    }).then((res) => {
      cy.log(`Réponse API : ${res.status}`);

      if (res.status !== 200) {
        cy.log(`✓ L'API a rejeté le payload XSS (status ${res.status}) - Pas de faille côté serveur`);
        return;
      }

      cy.log('Étape 2 : Chargement de la page des avis');
      cy.visit(`${APP_URL}/#/reviews`);
      cy.wait(1500);

      cy.log('Étape 3 : Vérification si le script a été exécuté');

      // Si le titre de la page a changé, le onerror s'est déclenché → faille confirmée
      cy.title().then((title) => {
        if (title === 'XSS_FOUND') {
          cy.log('🚨 FAILLE XSS DÉTECTÉE : le payload onerror s\'est exécuté !');
          cy.log('   Cause : [innerHTML]="review.comment" dans reviews.component.html');
          cy.log('   Correction : remplacer [innerHTML] par {{ review.comment }}');
          // Échec explicite du test
          expect(title, '🚨 XSS confirmée via [innerHTML] dans le commentaire').to.not.eq('XSS_FOUND');
        } else {
          cy.log('✓ Le payload n\'a pas été exécuté - Pas de faille XSS détectée');
        }
      });

    });
  });
});