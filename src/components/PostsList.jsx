import { useEffect, useState } from 'react';

import Post from './Post';
import NewPost from './NewPost';
import Modal from './Modal';
import LoadingSpinner from './LoadingSpinner';

function PostsList({ isPosting, onStopPosting }) {
	const [posts, setPosts] = useState([]);
	const [loading, setLoading] = useState(false);
	const [editPost, setEditPost] = useState(null);

	useEffect(() => {
		async function fetchPosts() {
			setLoading(true);
			const response = await fetch('http://localhost:8080/posts');
			const resData = await response.json();
			setPosts(resData.posts);
			setLoading(false);
		}

		fetchPosts();
	}, []);

	function addPostHandler(postData) {
		async function addPost() {
			setLoading(true);
			await fetch('http://localhost:8080/posts', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(postData)
			});
			setLoading(false);
		}

		addPost();
		setPosts((existingData) => [postData, ...existingData]);
	}

	function deletePostHandler(index) {
		setPosts((existingData) => existingData.filter((_, i) => i !== index));
	}

	function startEditPostHandler(index) {
		setEditPost({ ...posts[index], index });
	}

	function editPostHandler(updatedPost) {
		setPosts((existingData) =>
			existingData.map((post, i) => (i === editPost.index ? updatedPost : post))
		);
		setEditPost(null);
	}

	return (
		<>
			{isPosting && (
				<Modal onCloseModal={onStopPosting}>
					<NewPost onCancel={onStopPosting} onAddPost={addPostHandler} />
				</Modal>
			)}

			{editPost && (
				<Modal onCloseModal={() => setEditPost(null)}>
					<NewPost onCancel={() => setEditPost(null)} onAddPost={editPostHandler} initialData={editPost} />
				</Modal>
			)}

			{loading && <LoadingSpinner />}

			{!loading && posts.length > 0 && (
				<ul className='posts'>
					{posts.map((post, index) => (
						<li key={index} className='post-item'>
							<Post author={post.author} body={post.body} />
							<div className='post-buttons'>
								<button className='edit-button' onClick={() => startEditPostHandler(index)}>Edit</button>
								<button className='delete-button' onClick={() => deletePostHandler(index)}>Delete</button>
							</div>
						</li>
					))}
				</ul>
			)}

			{!loading && posts.length === 0 && (
				<div style={{ textAlign: 'center', color: 'white' }}>
					<h2>There is no post yet.</h2>
					<p>Try to add some!</p>
				</div>
			)}
		</>
	);
}

export default PostsList;