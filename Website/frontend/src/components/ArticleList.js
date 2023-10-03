import React, { useState, useEffect } from 'react';
import APIService from '../components/APIService';
import ReactPlayer from 'react-player';
import { Link } from 'react-router-dom';
import { Card, Button, Row, Col, Modal, Form , Accordion } from 'react-bootstrap';
import { FaThumbsUp, FaRegThumbsUp  } from 'react-icons/fa';

function ArticleList(props) {
  const { articles } = props;
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [currentArticleId, setCurrentArticleId] = useState(null);
  const storedUser = sessionStorage.getItem('userId');
  const [commentTitle, setCommentTitle] = useState('');
  const [commentVideoURL, setCommentVideoURL] = useState('');
  const [users, setUsers] = useState({});
  const [articleLikes, setArticleLikes] = useState({});
  const [hasLiked, setHasLiked] = useState(null);

  const titleUsernameStyles = {
    display: 'flex',
    flexDirection: 'column',
  };

  const authorNameStyles = {
    fontSize: '14px',
    fontWeight: 'normal',
    color: '#606060',
  };

  useEffect(() => {
    fetchUsers()
      .then((usersData) => setUsers(usersData))
      .catch((error) => console.log(error));
    fetchArticleLikes();
    fetchLikeStatus();
  }, [articles] , [hasLiked]);


const fetchLikeStatus = async () => {
  try {
    const likedStatus = { ...hasLiked };

    for (const article of articles) {
      const liked =  await hasLikedArticle(article.id);
      likedStatus[article.id] = liked;
    }

    setHasLiked(likedStatus);
  } catch (error) {
    console.error("Error fetching like status:", error);
    setHasLiked({});
  }
};
  
  

  const fetchUsers = async () => {
    const userPromises = articles.map((article) => {
      return APIService.getUser(article.id)
        .then((response) => {
          return { articleId: article.id, userData: response };
        })
        .catch((error) => console.log(error));
    });
  
    return Promise.all(userPromises)
      .then((userResponses) => {
        const mergedUsers = {};
        userResponses.forEach((userResponse) => {
          mergedUsers[userResponse.articleId] = userResponse.userData;
        });
        return mergedUsers;
      })
      .catch((error) => {
        console.log(error);
        return {};
      });
  };
  const fetchArticleLikes = () => {
    const likesPromises = articles.map((article) => {
      return APIService.getArticleLikes(article.id)
        .then((response) => {
          return { articleId: article.id, likesData: response };
        })
        .catch((error) => console.log(error));
    });

    Promise.all(likesPromises)
      .then((likesResponses) => {
        const mergedLikes = {};
        likesResponses.forEach((likesResponse) => {
          mergedLikes[likesResponse.articleId] = likesResponse.likesData.likes_count;
        });
        setArticleLikes(mergedLikes);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleLike = (articleId) => {
    APIService.likeArticle(articleId)
      .then((response) => {
        fetchArticleLikes();
        fetchLikeStatus();

      })
      .catch((error) => {
        console.error("Error liking/unliking article:", error);
      });
  };

  const getArticleLikes = (articleId) => {
    return APIService.getArticleLikes(articleId)
      .then((response) => {
        console.log(response)
        setArticleLikes((prevLikes) => ({
          ...prevLikes,
          [articleId]: response.likes,
        }));
      })
      .catch((error) => {
        console.error("Error fetching article likes:", error);
        throw error; // Rethrow the error to be caught by the caller
      });
  };
  const handleCommentSubmit = () => {
    const commentData = {
      title: commentTitle,
      video_URL: commentVideoURL,
      content: commentContent,
    };
    APIService.AddComment(currentArticleId, commentData)
      .then(() => {
        setShowCommentModal(false);
        setCommentTitle('');
        setCommentVideoURL('');
        setCommentContent('');
        props.refreshArticles(); // Optional: Call a function to refresh the article list
      })
      .catch((error) => console.log(error));
  };
  
  const handleCommentDelete = (commentId) => {
    APIService.DeleteComment(commentId)
      .then(() => {
        props.refreshArticles(); // Optional: Call a function to refresh the article list
      })
      .catch((error) => console.log(error));
  };
  // Function to check if the article has been liked by the user
  const hasLikedArticle = async (articleId) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:5000/has-liked-article/${articleId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      return data.has_liked;
    } catch (error) {
      console.error("Error checking article like status:", error);
      return false;
    }
  };
const renderLikeIcon = (articleId) => {
  try {
    if (hasLiked && hasLiked[articleId] !== undefined) {
      const liked = hasLiked[articleId];
      console.log(liked);
      
      if (liked) {
          return <FaThumbsUp />;
      } else {
          return <FaRegThumbsUp/>;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error rendering like icon:", error);
    return null; // Return a default icon or handle the error as needed
  }
};
  return (
    <div>
      {articles &&
        articles.map((article) => (
          <Card key={article.id} className="my-4">
      <Card.Body>
      <div style={{ fontWeight: 'bold' }}>{article.title}</div>
          <div className="course-bubble">
            <span>{article.course}</span>
          </div>
          <div
          className="youtube-like-container top-right"
          onClick={async () => {
            await handleLike(article.id);
            fetchLikeStatus();
          }}
        >
          {renderLikeIcon(article.id)} {articleLikes[article.id] || 0}
        </div>
        <div className="player-wrapper">
          <ReactPlayer className="react-player" url={article.video_URL} width="100%" height="auto" controls />
        </div>
        <Card.Title>
          {users[article.id] && users[article.id].profile_picture && (
            <img
              src={users[article.id].profile_picture}
              alt={`${users[article.id].username}'s Profile`}
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                marginRight: '10px',
              }}
            />
          )}
         <div style={titleUsernameStyles}>
            <div style={authorNameStyles}>By  <Link to={`/userinfo/${article.id}`}>{users[article.id] && users[article.id].username}</Link> </div>
          </div>
        </Card.Title>
        <Card.Text>{article.body}</Card.Text>
        <Card.Text>{article.date}</Card.Text>
        {article.author_id == storedUser && (
          <Row className="mt-3">
            <Col md={6}>
              <Button variant="primary" onClick={() => props.editArticle(article)}>
                Update
              </Button>
            </Col>
            <Col>
              <Button variant="danger" onClick={() => props.deleteArticle(article)}>
                Delete
              </Button>
            </Col>
          </Row>
        )}
        <Button
          variant="secondary"
          className="mt-3"
          onClick={() => {
            setShowCommentModal(true);
            setCurrentArticleId(article.id);
          }}
        >
          Create a Thread
        </Button>
        <Accordion className="mt-3">
          <Accordion.Item eventKey="0">
            <Accordion.Header>
              Comments
            </Accordion.Header>
            <Accordion.Body>
              {article.comments && (
                <div>
                  {article.comments.map((comment) => (
                    <Card key={comment.id} className="my-3">
                      <Card.Body>
                        <Card.Text>{comment.content}</Card.Text>
                        <div className="player-wrapper">
                          <ReactPlayer
                            className="react-player"
                            url={comment.video_URL}
                            width="100%"
                            height="auto"
                            controls
                          />
                        </div>
                        <Card.Text>{comment.body}</Card.Text>
                        {comment.author_id == storedUser && (
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
      </Card.Body>
    </Card>
        ))}

      {/* Comment Modal */}
      <Modal show={showCommentModal} onHide={() => setShowCommentModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Comment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <Form>
          <Form.Group controlId="formComment">
            <Form.Control
              type="text"
              placeholder="Title"
              value={commentTitle}
              onChange={(e) => setCommentTitle(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="formComment">
            <Form.Control
              type="text"
              placeholder="Video URL"
              value={commentVideoURL}
              onChange={(e) => setCommentVideoURL(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="formComment">
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Comment"
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
            />
          </Form.Group>
        </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCommentModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleCommentSubmit}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ArticleList;


