import React, { useState, useEffect } from 'react';
import { Card, Container, Row, Col, Button, Accordion } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import APIService from '../components/APIService';
import ReactPlayer from 'react-player';
import Form from './Form';
import { useNavigate } from 'react-router-dom';

function CurrentUserSettings() {
  const [userData, setUserData] = useState({});
  const [userArticles, setUserArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [articles, setArticles] = useState([]);
  const [newUsername, setNewUsername] = useState('');
  const [password, setPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [usernameChanged, setUsernameChanged] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (userData.id) {
      fetchUserArticles();
    }
  }, [userData]);

  const fetchUserData = async () => {
    try {
      const userId = sessionStorage.getItem('userId');
      const response = await APIService.getUser1(userId);
      setUserData(response);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchUserArticles = async () => {
    try {
      const userId = userData.id;
      const articlesResponse = await APIService.getuser_articles(userId);
      setUserArticles(articlesResponse);
    } catch (error) {
      console.log(error);
    }
  };

  const handleArticleDelete = (articleId) => {
    APIService.DeleteArticle(articleId)
      .then(() => {
        fetchUserArticles(); // Refresh user articles after deletion
      })
      .catch((error) => console.log(error));
  };

  const handleArticleUpdate = (article) => {
    setSelectedArticle(article);
  };

  const handleUpdatedData = (updatedArticle) => {
    setUserArticles((prevArticles) => {
      return prevArticles.map((article) => {
        if (article.id === updatedArticle.id) {
          return updatedArticle;
        } else {
          return article;
        }
      });
    });
    setSelectedArticle(null); // Clear the selected article after update
  };

  const handleChangeUsername = async () => {
    try {
      const userId = sessionStorage.getItem('userId');
      const Username = newUsername; // Replace with the actual new username
      const password1 = password; // Replace with the actual password
      const token = sessionStorage.getItem('token');

      const response = await fetch(`http://127.0.0.1:5000/update-username/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          new_username: Username,
          password: password1,
        }),
      });

      console.log('API Response:', response); // Debug: Log the entire response

      if (response.status === 200) {
        const data = await response.json();
        console.log('API Response Data:', data); // Debug: Log the response data
        setSuccessMessage('Username updated successfully');
        setErrorMessage('');
        setUsernameChanged(true); // Indicate successful username change
        fetchUserData();
      } else if (response.status === 404) {
        setErrorMessage('User not found');
        setSuccessMessage('');
      } else if (response.status === 401) {
        const data = await response.json();
        console.log('API Response Data:', data); // Debug: Log the response data
        setErrorMessage('Invalid credentials');
        setSuccessMessage('');
      } else if (response.status === 409) {
        setErrorMessage('Username taken');
        setSuccessMessage('');
      } else {
        setErrorMessage('Error updating username');
        setSuccessMessage('');
      }
    } catch (error) {
      console.error('Error changing username:', error);
      // Don't update error and success messages
    }
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    console.log('Logging out');
    navigate('/login');
  };

  return (
    <Container className="my-4">
      <Row>
        <Col xs={12} md={6} className="text-center">
          <Card className="shadow">
            {userData.profile_picture && (
              <Card.Img
                src={userData.profile_picture}
                alt={`${userData.username}'s Profile`}
              />
            )}
            <Card.Body>
              <Card.Title>{userData.username}</Card.Title>
              <Card.Text>User ID: {userData.id}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <h2 className="text-center mb-3">User Settings</h2>
          <div className="mb-3">
          </div>
          <Col xs={12} md={6} className="text-center">
            <h2>Change Username</h2>
            <div className="mb-3">
              <label className="form-label">New Username:</label>
              <input
                type="text"
                className="form-control"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Password:</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button className="btn btn-primary" onClick={handleChangeUsername}>Change Username</button>
            {successMessage && <p className="text-success">{successMessage}</p>}
            {errorMessage && <p className="text-danger">{errorMessage}</p>}
            {usernameChanged && (
              <div>
                <button className="btn btn-primary" onClick={logout}>Log Out</button>
              </div>
            )}
          </Col>

        </Col>
      </Row>
      <Row>
        <Col xs={12} md={6} className="mt-3">
          <h2 className="text-center mb-3">User Articles</h2>
          {userArticles.map((article) => (
            <Card key={article.id} className="my-4">
              <Card.Body>
                <div style={{ fontWeight: 'bold' }}>{article.title}</div>
                <ReactPlayer
                  className="react-player"
                  url={article.video_URL}
                  width="100%"
                  height="auto"
                  controls
                />
                <Card.Text>{article.body}</Card.Text>
                <Card.Text>{article.date}</Card.Text>
                <Button onClick={() => handleArticleUpdate(article)}>
                  Update Article
                </Button>
                {selectedArticle && (
                  <Form
                    article={selectedArticle}
                    updatedData={handleUpdatedData}
                  />
                )}
                <Button
                  variant="danger"
                  onClick={() => handleArticleDelete(article.id)}
                >
                  Delete
                </Button>
                <Accordion className="mt-3">

                </Accordion>
              </Card.Body>
            </Card>
          ))}
        </Col>
      </Row>
      <Row className="mt-3">
        <Col className="text-center">
        {usernameChanged === false && (
  <Row className="mt-3">
    <Col className="text-center">
      <Button as={Link} to="/" variant="primary">
        Back to Articles
      </Button>
    </Col>
  </Row>
)}
        </Col>
      </Row>
    </Container>
  );
}

export default CurrentUserSettings;
