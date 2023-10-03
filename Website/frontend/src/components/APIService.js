export default class APIService {
  static UpdateArticle(id, body) {
    return fetch(`http://127.0.0.1:5000/update/${id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
      .then((resp) => resp.json())
      .catch((error) => {
        throw error;
      });
  }

  static InsertArticle(body) {
    const user = sessionStorage.getItem('user');
    const token = sessionStorage.getItem('token');
    console.log(token);
    return fetch(`http://127.0.0.1:5000/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: body.title,
        body: body.body,
        video_URL: body.video_URL,
        course: body.course,
        username: user,
      }),
    })
      .then((resp) => resp.json())
      .catch((error) => {
        throw error;
      });
  }

  static DeleteArticle(id) {
    const token = sessionStorage.getItem('token');
    return fetch(`http://127.0.0.1:5000/delete/${id}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }).catch((error) => {
      throw error;
    });
  }

  static AddComment(articleId, body) {
    const token = sessionStorage.getItem('token');
    return fetch(`http://127.0.0.1:5000/add-comment/${articleId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        content: body.content,
        video_URL: body.video_URL,
        title: body.title,
      }),
    })
      .then((resp) => resp.json())
      .catch((error) => {
        throw error;
      });
  }

  static getUser(articleId) {
    const token = sessionStorage.getItem('token');
    return fetch(`http://127.0.0.1:5000/getuser/${articleId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then((resp) => {
        return resp.json();
      })
      .catch((error) => {
        throw error;
      });
  }

  static getUser1(userId) {
    const token = sessionStorage.getItem('token');
    return fetch(`http://127.0.0.1:5000/getuser1/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then((resp) => {
        console.log("i am in API")
        return resp.json();
      })
      .catch((error) => {
        throw error;
      });
  }

  static DeleteComment(commentId) {
    const token = sessionStorage.getItem('token');
    return fetch(`http://127.0.0.1:5000/delete-comment/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }).catch((error) => {
      throw error;
    });
  }

  static getuser_articles(user_id) {
    const token = sessionStorage.getItem('token');
    return fetch(`http://127.0.0.1:5000/getuser_articles/${user_id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then((resp) => resp.json())
      .catch((error) => {
        throw error;
      });
  }

  static getArticleComments(articleId) {
    const token = sessionStorage.getItem('token');
    return fetch(`http://127.0.0.1:5000/get-comments/${articleId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then((resp) => resp.json())
      .catch((error) => {
        throw error;
      });
  }

  static likeArticle(articleId) {
    const token = sessionStorage.getItem('token');
    return fetch(`http://127.0.0.1:5000/like-article/${articleId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then((resp) => resp.json())
      .catch((error) => {
        throw error;
      });
  }
  static getArticleLikes(articleId) {
    const token = sessionStorage.getItem('token');
    return fetch(`http://127.0.0.1:5000/get-article-likes/${articleId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then((resp) => resp.json())
      .catch((error) => {
        throw error;
      });
  }
  
  static updateUsername(userId, newUsername, password) {
    const token = sessionStorage.getItem('token');
    return fetch(`http://127.0.0.1:5000/update-username/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        new_username: newUsername,
        password: password,
      }),
    })
      .then((resp) => {
        console.log(resp)
        console.log('Response status:', resp.status);
        return resp.json();
      })
      .catch((error) => {
        console.error('Error:', error);
        throw error;
      });
  }


  static checkIfLiked(articleId) {
    const token = sessionStorage.getItem('token');
    return fetch(`http://127.0.0.1:5000/has-liked-article/${articleId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then((resp) => resp.json())
      .catch((error) => {
        throw error;
      });
  }

}

