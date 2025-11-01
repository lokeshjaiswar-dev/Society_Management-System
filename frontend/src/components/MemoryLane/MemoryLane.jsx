import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Image, Plus, Heart, MessageCircle, Share, 
  Calendar, User, Smile, Camera
} from 'lucide-react';
import { memoryAPI } from '../../services/api';
import Button from '../Common/Button';
import LoadingSpinner from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';

const MemoryLane = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentText, setCommentText] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    images: []
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await memoryAPI.getAll();
      console.log('Memory Lane API response:', response);
      
      const postsData = response?.data?.data || [];
      setPosts(Array.isArray(postsData) ? postsData : []);
    } catch (error) {
      console.error('Error fetching memory posts:', error);
      toast.error('Failed to load memory lane posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('eventDate', formData.eventDate);
      
      formData.images.forEach((image) => {
        submitData.append('images', image);
      });

      await memoryAPI.create(submitData);
      toast.success('Memory shared successfully!');
      setShowModal(false);
      setFormData({
        title: '',
        description: '',
        eventDate: '',
        images: []
      });
      fetchPosts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to share memory');
    }
  };

  const handleLike = async (postId) => {
    try {
      await memoryAPI.like(postId);
      fetchPosts(); // Refresh to get updated likes
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const handleComment = async (postId) => {
    if (!commentText.trim()) return;

    try {
      await memoryAPI.comment(postId, commentText);
      setCommentText('');
      fetchPosts(); // Refresh to get updated comments
      toast.success('Comment added!');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const isLikedByUser = (post) => {
    return Array.isArray(post?.likes) && post.likes.some(like => like?._id === user?.id);
  };

  if (loading) {
    return <LoadingSpinner text="Loading memory lane..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Memory Lane</h1>
          <p className="text-gray-400">
            Share and cherish society events and memories
          </p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="mt-4 sm:mt-0"
        >
          <Plus className="w-5 h-5 mr-2" />
          Share Memory
        </Button>
      </div>

      {/* Memory Posts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.isArray(posts) && posts.map((post) => (
          <div
            key={post?._id}
            className="bg-black/50 backdrop-blur-lg rounded-2xl border border-emerald-800/30 hover:border-emerald-600/50 transition-all duration-300 overflow-hidden group"
          >
            {/* Images */}
            {post?.images && Array.isArray(post.images) && post.images.length > 0 && (
              <div className="relative">
                <img
                  src={post.images[0]?.url}
                  alt={post?.title || 'Memory image'}
                  className="w-full h-48 object-cover"
                />
                {post.images.length > 1 && (
                  <div className="absolute top-4 right-4 bg-black/70 text-white px-2 py-1 rounded-full text-sm">
                    +{post.images.length - 1} more
                  </div>
                )}
              </div>
            )}

            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                    {post?.title || 'Untitled Memory'}
                  </h3>
                  {post?.eventDate && (
                    <div className="flex items-center space-x-1 text-gray-400 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(post.eventDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {post?.description && (
                <p className="text-gray-400 mb-4 line-clamp-3">
                  {post.description}
                </p>
              )}

              {/* Author */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{post?.postedBy?.fullName || 'User'}</p>
                  <p className="text-xs text-gray-400">
                    {post?.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Unknown date'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between border-t border-emerald-800/30 pt-4">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleLike(post._id)}
                    className={`flex items-center space-x-1 transition-colors ${
                      isLikedByUser(post) 
                        ? 'text-red-400' 
                        : 'text-gray-400 hover:text-red-400'
                    }`}
                  >
                    <Heart 
                      className={`w-5 h-5 ${
                        isLikedByUser(post) ? 'fill-current' : ''
                      }`} 
                    />
                    <span>{Array.isArray(post?.likes) ? post.likes.length : 0}</span>
                  </button>

                  <button
                    onClick={() => setSelectedPost(post)}
                    className="flex items-center space-x-1 text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>{Array.isArray(post?.comments) ? post.comments.length : 0}</span>
                  </button>

                  <button className="flex items-center space-x-1 text-gray-400 hover:text-emerald-400 transition-colors">
                    <Share className="w-5 h-5" />
                  </button>
                </div>

                {post?.images && Array.isArray(post.images) && post.images.length > 0 && (
                  <div className="flex items-center space-x-1 text-gray-400">
                    <Camera className="w-4 h-4" />
                    <span className="text-sm">{post.images.length}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {(!Array.isArray(posts) || posts.length === 0) && (
        <div className="text-center py-12 bg-black/50 backdrop-blur-lg rounded-2xl border border-emerald-800/30">
          <Image className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No memories shared yet</p>
          <p className="text-gray-400 mt-2">Be the first to share a memory from society events!</p>
        </div>
      )}

      {/* Share Memory Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl border border-emerald-800/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-emerald-800/30">
              <h2 className="text-xl font-bold text-white">Share a Memory</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Memory Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="e.g., Holi Celebration 2024, Society Picnic..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  placeholder="Share your memories and experiences..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Event Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Upload Photos
                </label>
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="memory-images"
                  />
                  <label
                    htmlFor="memory-images"
                    className="cursor-pointer flex flex-col items-center space-y-2"
                  >
                    <Camera className="w-8 h-8 text-gray-500" />
                    <span className="text-gray-400">Click to upload photos</span>
                    <span className="text-gray-500 text-sm">Share up to 10 photos</span>
                  </label>
                </div>

                {/* Preview Images */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg border border-gray-700"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1"
                >
                  <Smile className="w-5 h-5 mr-2" />
                  Share Memory
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({
                      title: '',
                      description: '',
                      eventDate: '',
                      images: []
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comments Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl border border-emerald-800/30 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-emerald-800/30">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Comments</h2>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  ×
                </button>
              </div>
              <p className="text-gray-400 mt-1">{selectedPost?.title || 'Untitled Memory'}</p>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {Array.isArray(selectedPost?.comments) && selectedPost.comments.length > 0 ? (
                selectedPost.comments.map((comment, index) => (
                  <div key={index} className="flex space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-800 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-white">{comment?.user?.fullName || 'User'}</span>
                          <span className="text-gray-500 text-sm">
                            {comment?.createdAt ? new Date(comment.createdAt).toLocaleDateString() : 'Unknown date'}
                          </span>
                        </div>
                        <p className="text-gray-300">{comment?.text || ''}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No comments yet</p>
                  <p className="text-sm mt-1">Be the first to comment!</p>
                </div>
              )}
            </div>

            {/* Add Comment */}
            <div className="p-6 border-t border-emerald-800/30">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <Button
                  onClick={() => handleComment(selectedPost._id)}
                  disabled={!commentText.trim()}
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryLane;