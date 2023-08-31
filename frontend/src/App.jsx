import React, { useState, useEffect } from "react";
import { Container, List, ListItem, ListItemText } from "@mui/material";
import axios from "axios";
import { AppBar, Toolbar, Box, Button } from "@mui/material";
import "./style.css";

// Funções de API para interação com o servidor
const api = {
  async search(query) {
    const response = await axios.get(`/api/search?query=${query}`);
    return response.data; // Retorna os dados da pesquisa
  },
  async getAllPosts() {
    const response = await axios.get("/api/posts");
    return response.data; // Retorna todos os posts
  },
  async isAuthenticated() {
    const response = await axios.get("/api/is-authenticated");
    return response.data; // Retorna informações de autenticação
  },
};

// Componente do menu superior
const TopMenu = (props) => {
  return (
    <AppBar position="static" sx={{ boxShadow: "none" }}>
      <Toolbar>
        <div style={{ flex: 1 }}></div>
        {props.username ? (
          // Se o usuário estiver autenticado, mostra o nome e botão de logout
          <>
            <span>{props.username}</span>
            <Button color="inherit" href="/api/logout">
              LOGOUT
            </Button>
          </>
        ) : (
          // Caso contrário, mostra botão de login
          <Button color="inherit" href="/api/login" className="logout-button">
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

// Componente principal
const App = () => {
  const [posts, setPosts] = useState([]);
  const [query, setQuery] = useState("");
  const [username, setUsername] = useState("");
  const [filteredPosts, setFilteredPosts] = useState([]);

  // Função para verificar autenticação do usuário
  const loadUser = async () => {
    const response = await api.isAuthenticated();

    console.log(response);
    if (response.authenticated) {
      setUsername(response.username);
      return true;
    }

    return false;
  };

  // Efeito para carregar os posts quando o componente é montado
  useEffect(() => {
    loadUser().then((authenticated) => {
      if (authenticated) {
        api.getAllPosts().then((response) => {
          setPosts(
            response.hits.hits.map((hit) => ({
              id: hit._id,
              ...hit._source,
            }))
          );
        });
      }
    });
  }, []);

  // Função para lidar com a pesquisa
  const handleSearch = (event) => {
    event.preventDefault();
    console.log("Query before filtering:", query);

    const filtered = posts.filter((post) =>
      post.title.toLowerCase().includes(query.toLowerCase()) ||
      post.body.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredPosts(filtered);
  };

  return (
    <div>
      {/* Renderiza o menu superior com base na autenticação */}
      <TopMenu username={username} />
      <div id="cover">
        <form id="searchForm" onSubmit={handleSearch}>
          <div className="tb">
            <div className="td">
              {/* Campo de pesquisa */}
              <input
                type="text"
                id="searchInput"
                placeholder="Pesquise..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                required
              />
            </div>
            <div className="td" id="s-cover">
              {/* Botão de pesquisa */}
              <button type="submit">
                <div id="s-circle"></div>
                <span></span>
              </button>
            </div>
          </div>
        </form>
      </div>
      <div id="searchResults">
        <Container maxWidth="md">
          <div style={{ width: "100%" }}>
            <div id="searchResults">
              {/* Renderiza a lista de resultados da pesquisa */}
              <Container maxWidth="md">
                <List>
                  {filteredPosts.map((post) => (
                    <ListItem
                      key={post.id}
                      sx={{
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        marginBottom: "8px",
                      }}
                    >
                      <ListItemText primary={post.title} secondary={post.body} />
                    </ListItem>
                  ))}
                </List>
              </Container>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default App;
