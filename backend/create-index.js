//cria um indice mandando todos os dados do csv do trabalho 1
const elasticClient = require("./elastic-client");

const createIndex = async (indexName) => {
  await elasticClient.indices.create({ index: indexName });
  console.log("Índice criado");
};

createIndex("base_dados_tri"); // Alterado o nome do índice para "base_dados_tri"
