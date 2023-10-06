//cria um novo indice
const elasticClient = require("./elastic-client");

const createIndex = async (indexName) => {
  await elasticClient.indices.create({ index: indexName });
  console.log("Índice criado");
};

//indice criado para colocar nossa base de dados
createIndex("base_dados_tri"); 
