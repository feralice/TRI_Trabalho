import React, { useState, useEffect } from "react";
import { Container,  List, ListItem, ListItemText, } from "@mui/material";
import axios from "axios";
import { AppBar, Toolbar, Box, Button } from "@mui/material";
import "./style.css";

const api = {
  async search(query) {
    const response = await axios.get(`/api/search?query=${query}`);
    return response.data;s
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

const columns = [
  {
    field: "title",
    headerName: "title",
    flex: 1,
    minWidth: 200,
    cellClassName: "data-grid-cell",
  },
  {
    field: "body",
    headerName: "body",
    flex: 1,
    minWidth: 200,
    cellClassName: "data-grid-cell", 
  },
];

const TopMenu = (props) => {
  return (
    <Box sx={{ flexGrow: 1, mb: 1 }}>
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
    </Box>
  );
};

const App = () => {
  const [posts, setPosts] = useState([]);
  const [selection, setSelection] = useState([]);
  const [query, setQuery] = useState("");
  const [username, setUsername] = useState("");
  const [filteredPosts, setFilteredPosts] = useState([]);

  const loadUser = async () => {
    const response = await api.isAuthenticated();

    console.log(response);
    if (response.authenticated) {
      setUsername(response.username);
      return true;
    }

    return false;
  };

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

  const handleSearch = (event) => {
    event.preventDefault();
    const filtered = posts.filter((post) =>
      post.title.toLowerCase().includes(query.toLowerCase())
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
          // ...
<div id="searchResults">
  <Container maxWidth="md">
    <List>
      {filteredPosts.map((post) => (
        <ListItem key={post.id} sx={{ border: "1px solid #ddd", borderRadius: "4px", marginBottom: "8px" }}>
          <ListItemText primary={post.title} secondary={post.body} />
        </ListItem>
      ))}
    </List>
  </Container>
</div>
// ...

          </div>
        </Container>
      </div>
    </div>
  );
};

export default App;
