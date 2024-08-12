document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('new-post-form');
    const postContent = document.getElementById('post-content');
    const postsDiv = document.getElementById('posts');

    // Fetch existing posts from server
    fetchPosts();

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const content = postContent.value.trim();
        if (content) {
            // Send new post to server
            fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content })
            })
            .then(response => response.json())
            .then(post => {
                // Clear the form and refresh posts
                postContent.value = '';
                fetchPosts();
            })
            .catch(error => console.error('Error posting:', error));
        }
    });

    function fetchPosts() {
        fetch('/api/posts')
            .then(response => response.json())
            .then(posts => {
                postsDiv.innerHTML = posts.map(post => `
                    <div class="post-item" id="post-${post.id}">
                        <p>${post.content}</p>
                        <div class="timestamp">Posted on: ${new Date(post.timestamp).toLocaleString()}</div>
                        <button onclick="showCommentForm(${post.id})">Comment</button>
                        <div id="comments-${post.id}">
                            ${post.comments.map(comment => `
                                <div class="comment-item">
                                    <p>${comment.content}</p>
                                    <div class="timestamp">Commented on: ${new Date(comment.timestamp).toLocaleString()}</div>
                                </div>
                            `).join('')}
                        </div>
                        <form id="comment-form-${post.id}" class="comment-form" style="display:none;">
                            <textarea placeholder="Write your comment here..."></textarea>
                            <button type="submit">Comment</button>
                        </form>
                    </div>
                `).join('');
            })
            .catch(error => console.error('Error fetching posts:', error));
    }

    window.showCommentForm = (postId) => {
        const form = document.getElementById(`comment-form-${postId}`);
        form.style.display = 'block';

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const commentContent = form.querySelector('textarea').value.trim();
            if (commentContent) {
                fetch(`/api/posts/${postId}/comments`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ content: commentContent })
                })
                .then(response => response.json())
                .then(() => {
                    fetchPosts();
                })
                .catch(error => console.error('Error commenting:', error));
            }
        }, { once: true });
    }
});
