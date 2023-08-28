const express = require("express");
const bodyParser = require("body-parser");
const elasticClient = require("./elastic-client");
const { auth, requiresAuth } = require("express-openid-connect");
require("dotenv").config({ path: ".okta.env" });
require("express-async-errors");

const app = express();

app.use(bodyParser.json());
app.use(
  auth({
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

app.get("/", (req, res) => {
  res.redirect("http://localhost:5173/");
});

const securedRouter = express.Router();
securedRouter.use(requiresAuth());

// Rota de pesquisa
//ta retornando apenas os documentos que possuem palavra igual do input no title 
app.get("/search", async (req, res) => {
  const result = await elasticClient.search({
    index: "base_dados_tri",
    body: {
      query: {
        multi_match: {
          query: req.query.query,
          fields: ["title", "body"]
        }
      }
    }
  });
  res.json(result);
});



  securedRouter.get("/posts", async (req, res) => {
    const result = await elasticClient.search({
      index: "base_dados_tri",
      query: { match_all: {} },
    });
  
    res.send(result);
  });
  
  
  
app.use(securedRouter);
app.listen(8080);
