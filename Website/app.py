from flask import Flask, jsonify , request 
from flask_sqlalchemy import SQLAlchemy
import datetime
from flask_marshmallow import Marshmallow
from flask_cors import CORS
from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_jwt_extended import jwt_required
from flask_jwt_extended import JWTManager
from werkzeug.utils import secure_filename
import firebase_admin
from firebase_admin import credentials, storage
from sqlalchemy import func
from werkzeug.security import check_password_hash



 
app = Flask(__name__)
CORS(app)

# Setup the Flask-JWT-Extended extension
app.config["JWT_SECRET_KEY"] = "ggghghghghghghvg"  # Change this!
jwt = JWTManager(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:''@localhost/flask2'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
ma = Marshmallow(app)



class Articles(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100))
    video_URL = db.Column(db.Text)
    body = db.Column(db.Text)
    date = db.Column(db.DateTime, default=datetime.datetime.now)
    author_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    comments = db.relationship('Comment', backref='article', lazy=True)
    course = db.Column(db.String(100))
    likes = db.relationship('Like', backref='liked_article', lazy='dynamic')


    def __init__(self, title, body, video_URL ,author_id,course):
        self.title = title
        self.body = body
        self.video_URL = video_URL
        self.author_id = author_id
        self.course = course

class Like(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    article_id_like = db.Column(db.Integer, db.ForeignKey('articles.id'))
    

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True) 
    username = db.Column(db.String(50), unique=True, nullable=False) 
    password = db.Column(db.String(100), nullable=False) 
    profile_picture = db.Column(db.String(200)) 
    articles = db.relationship('Articles', backref='author', lazy=True)  
    comments = db.relationship('Comment', backref='author', lazy=True) 
    likes = db.relationship('Like', backref='user', lazy=True)


    def __init__(self, username, password , profile_picture):
        self.username = username
        self.password = password
        self.profile_picture = profile_picture

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text)
    video_URL = db.Column(db.Text)
    article_id = db.Column(db.Integer, db.ForeignKey('articles.id'))
    author_id = db.Column(db.Integer, db.ForeignKey('user.id'))

    def __init__(self, content, article_id, author_id, video_URL=None):
        self.content = content
        self.video_URL = video_URL
        self.article_id = article_id
        self.author_id = author_id
    

class ArticleSchema(ma.Schema):
    class Meta:
        fields = ('id','title','body','date','video_URL','author_id','course')

article_schema = ArticleSchema()
articles_schema = ArticleSchema(many=True)

@app.route('/get', methods=['GET'])
def get_articles():
    all_articles = Articles.query.all()

    # Create a list to store articles and their corresponding like counts
    articles_with_likes = []

    for article in all_articles:
        # Count the number of likes for each article
        like_count = Like.query.filter_by(article_id_like=article.id).count()
        articles_with_likes.append((article, like_count))

    # Sort articles based on like counts in descending order
    sorted_articles = sorted(articles_with_likes, key=lambda x: x[1], reverse=True)

    articles_data = []

    for article, like_count in sorted_articles:
        article_data = article_schema.dump(article)
        article_data['comments'] = get_comments_data(article.id)
        article_data['like_count'] = like_count
        articles_data.append(article_data)

    return jsonify(articles_data)

def get_comments_data(article_id):
    article = Articles.query.get(article_id)
    if not article:
        return []

    comments = article.comments
    comments_data = []
    for comment in comments:
        comment_data = {
            'id': comment.id,
            'content': comment.content,
            'video_URL': comment.video_URL,  # Include the video_URL field
            'author_id': comment.author_id,
            'author_username': comment.author.username
        }
        comments_data.append(comment_data)

    return comments_data

@app.route('/add', methods = ['POST'])
@jwt_required()
def add_article():
    title = request.json['title']
    body = request.json['body']
    video_URL = request.json['video_URL']
    course = request.json['course'] 
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()
    if not user:
        return jsonify({"msg": "User not found"}), 404
    article= Articles(title=title, body=body, video_URL=video_URL , course=course ,author_id=user.id)
    db.session.add(article)
    db.session.commit()
    return article_schema.jsonify(article)

@app.route('/update/<id>/', methods = ['PUT'])
def update_article(id):
    article = Articles.query.get(id)
    title = request.json['title']
    body = request.json['body']
    video_URL = request.json['video_URL']
    course = request.json['course']

    article.title = title
    article.body = body
    article.video_URL = video_URL
    article.course = course
    
    db.session.commit()
    return article_schema.jsonify(article)

@app.route('/delete/<id>/', methods = ['DELETE'])
@jwt_required()
def article_delete(id):
    current_user = get_jwt_identity()
    article = Articles.query.get(id)
    user = User.query.filter_by(username=current_user).first()
    if user.id == article.author_id:
        db.session.delete(article)
        db.session.commit()
    else:
        return jsonify({"msg": "Your not the owner"}), 404
    return article_schema.jsonify(article)

@app.route('/add-comment/<article_id>', methods=['POST'])
@jwt_required()
def add_comment(article_id):
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()
    if not user:
        return jsonify({"msg": "User not found"}), 404

    article = Articles.query.get(article_id)
    if not article:
        return jsonify({"msg": "Article not found"}), 404

    content = request.json['content']
    video_URL = request.json['video_URL']
    title = request.json['title']
    
    comment = Comment(content=content, video_URL=video_URL, article_id=article_id, author_id=user.id)
    db.session.add(comment)
    db.session.commit()
    return jsonify({"msg": "Comment added successfully"}), 200


@app.route('/get-comments/<article_id>', methods=['GET'])
def get_comments(article_id):
    article = Articles.query.get(article_id)
    if not article:
        return jsonify({"msg": "Article not found"}), 404

    comments = article.comments
    comments_data = []
    for comment in comments:
        comment_data = {
            'id': comment.id,
            'content': comment.content,
            'author_id': comment.author_id,
            'author_username': comment.author.username,
            'video_URL':comment.video_URL
        }
        comments_data.append(comment_data)

    return jsonify(comments_data), 200


@app.route('/delete-comment/<comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()
    if not user:
        return jsonify({"msg": "User not found"}), 404

    comment = Comment.query.get(comment_id)
    if not comment:
        return jsonify({"msg": "Comment not found"}), 404

    if user.id != comment.author_id:
        return jsonify({"msg": "You are not the owner of this comment"}), 403

    db.session.delete(comment)
    db.session.commit()
    return jsonify({"msg": "Comment deleted successfully"}), 200

@app.route('/token', methods=['POST'])
def create_token():
    username = request.json.get("username", None)
    password = request.json.get("password", None)
    
    if not username or not password:
        return jsonify({"message": "Username and password are required."}), 400

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"message": "User does not exist. Please sign up."}), 404
    if user.password != password:
        return jsonify({"message": "incorrect password "}), 401

    access_token = create_access_token(identity=username)
    return jsonify(access_token=access_token, user1=username, userId=user.id), 200


@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    profile_picture = data.get("profile_picture")

    if not username or not password:
        return jsonify({"message": "Username and password are required."}), 400

    existing_user = User.query.filter_by(username=username).first()

    if existing_user:
        return jsonify({"message": "Username already exists. Please log in."}), 409

    # Create a new user record
    user = User(username=username, password=password, profile_picture=profile_picture)
    db.session.add(user)
    db.session.commit()

    access_token = create_access_token(identity=username)
    return jsonify(access_token=access_token, user1=username, userId=user.id, profile_picture=profile_picture), 200

@app.route('/getuser/<article_id>', methods=['GET'])
def get_user(article_id):
    article = Articles.query.get(article_id)
    if not article:
        return jsonify({"msg": "Article not found"}), 404

    user = User.query.filter_by(id=article.author_id).first()
    if user:
        user_data = {
            'id': user.id,
            'username': user.username,
            'profile_picture': user.profile_picture,
        }
        print(user_data)
        return jsonify(user_data), 200
    else:
        return jsonify({"msg": "User not found"}), 404
    
@app.route('/getuser_articles/<user_id>', methods=['GET'])
def getuser_articles(user_id):
    user = User.query.filter_by(id=user_id).first()
    if not user:
        return jsonify({"msg": "User not found"}), 404

    all_articles = Articles.query.filter_by(author_id=user.id)
    articles_data = []

    for article in all_articles:
        article_data = article_schema.dump(article)
        article_data['comments'] = get_comments_data(article.id)
        articles_data.append(article_data)

    return jsonify(articles_data)

@app.route('/search/<search_query>', methods=['GET'])
def search_articles(search_query):
    search_results = Articles.query.filter(Articles.title.ilike(f'%{search_query}%')).all()

    # Create a list to store search results and their corresponding like counts
    search_results_with_likes = []

    for article in search_results:
        # Count the number of likes for each article
        like_count = Like.query.filter_by(article_id_like=article.id).count()
        search_results_with_likes.append((article, like_count))

    # Sort search results based on like counts in descending order
    sorted_search_results = sorted(search_results_with_likes, key=lambda x: x[1], reverse=True)

    articles_data = []
    for article, like_count in sorted_search_results:
        article_data = article_schema.dump(article)
        article_data['comments'] = get_comments_data(article.id)
        article_data['like_count'] = like_count
        articles_data.append(article_data)

    return jsonify(articles_data)

@app.route('/search_course/<search_query>', methods=['GET'])
def search_articlescourse(search_query):
    search_results = Articles.query.filter(Articles.course.ilike(f'%{search_query}%')).all()

    # Create a list to store search results and their corresponding like counts
    search_results_with_likes = []

    for article in search_results:
        # Count the number of likes for each article
        like_count = Like.query.filter_by(article_id_like=article.id).count()
        search_results_with_likes.append((article, like_count))

    # Sort search results based on like counts in descending order
    sorted_search_results = sorted(search_results_with_likes, key=lambda x: x[1], reverse=True)

    articles_data = []
    for article, like_count in sorted_search_results:
        article_data = article_schema.dump(article)
        article_data['comments'] = get_comments_data(article.id)
        article_data['like_count'] = like_count
        articles_data.append(article_data)

    return jsonify(articles_data)

@app.route('/like-article/<article_id>', methods=['POST'])
@jwt_required()
def like_article(article_id):
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()
    user_id = user.id    
    article = Articles.query.get(article_id)
    if article is None:
        return jsonify({'error': 'Article not found'}), 404

    existing_like = Like.query.filter_by(user_id=user_id, article_id_like=article.id).first()
    if existing_like:
        db.session.delete(existing_like)
    else:
        new_like = Like(user_id=user_id, article_id_like=article.id)
        db.session.add(new_like)
    
    db.session.commit()

    # Get the updated likes count and return it
    likes_count = Like.query.filter_by(article_id_like=article.id).count()
    return jsonify({'likes_count': likes_count})

@app.route('/get-article-likes/<article_id>', methods=['GET'])
def get_article_likes(article_id):
    article = Articles.query.get(article_id)
    likes_count = Like.query.filter_by(article_id_like=article.id).count()
    return jsonify({'likes_count': likes_count})

@app.route('/has-liked-article/<article_id>', methods=['GET'])
@jwt_required()
def has_liked_article(article_id):
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()
    user_id = user.id
    article = Articles.query.get(article_id)
    if article is None:
        return jsonify({'error': 'Article not found'}), 404
    
    existing_like = Like.query.filter_by(user_id=user_id, article_id_like=article.id).first()
    if existing_like:
        return jsonify({'has_liked': True})
    else:
        return jsonify({'has_liked': False})


@app.route('/getuser1/<user_id>', methods=['GET'])
def get_user1(user_id):
    user = User.query.filter_by(id=user_id).first()
    if user:
        user_data = {
            'id': user.id,
            'username': user.username,
            'profile_picture': user.profile_picture,
        }
        print(user_data)
        return jsonify(user_data), 200
    else:
        return jsonify({"msg": "User not found"}), 404
    
@app.route('/update-username/<user_id>', methods=['PUT'])
@jwt_required()
def update_username(user_id):
    new_username = request.json.get('new_username')
    password = request.json.get('password')

    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    if password != user.password:
        return jsonify({"msg":"Wrong password"}),401

    existing_user = User.query.filter_by(username=new_username).first()
    if existing_user:
        return jsonify({"msg": "Username already exists"}), 409

    user.username = new_username
    db.session.commit()

    return jsonify({"msg": "Username updated successfully"}), 200

if __name__ == "__main__":
    app.run(debug=True)