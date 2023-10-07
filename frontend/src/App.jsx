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
        api.search(query).then((response) => {
          setPosts(
            response.hits.hits.map((hit) => ({
              id: hit._id,
              ...hit._source,
            }))
          );
        });
      }
    });
  }, [query]);

  const handleSearch = (event) => {
    event.preventDefault();

    const filtered = posts.filter((post) =>
      post.title.toLowerCase().includes(query.toLowerCase()) ||
      post.body.toLowerCase().includes(query.toLowerCase())
    );
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
                <List>
                  {filteredPosts.map((post) => (
                    <Accordion key={post.id} sx={{ backgroundColor: '#fce9e9' }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">
                        ID: {post.id} {post.title} 
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
