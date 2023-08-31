//insere nossa base de dados no elasticsearch

const fs = require('fs');
const fastcsv = require('fast-csv');
const elasticClient = require('../client-connection/elastic-client');

const csvFilePath = 'C:/Users/Fernanda Alice/Documents/UFAM/5-periodo/TRI/TPElasticSearch/base-de-dados.csv';
const indexName = 'base_dados_tri'; 

//Código para mandar nossa base de dados em csv para o elasticsearch
//para isso, tranformamos primeiro em json
fs.createReadStream(csvFilePath)
  .pipe(fastcsv.parse({ headers: true }))
  .on('data', async row => {
    const document = {
      title: row.title,
      body: row.body,
    };

    try {
      const result = await elasticClient.index({
        index: indexName,
        body: document,
      });
      console.log('Documento inserido no Elasticsearch:', result);
    } catch (error) {
      console.error('Erro ao inserir documento no Elasticsearch:', error);
    }
  })
  .on('end', () => {
    console.log('Importação concluída!');
  });
