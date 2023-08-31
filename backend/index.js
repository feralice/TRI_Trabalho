const express = require("express");
const bodyParser = require("body-parser");
const elasticClient = require("./elastic-client");
const { auth, requiresAuth } = require("express-openid-connect");
require("dotenv").config({ path: ".okta.env" });
require("express-async-errors");

// Criação da aplicação Express
const app = express();

// Configuração de middlewares
app.use(bodyParser.json());
app.use(
  auth({
    // Configurações do OpenID Connect
    issuerBaseURL: process.env.OKTA_OAUTH2_ISSUER,
    clientID: process.env.OKTA_OAUTH2_CLIENT_ID,
    clientSecret: process.env.OKTA_OAUTH2_CLIENT_SECRET,
    secret: process.env.OKTA_OAUTH2_CLIENT_SECRET,
    baseURL: "http://localhost:8080",
    idpLogout: true,
    authRequired: false,
    authorizationParams: {
      scope: "openid profile",
      response_type: "code",
    },
  })
);

// Rota para verificar autenticação
app.get("/is-authenticated", (req, res) => {
  const authenticated = req.oidc.isAuthenticated();
  if (authenticated) {
    res.json({
      authenticated,
      username: req.oidc.user.name,
    });
  } else {
    res.json({ authenticated: false });
  }
});

// Redirecionamento para a página principal (onde fica o front)
app.get("/", (req, res) => {
  res.redirect("http://localhost:5173/");
});

//constantes apenas para segurança
const securedRouter = express.Router();
securedRouter.use(requiresAuth());

// Rota da pesquisa
securedRouter.get("/search", async (req, res) => {
  const query = req.query.query;

  //realiza a pesquisa
  const result = await elasticClient.search({
    // Realiza uma pesquisa no índice "base_dados_tri"
    index: "base_dados_tri",
    // Define o número máximo de resultados retornados para 20
    body: {
      size: 20,
      // Define o tipo de consulta
      query: {
        // Executa uma pesquisa em vários campos
        multi_match: {
          // Termo de pesquisa a ser procurado
          query,
          // Campos onde a pesquisa será executada
          fields: ["title", "body"],
          // Permite correspondências aproximadas
          fuzziness: "AUTO", 
        }, 
      },
    },
  });
  
  console.log("Elasticsearch resultado:", result);
  res.json(result);
});

//rota para buscar todos os posts
securedRouter.get("/posts", async (req, res) => {
  const result = await elasticClient.search({
    index: "base_dados_tri",
    body: {
      size: 20,
      query: { match_all: {} },
    },
  });
  res.send(result);
});

app.use(securedRouter);
app.listen(8080);
