import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import APIService from '../components/APIService';

function Form2(props) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [course, setCourse] = useState('');
  const [videoURL, setVideoURL] = useState('');

  const [showFormModal, setShowFormModal] = useState(false);

  useEffect(() => {
    if (props.articleId) {
      fetchArticleInfo();
    }
  }, [props.articleId]);

  const fetchArticleInfo = () => {
    APIService.GetArticle(props.articleId)
      .then((resp) => {
        setTitle(resp.title || '');
        setBody(resp.body || '');
        setVideoURL(resp.video_URL || '');
        setCourse(resp.course || '');
        openFormModal();
      })
      .catch((error) => console.log(error));
  };

  const handleSubmit = () => {
    if (props.articleId) {
      updateArticle();
    } else {
      insertArticle();
    }
  };

  const updateArticle = () => {
    APIService.UpdateArticle(props.articleId, { title, body, video_URL: videoURL, course })
      .then((resp) => {
        props.updatedData(resp);
        closeFormModal();
      })
      .catch((error) => console.log(error));
  };

  const insertArticle = () => {
    APIService.InsertArticle({ title, body, video_URL: videoURL, course })
      .then((resp) => {
        props.insertedArticle(resp);
        closeFormModal();
      })
      .catch((error) => console.log(error));
  };

  const openFormModal = () => {
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    setShowFormModal(false);
  };
  return (
    <div>
      <Modal show={showFormModal} onHide={closeFormModal}>
        <Modal.Header closeButton>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              className="form-control"
              value={title}
              placeholder="Please Enter Title"
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="body">Description</label>
            <textarea
              rows="5"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="form-control"
              placeholder="Please Enter Description"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="body">Course</label>
            <input
              type="text"
              className="form-control"
              value={course}
              placeholder="Please Enter Course"
              onChange={(e) => setCourse(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="videoURL">Video URL</label>
            <input
              type="text"
              className="form-control"
              value={videoURL}
              placeholder="Please Enter Video URL"
              onChange={(e) => setVideoURL(e.target.value)}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeFormModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {'Update'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Form2;