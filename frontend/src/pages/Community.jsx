import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Community = () => {
  const [showAddReview, setShowAddReview] = useState(false);
  const [newReview, setNewReview] = useState({
    title: '',
    content: '',
    rating: 5,
    category: 'Product Review'
  });

  const discussions = [
    {
      id: 1,
      title: 'Amazing organic tomatoes from Green Valley Farm!',
      author: 'Sarah Johnson',
      authorType: 'Customer',
      replies: 12,
      likes: 45,
      timeAgo: '2 hours ago',
      category: 'Product Review',
      rating: 5,
      excerpt: 'Just received my order of organic tomatoes and they are absolutely fantastic! Fresh, juicy, and full of flavor...'
    },
    {
      id: 2,
      title: 'Best seasonal vegetables this month',
      author: 'Mike Chen',
      authorType: 'Customer',
      replies: 8,
      likes: 32,
      timeAgo: '5 hours ago',
      category: 'General Discussion',
      rating: 4,
      excerpt: 'Wanted to share my experience with the seasonal vegetable box. Great variety and quality...'
    },
    {
      id: 3,
      title: 'Excellent customer service experience',
      author: 'Emma Davis',
      authorType: 'Customer',
      replies: 15,
      likes: 67,
      timeAgo: '1 day ago',
      category: 'Service Review',
      rating: 5,
      excerpt: 'Had an issue with my delivery and the team resolved it immediately. Outstanding service...'
    },
    {
      id: 4,
      title: 'Fresh herbs selection review',
      author: 'David Wilson',
      authorType: 'Customer',
      replies: 6,
      likes: 28,
      timeAgo: '2 days ago',
      category: 'Product Review',
      rating: 4,
      excerpt: 'The herb selection is great, especially the basil and cilantro. Very fresh and aromatic...'
    },
    {
      id: 5,
      title: 'Recipe ideas using GreenHarvest produce',
      author: 'Lisa Brown',
      authorType: 'Customer',
      replies: 22,
      likes: 89,
      timeAgo: '3 days ago',
      category: 'Recipes',
      rating: 5,
      excerpt: 'Sharing some delicious recipes I made using the fresh vegetables from my recent order...'
    }
  ];

  const categories = ['All', 'Product Review', 'Service Review', 'General Discussion', 'Recipes'];

  const handleAddReview = (e) => {
    e.preventDefault();
    // Here you would typically send the review to your backend
    console.log('New review:', newReview);
    setShowAddReview(false);
    setNewReview({
      title: '',
      content: '',
      rating: 5,
      category: 'Product Review'
    });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={index < rating ? 'text-yellow-500' : 'text-gray-300'}>
        ★
      </span>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Community Reviews & Discussions</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Share your experiences, read reviews from other customers, and connect with the GreenHarvest community.
          </p>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold mb-2" style={{color: '#51ac37'}}>450+</div>
            <div className="text-gray-600">Customer Reviews</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold mb-2" style={{color: '#51ac37'}}>4.8</div>
            <div className="text-gray-600">Average Rating</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold mb-2" style={{color: '#51ac37'}}>98%</div>
            <div className="text-gray-600">Satisfaction Rate</div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              className="px-4 py-2 rounded-full text-sm font-medium transition-colors hover:opacity-90"
              style={{
                backgroundColor: category === 'All' ? '#51ac37' : 'white',
                color: category === 'All' ? 'white' : '#51ac37',
                border: `2px solid #51ac37`
              }}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Add Review Section */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Customer Reviews & Discussions</h2>
              <button
                onClick={() => setShowAddReview(!showAddReview)}
                className="px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                style={{backgroundColor: '#51ac37'}}
              >
                {showAddReview ? 'Cancel' : 'Add Review'}
              </button>
            </div>

            {/* Add Review Form */}
            {showAddReview && (
              <form onSubmit={handleAddReview} className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Review Title *
                    </label>
                    <input
                      type="text"
                      value={newReview.title}
                      onChange={(e) => setNewReview({...newReview, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter review title"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={newReview.category}
                      onChange={(e) => setNewReview({...newReview, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="Product Review">Product Review</option>
                      <option value="Service Review">Service Review</option>
                      <option value="General Discussion">General Discussion</option>
                      <option value="Recipes">Recipes</option>
                    </select>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating *
                  </label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview({...newReview, rating: star})}
                        className={`text-2xl ${star <= newReview.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">({newReview.rating}/5)</span>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Review *
                  </label>
                  <textarea
                    value={newReview.content}
                    onChange={(e) => setNewReview({...newReview, content: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Share your experience..."
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                    style={{backgroundColor: '#51ac37'}}
                  >
                    Post Review
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddReview(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
              {discussions.map((discussion) => (
                <div key={discussion.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{backgroundColor: '#51ac37'}}>
                        {discussion.author.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{discussion.author}</div>
                        <div className="text-sm text-gray-500">{discussion.authorType} • {discussion.timeAgo}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        {discussion.category}
                      </span>
                      {discussion.rating && (
                        <div className="flex items-center">
                          {renderStars(discussion.rating)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{discussion.title}</h3>
                  <p className="text-gray-600 mb-4">{discussion.excerpt}</p>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
                      </svg>
                      <span>{discussion.replies} replies</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
                      </svg>
                      <span>{discussion.likes} likes</span>
                    </div>
                    <button className="text-green-600 hover:text-green-700 font-medium">
                      Reply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Join Community CTA */}
        <div 
          className="rounded-lg p-8 text-center text-white"
          style={{backgroundColor: '#51ac37'}}
        >
          <h2 className="text-3xl font-bold mb-4">Share Your Experience</h2>
          <p className="text-green-100 mb-6 max-w-2xl mx-auto">
            Help other customers discover the best products and share your honest reviews about your GreenHarvest experience.
          </p>
          <button
            onClick={() => setShowAddReview(true)}
            className="px-6 py-3 bg-white text-green-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            Write a Review
          </button>
        </div>
      </div>
    </div>
  );
};

export default Community;