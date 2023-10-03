// UserInfo.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Container, Row, Col , Dropdown , Accordion,Button } from 'react-bootstrap';
import APIService from '../components/APIService';
import ReactPlayer from 'react-player';

function UserInfo() {
  const [userData, setUserData] = useState({});
  const [userArticles, setUserArticles] = useState([]);
  const [comments, setComments] = useState({});
  const { articleId } = useParams();

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
      const response = await APIService.getUser(articleId);
      setUserData(response);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchUserArticles = async () => {
    try {
      const userid = userData.id;
      const articlesResponse = await APIService.getuser_articles(userid);
      setUserArticles(articlesResponse);

      // Fetch comments for each article
      const commentsData = {};
      for (const article of articlesResponse) {
        const articleComments = await APIService.getArticleComments(article.id);
        commentsData[article.id] = articleComments;
      }
      setComments(commentsData);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCommentDelete = (commentId) => {
    APIService.DeleteComment(commentId)
      .then(() => {
        fetchUserArticles(); // Refresh user articles after comment deletion
      })
      .catch((error) => console.log(error));
  };

  return (
    <Container className="my-4">
      <Row>
        <Col xs={12} md={6} className="text-center">
          <Card className="shadow">
            {userData.profile_picture && <Card.Img src={userData.profile_picture} alt={`${userData.username}'s Profile`} />}
            <Card.Body>
              <Card.Title>{userData.username}</Card.Title>
              <Card.Text>User ID: {userData.id}</Card.Text>
              {/* Add more information from the user object as needed */}
              {/* For example, you could add user's email, bio, etc. */}
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <h2 className="text-center mb-3">User Details</h2>
          <Card className="shadow">
            <Card.Body>
              <h3>Username: {userData.username}</h3>
              <h5>User ID: {userData.id}</h5>
              {/* Add more information from the user object as needed */}
              {/* For example, you could add user's email, bio, etc. */}
              <h4>Articles by {userData.username}:</h4>
              {userArticles.map((article) => (
                <Card key={article.id} className="my-4">
                  <Card.Body>
                    <div style={{ fontWeight: 'bold' }}>{article.title}</div>
                    <div className="right-bubble"> 
                      <span>{article.course}</span>
                    </div>
                    <div className="player-wrapper">
                      <ReactPlayer className="react-player" url={article.video_URL} width="100%" height="auto" controls />
                    </div>
                    <Card.Text>{article.body}</Card.Text>
                    <Card.Text>{article.date}</Card.Text>
                    <Accordion className="mt-3">
                      <Accordion.Item eventKey="0">
                        <Accordion.Header>
                          Comments
                        </Accordion.Header>
                        <Accordion.Body>
                          {comments[article.id] && (
                            <div>
                              {comments[article.id].map((comment) => (
                                <Card key={comment.id} className="my-3">
                                  <Card.Body>
                                    <Card.Text>{comment.content}</Card.Text>
                                    <div className="player-wrapper">
                                      <ReactPlayer className="react-player" url={comment.video_URL} width="100%" height="auto" controls />
                                    </div>
                                    {/* Add more elements to display additional comment information if needed */}
                                    {comment.author_id == sessionStorage.getItem('userId') && (
                                      <Button variant="danger" onClick={() => handleCommentDelete(comment.id)}>
                                        Delete Comment
                                      </Button>
                                    )}
                                  </Card.Body>
                                </Card>
                              ))}
                            </div>
                          )}
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                    {/* Add more elements to display additional article information if needed */}
                  </Card.Body>
                </Card>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="mt-3">
      <Col className="text-center">
        <Button as={Link} to="/" variant="primary">Back to Articles</Button>
      </Col>
      </Row>
    </Container>
  );
}

export default UserInfo;
