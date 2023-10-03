import './App.css';
import { useState, useEffect } from 'react';
import ArticleList from './components/ArticleList';
import Form from './components/Form';
import { useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Navbar from 'react-bootstrap/Navbar';
import Dropdown from 'react-bootstrap/Dropdown';
import { Form as BootstrapForm, FormControl } from 'react-bootstrap';
import APIService from './components/APIService';
function App() {
  const [articles, setArticles] = useState([]);
  const [editedArticle, setEditedArticles] = useState(null);
  const navigate = useNavigate();
  const token = sessionStorage.getItem('token');
  const user = sessionStorage.getItem('user');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedArticles, setSearchedArticles] = useState([]);
  const [courseSearchQuery, setCourseSearchQuery] = useState('');
  const [searchedCourseArticles, setSearchedCourseArticles] = useState([]);
  const [searchType, setSearchType] = useState('general'); // Default to general search


  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      // If no token, redirect to login page
      navigate('/signup');
    } else {
      fetch('http://127.0.0.1:5000/get', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((resp) => resp.json())
        .then((resp) => setArticles(resp))
        .catch((error) => console.log(error));
    }
  }, []);

  const refreshArticles = () => {
    fetch('http://127.0.0.1:5000/get', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((resp) => resp.json())
      .then((resp) => setArticles(resp))
      .catch((error) => console.log(error));
  };

  const editArticle = (article) => {
    setEditedArticles(article);
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    console.log('Loging out');
    navigate('/login');
  };

  const updatedData = (article) => {
    const new_article = articles.map((my_article) => {
      if (my_article.id === article.id) {
        return article;
      } else {
        return my_article;
      }
    });
    setArticles(new_article);
  };

  const openForm = () => {
    setEditedArticles({ title: '', body: '', video_URL: '',course:'' });
  };

  const insertedArticle = (article) => {
    const new_articles = [...articles, article];
    setArticles(new_articles);
  };

  const deleteArticle = (article) => {
    // Call the DeleteArticle API function
    APIService.DeleteArticle(article.id)
      .then(() => {
        // After successful deletion on the backend, update the frontend state
        const new_articles = articles.filter((myarticle) => myarticle.id !== article.id);
        setArticles(new_articles);
      })
      .catch((error) => {
        console.log(error);
        // Handle error, such as showing an error message to the user
      });
  };

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };
  const handleCourseSearchInputChange = (event) => {
    setCourseSearchQuery(event.target.value);
  };
  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (searchQuery.trim() !== '') {
      fetch(`http://127.0.0.1:5000/search/${encodeURIComponent(searchQuery)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((resp) => resp.json())
        .then((resp) => setSearchedArticles(resp))
        .catch((error) => console.log(error));
    } else {
      refreshArticles();
      setSearchedArticles([]);
    }
  };
  const handleCourseSearchSubmit = (event) => {
    event.preventDefault();
    if (courseSearchQuery.trim() !== '') {
      fetch(`http://127.0.0.1:5000/search_course/${encodeURIComponent(courseSearchQuery)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((resp) => resp.json())
        .then((resp) => setSearchedCourseArticles(resp))
        .catch((error) => console.log(error));
    } else {
      setSearchedCourseArticles([]);
    }
  };
  return (
    <div className="App">
      <Navbar className="bg-body-tertiary">
        <Container>
          <Navbar.Brand href="#home">Easy</Navbar.Brand>
          <Navbar.Toggle />
            <Navbar.Collapse className="justify-content-end">
            <div className="d-flex align-items-center me-4"> {/* Added container div */}
              <BootstrapForm className="d-flex" onSubmit={handleSearchSubmit}>
                <FormControl
                  type="search"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  className="me-2"
                />
                <Button type="submit" variant="outline-success">
                  Search
                </Button>
              </BootstrapForm>
            </div>

            <Dropdown as={ButtonGroup}>
              <Button variant="success">Signed in as: {user}</Button>
              <Dropdown.Toggle split variant="success" id="dropdown-split-basic" />
              <Dropdown.Menu>
                <Dropdown.Item href="/info">Settings</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={logout}>Logout</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Navbar.Collapse>
          
        </Container>
      </Navbar>
      <div className="row">
      <div className="col">
        <button className="btn btn-success round-button" onClick={openForm}>
          Insert Article
        </button>
      </div>
      </div>
      <div className="row mt-4">
        <div className="col">
        {searchedArticles.length > 0 || searchedCourseArticles.length > 0 ? (
          <h2>Search Results</h2>
        ) : (
          <h2>Recent Threads</h2>
        )}
          <ArticleList
            articles={searchedCourseArticles.length > 0 ? searchedCourseArticles : (searchedArticles.length > 0 ? searchedArticles : articles)}
            editArticle={editArticle}
            deleteArticle={deleteArticle}
            refreshArticles={refreshArticles}
          />
        </div>
      </div>
      {editedArticle ? <Form article={editedArticle} updatedData={updatedData} insertedArticle={insertedArticle} /> : null}
      <div className="row mt-4">
        <div className="col">
          <Navbar className="bg-body-tertiary">
        <Dropdown as={ButtonGroup} className="mx-2">
  <Button variant="primary">Search Type</Button>
  <Dropdown.Toggle split variant="primary" id="search-type-dropdown" />
  <Dropdown.Menu>
    <Dropdown.Item onClick={() => setSearchType('general')}>General Search</Dropdown.Item>
    <Dropdown.Item onClick={() => setSearchType('course')}>Search by Course</Dropdown.Item>
  </Dropdown.Menu>
</Dropdown>

{searchType === 'course' ? (
  <BootstrapForm className="d-flex mt-2" onSubmit={handleCourseSearchSubmit}>
    <FormControl
      type="search"
      placeholder="Search articles by course..."
      value={courseSearchQuery}
      onChange={handleCourseSearchInputChange}
      className="me-2"
    />
    <Button type="submit" variant="outline-success">
      Search
    </Button>
  </BootstrapForm>
) : (
  <BootstrapForm className="d-flex mt-2" onSubmit={handleSearchSubmit}>
    <FormControl
      type="search"
      placeholder="Search articles..."
      value={searchQuery}
      onChange={handleSearchInputChange}
      className="me-2"
    />
    <Button type="submit" variant="outline-success">
      Search
    </Button>
  </BootstrapForm>
)}
          </Navbar>
        </div>
      </div>
    </div>
  );
}

export default App;
