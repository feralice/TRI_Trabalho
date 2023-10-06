const fs = require('fs');
const fastcsv = require('fast-csv');
const elasticClient = require('./elastic-client');

const csvFilePath = 'C:/Users/Fernanda Alice/Documents/UFAM/5-periodo/TRI/TPElasticSearch/base2.csv';  // Caminho para o CSV
const indexName = 'base_dados_tri';  // Nome do índice

const createIndex = async (indexName) => {
  try {
    // Criação do índice
    await elasticClient.indices.create({ index: indexName });
    console.log('Índice criado:', indexName);
  } catch (error) {
    console.error('Erro ao criar índice:', error);
  }
};

const insertDocuments = async () => {
  createIndex(indexName);

  fs.createReadStream(csvFilePath)
    .pipe(fastcsv.parse({ headers: true }))  // Considerando que a primeira linha é o cabeçalho
    .on('data', async (row) => {
      // Mapeando os campos do CSV
      const document = {
        id: row.id,
        body: row.body,
        title: row.title,
        date: row.date,
        court: row.court,
        click_context: row.click_context,
        copy_context: row.copy_context,
        expanded_copy_context: row.expanded_copy_context
      };

      try {
        // Inserção no Elasticsearch
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
};

insertDocuments();
