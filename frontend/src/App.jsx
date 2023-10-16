import React, { useState, useEffect } from "react";
import {
  Container,
  List,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  AppBar,
  Toolbar,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import axios from "axios";
import "./style.css";

const api = {
  async search(query) {
    const response = await axios.get(`/api/search?query=${query}`);
    return response.data;
  },
  async getAllPosts() {
    const response = await axios.get("/api/posts");
    return response.data;
  },
  async isAuthenticated() {
    const response = await axios.get("/api/is-authenticated");
    return response.data;
  },
};

const TopMenu = (props) => {
  return (
    <AppBar position="static" sx={{ boxShadow: "none" }}>
      <Toolbar>
        <div style={{ flex: 1 }}></div>
        {props.username ? (
          <>
            <span>{props.username}</span>
            <Button color="inherit" href="/api/logout">
              LOGOUT
            </Button>
          </>
        ) : (
          <Button color="inherit" href="/api/login" className="logout-button">
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

const App = () => {
  const [posts, setPosts] = useState([]);
  const [query, setQuery] = useState("");
  const [username, setUsername] = useState("");
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchTime, setSearchTime] = useState(0);
  const [documentCount, setDocumentCount] = useState(0);
  const [dcgAt10, setDcgAt10] = useState(0); 

  const loadUser = async () => {
    const response = await api.isAuthenticated();

    if (response.authenticated) {
      setUsername(response.username);
      return true;
    }

    return false;
  };

  useEffect(() => {
    loadUser().then((authenticated) => {
      if (authenticated) {
        const searchStartTime = performance.now();
        let index = 0;
  
        api.search(query).then((response) => {
          setPosts(
            response.result.hits.hits.map((hit) => ({
              id: hit._id,
              position: ++index,
              dcg: hit.dcgs,
              ...hit._source,
            }))
          );
          const searchEndTime = performance.now();
          const searchTimeMilliseconds = searchEndTime - searchStartTime;
          const searchTimeSeconds = (searchTimeMilliseconds / 1000).toFixed(2);
  
          setSearchTime(searchTimeSeconds);
          setDocumentCount(response.result.hits.total.value);
          setDcgAt10(response.dcgAt10); 
        });
      }
    });
  }, [query]);  

  const handleSearch = (event) => {
    event.preventDefault();

    const filtered = posts
      .filter((post) =>
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.body.toLowerCase().includes(query.toLowerCase())
      )
      .map((post, index) => ({ ...post, position: index + 1 }));

    setFilteredPosts(filtered);
  };

  return (
    <div>
      <TopMenu username={username} />
      <div id="cover">
        <form id="searchForm" onSubmit={handleSearch}>
          <div className="tb">
            <div className="td">
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
              <Container maxWidth="md">
                <div id="textos">
                <Typography variant="body2" sx={{ marginTop: "16px" }}>
                  Tempo de Pesquisa: {searchTime} segundos
                </Typography>
                <Typography variant="body2" sx={{ marginTop: "16px" }}>
                  Quantidade de Documentos Retornados: {documentCount}
                </Typography>
                <Typography variant="body2" sx={{ marginTop: "16px" }}>
                  DCG @10: {dcgAt10}
                </Typography>
                </div>
                <List>
                  {filteredPosts.map((post) => (
                    <Accordion key={post.id} sx={{ backgroundColor: "#fce9e9" }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">
                          Posição: {post.position}
                          <br />
                          ID: {post.id}
                          <br />
                          {post.title}
                          <br />
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography>{post.body}</Typography>
                      </AccordionDetails>
                    </Accordion>
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
