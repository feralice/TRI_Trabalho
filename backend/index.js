const { performance } = require('perf_hooks');
const express = require('express');
const bodyParser = require('body-parser');
const elasticClient = require('./elastic-client');
require('express-async-errors');

const app = express();
app.use(bodyParser.json());

function calculateRelevance(score, maxScore) {
  const normalizedScore = score / maxScore;

  const randomFactor = Math.random() * 0.4 - 0.2;
  const adjustedScore = normalizedScore + randomFactor;

  if (adjustedScore >= 0.9) return 3;
  else if (adjustedScore >= 0.7) return 2;
  else if (adjustedScore >= 0.5) return 1;
  else return 0;
}

// Rotas
app.get('/', (req, res) => {
  res.redirect('http://localhost:5173/');
});

app.get('/search', async (req, res) => {
  const query = req.query.query;

  const startTime = performance.now();

  const result = await elasticClient.search({
    index: 'base_dados_tri3',
    body: {
      size: 10,
      query: {
        multi_match: {
          query,
          fields: ['title', 'body^2'],
        },
      },
    },
  });

  const maxScore = Math.max(...result.hits.hits.map(hit => hit._score));
  const relevances = result.hits.hits.map((hit) => calculateRelevance(hit._score, maxScore));
  const dcgs = [];
  let dcgAt10=0;

  console.log('Scores:', result.hits.hits.map(hit => hit._score));
  console.log('Max Score:', maxScore);
  console.log('Relevâncias calculadas:', relevances);


  for (let i = 1; i <= 10; i++) {
    const dcg = relevances[i-1] / Math.log2(i + 1);
    dcgAt10+=dcg;
    dcgs.push(dcg);
  }

  const endTime = performance.now();
  const searchTimeSeconds = ((endTime - startTime) / 1000).toFixed(2);

  console.log('Tempo total de pesquisa (segundos):', searchTimeSeconds);
  console.log('Elasticsearch resultado:', result);
  console.log('Relevâncias calculadas:', relevances);
  console.log('DCGs calculados:', dcgs);
  console.log('DCG@10:', dcgAt10);

  const responseObj = {
    searchTimeSeconds,
    result,
    relevances,
    dcgs,
    dcgAt10,
  };
  
  res.json(responseObj);
  
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});