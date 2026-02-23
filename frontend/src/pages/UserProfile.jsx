import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiUser, FiMapPin, FiCalendar, FiHeart, FiMessageSquare, FiRepeat, FiShare2, FiSend, FiBriefcase, FiAward, FiX, FiEdit3 } from 'react-icons/fi'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

const EditProfileModal = ({ user, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        city: user?.city || '',
        country: user?.country || '',
        headline: user?.headline || '',
        bio: user?.bio || ''
    })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await api.patch('/api/auth/me/', formData)
            onUpdate(res.data)
            onClose()
        } catch (error) {
            console.error("Failed to update profile", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Edit Profile</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <FiX size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">First Name</label>
                            <input 
                                type="text" 
                                value={formData.first_name}
                                onChange={e => setFormData({...formData, first_name: e.target.value})}
                                className="w-full rounded-lg border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                            <input 
                                type="text" 
                                value={formData.last_name}
                                onChange={e => setFormData({...formData, last_name: e.target.value})}
                                className="w-full rounded-lg border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Headline</label>
                        <input 
                            type="text" 
                            value={formData.headline}
                            onChange={e => setFormData({...formData, headline: e.target.value})}
                            placeholder="Software Engineer | AI Enthusiast"
                            className="w-full rounded-lg border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand"
                        />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">City</label>
                            <input 
                                type="text" 
                                value={formData.city}
                                onChange={e => setFormData({...formData, city: e.target.value})}
                                className="w-full rounded-lg border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Country</label>
                            <input 
                                type="text" 
                                value={formData.country}
                                onChange={e => setFormData({...formData, country: e.target.value})}
                                className="w-full rounded-lg border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bio</label>
                        <textarea 
                            value={formData.bio}
                            onChange={e => setFormData({...formData, bio: e.target.value})}
                            rows={3}
                            className="w-full rounded-lg border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand"
                        />
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
                        <button type="submit" disabled={loading} className="px-6 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark disabled:opacity-50">
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}

const UserListModal = ({ title, users, onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
        >
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <FiX size={24} />
                </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 space-y-4">
                {users.length === 0 ? (
                    <p className="text-center text-slate-500 py-8">No users found.</p>
                ) : (
                    users.map(u => (
                        <a key={u.id} href={`/profile/${u.username}`} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors">
                            <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold">
                                {u.username?.[0]?.toUpperCase()}
                            </div>
                            <div>
                                <p className="font-semibold text-slate-900 dark:text-white">{u.first_name} {u.last_name}</p>
                                <p className="text-sm text-slate-500">@{u.username}</p>
                            </div>
                        </a>
                    ))
                )}
            </div>
        </motion.div>
    </div>
)

export default function UserProfile() {
  const { user, login } = useAuth() // Assuming login can be used to update user context or we need a setUser
  // Actually, useAuth usually exposes user state. If we update user via API, we should update local context.
  // Let's assume for now we just refresh the page or manually update if setUser is exposed. 
  // Checking AuthContext... it might not expose setUser. 
  // If not, we can rely on page refresh or just local state for profile display if we extract profile to local state.
  // But user comes from context. Let's assume we can trigger a reload or just fetch 'me' again.
  
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [commenting, setCommenting] = useState(null)
  const [commentText, setCommentText] = useState('')
  const [comments, setComments] = useState({}) 
  const [loadingComments, setLoadingComments] = useState(false)
  
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showFollowers, setShowFollowers] = useState(false)
  const [showFollowing, setShowFollowing] = useState(false)
  const [connections, setConnections] = useState({ followers: [], following: [] })

  useEffect(() => {
    fetchPosts()
    fetchConnections()
  }, [])

  const fetchConnections = async () => {
      try {
          const res = await api.get('/api/auth/connections/')
          setConnections(res.data)
      } catch (error) {
          console.error("Failed to fetch connections", error)
      }
  }

  const handleProfileUpdate = (updatedUser) => {
      // Force reload to update context or if context has a refresh method use that.
      // For now, reload page is simplest if context doesn't support update.
      window.location.reload()
  }

  const fetchPosts = async () => {
    try {
      const res = await api.get('/api/auth/posts/')
      setPosts(res.data)
    } catch (error) {
      console.error("Failed to fetch posts", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async (post) => {
      setLoadingComments(true)
      try {
          const res = await api.get(`/api/engagement/comments/?content_type=${post.type}&content_id=${post.id}`)
          setComments(prev => ({
              ...prev,
              [`${post.type}-${post.id}`]: res.data
          }))
      } catch (error) {
          console.error("Failed to fetch comments", error)
      } finally {
          setLoadingComments(false)
      }
  }

  const toggleComments = (post) => {
      if (commenting === post.id) {
          setCommenting(null)
      } else {
          setCommenting(post.id)
          fetchComments(post)
      }
  }

  const handleAction = async (post, action) => {
    try {
      if (action === 'like') {
         setPosts(posts.map(p => {
             if (p.id === post.id && p.type === post.type) {
                 return {
                     ...p,
                     liked_by_user: !p.liked_by_user,
                     likes: p.liked_by_user ? p.likes - 1 : p.likes + 1
                 }
             }
             return p
         }))
      }
      
      await api.post('/api/engagement/action/', {
        content_type: post.type,
        content_id: post.id,
        action: action
      })
      
      if (action === 'repost') {
           setPosts(posts.map(p => {
             if (p.id === post.id && p.type === post.type) {
                 return { ...p, reposts: p.reposts + 1 }
             }
             return p
         }))
      }
      
      if (action === 'share') {
          navigator.clipboard.writeText(`${window.location.origin}/feed`) // Mock share link
          alert("Link copied to clipboard!")
           setPosts(posts.map(p => {
             if (p.id === post.id && p.type === post.type) {
                 return { ...p, shares: p.shares + 1 }
             }
             return p
         }))
      }

    } catch (error) {
      console.error(`Failed to ${action}`, error)
      if (action === 'like') fetchPosts()
    }
  }

  const handleComment = async (post) => {
      if (!commentText.trim()) return
      try {
          const res = await api.post('/api/engagement/comments/', {
              content_type: post.type,
              content_id: post.id,
              text: commentText
          })
          setCommentText('')
          // Update comments list locally
          setComments(prev => ({
              ...prev,
              [`${post.type}-${post.id}`]: [res.data, ...(prev[`${post.type}-${post.id}`] || [])]
          }))
           setPosts(posts.map(p => {
             if (p.id === post.id && p.type === post.type) {
                 return { ...p, comments: p.comments + 1 }
             }
             return p
         }))
      } catch (error) {
          console.error("Failed to comment", error)
      }
  }

  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-4 border-brand border-t-transparent"></div></div>

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <AnimatePresence>
          {showEditProfile && (
              <EditProfileModal 
                  user={user} 
                  onClose={() => setShowEditProfile(false)} 
                  onUpdate={handleProfileUpdate}
              />
          )}
          {showFollowers && (
              <UserListModal 
                  title="Followers" 
                  users={connections.followers} 
                  onClose={() => setShowFollowers(false)} 
              />
          )}
          {showFollowing && (
              <UserListModal 
                  title="Following" 
                  users={connections.following} 
                  onClose={() => setShowFollowing(false)} 
              />
          )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Profile Header */}
        <div className="glass rounded-2xl overflow-hidden p-8 relative">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-brand-light to-brand-dark opacity-90"></div>
            <div className="relative mt-12 flex flex-col md:flex-row items-end md:items-center gap-6">
                <div className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 bg-white dark:bg-slate-700 flex items-center justify-center text-6xl text-brand shadow-xl overflow-hidden">
                     {user?.avatar ? (
                        <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                        user?.username?.[0]?.toUpperCase()
                    )}
                </div>
                <div className="flex-1 mb-2">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{user?.first_name} {user?.last_name || user?.username}</h1>
                    {user?.headline ? (
                        <p className="text-slate-600 dark:text-slate-400 font-medium">{user.headline}</p>
                    ) : (
                        <p className="text-slate-500 dark:text-slate-500 italic">No headline added</p>
                    )}
                    
                    <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-500 dark:text-slate-400">
                        {user?.city || user?.country ? (
                             <span className="flex items-center gap-1"><FiMapPin /> {user?.city}{user?.city && user?.country ? ', ' : ''}{user?.country}</span>
                        ) : null}
                        <span className="flex items-center gap-1"><FiCalendar /> Joined {new Date(user?.date_joined || Date.now()).getFullYear()}</span>
                    </div>

                    {user?.bio && (
                        <p className="mt-4 text-slate-600 dark:text-slate-300 max-w-2xl text-sm leading-relaxed">
                            {user.bio}
                        </p>
                    )}

                    <div className="flex gap-6 mt-6">
                        <button 
                            onClick={() => setShowFollowers(true)}
                            className="text-center group hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-lg transition-colors cursor-pointer"
                        >
                            <span className="block text-xl font-bold text-slate-900 dark:text-white group-hover:text-brand transition-colors">{connections.followers.length}</span>
                            <span className="text-xs text-slate-500 uppercase tracking-wide">Followers</span>
                        </button>
                        <button 
                            onClick={() => setShowFollowing(true)}
                            className="text-center group hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-lg transition-colors cursor-pointer"
                        >
                            <span className="block text-xl font-bold text-slate-900 dark:text-white group-hover:text-brand transition-colors">{connections.following.length}</span>
                            <span className="text-xs text-slate-500 uppercase tracking-wide">Following</span>
                        </button>
                    </div>
                </div>
                <button 
                    onClick={() => setShowEditProfile(true)}
                    className="btn-primary py-2 px-6 text-sm flex items-center gap-2"
                >
                    <FiEdit3 /> Edit Profile
                </button>
            </div>
        </div>

        {/* Posts Section */}
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white px-2">Your Activity</h2>
            
            {posts.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <FiBriefcase className="mx-auto h-12 w-12 text-slate-400" />
                    <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">No posts yet</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Get started by creating a new job posting or opportunity.</p>
                </div>
            ) : (
                <AnimatePresence>
                    {posts.map(post => (
                        <motion.div 
                            key={`${post.type}-${post.id}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold">
                                            {user?.username?.[0]?.toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900 dark:text-white">{user?.username}</h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {new Date(post.created_at).toLocaleDateString()} • {post.type === 'job' ? 'Job Posting' : 'Opportunity'}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${post.type === 'job' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'}`}>
                                        {post.type === 'job' ? <FiBriefcase className="inline mr-1"/> : <FiAward className="inline mr-1"/>}
                                        {post.type === 'job' ? 'Job' : 'Opportunity'}
                                    </span>
                                </div>

                                <div className="mt-4">
                                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{post.title}</h4>
                                    <p className="text-slate-600 dark:text-slate-300 line-clamp-3">{post.description}</p>
                                    {post.company && <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">@ {post.company}</p>}
                                    {post.org && <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">@ {post.org}</p>}
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-6 flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-4">
                                    <button 
                                        onClick={() => handleAction(post, 'like')}
                                        className={`flex items-center gap-2 text-sm font-medium transition-colors ${post.liked_by_user ? 'text-pink-500' : 'text-slate-500 dark:text-slate-400 hover:text-pink-500'}`}
                                    >
                                        <FiHeart className={post.liked_by_user ? 'fill-current' : ''} /> {post.likes || 0}
                                    </button>
                                    
                                    <button 
                                        onClick={() => toggleComments(post)}
                                        className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-blue-500 transition-colors"
                                    >
                                        <FiMessageSquare /> {post.comments || 0}
                                    </button>
                                    
                                    <button 
                                        onClick={() => handleAction(post, 'repost')}
                                        className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-green-500 transition-colors"
                                    >
                                        <FiRepeat /> {post.reposts || 0}
                                    </button>
                                    
                                    <button 
                                        onClick={() => handleAction(post, 'share')}
                                        className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-brand transition-colors"
                                    >
                                        <FiShare2 /> {post.shares || 0}
                                    </button>
                                </div>

                                {/* Comment Section */}
                                <AnimatePresence>
                                    {commenting === post.id && (
                                        <motion.div 
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700"
                                        >
                                            {/* Comment List */}
                                            <div className="mb-4 space-y-3 max-h-60 overflow-y-auto">
                                                {loadingComments ? (
                                                    <div className="text-center text-sm text-slate-500">Loading comments...</div>
                                                ) : comments[`${post.type}-${post.id}`]?.length > 0 ? (
                                                    comments[`${post.type}-${post.id}`].map(comment => (
                                                        <div key={comment.id} className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg text-sm">
                                                            <div className="flex justify-between items-start mb-1">
                                                                <span className="font-semibold text-slate-900 dark:text-white">{comment.user?.username || 'User'}</span>
                                                                <span className="text-xs text-slate-500">{new Date(comment.created_at).toLocaleDateString()}</span>
                                                            </div>
                                                            <p className="text-slate-700 dark:text-slate-300">{comment.text}</p>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center text-sm text-slate-500 py-2">No comments yet. Be the first to say something!</div>
                                                )}
                                            </div>

                                            {/* Input Area */}
                                            <div className="flex gap-2">
                                                <input 
                                                    type="text" 
                                                    value={commentText}
                                                    onChange={(e) => setCommentText(e.target.value)}
                                                    placeholder="Add a comment..." 
                                                    className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-brand"
                                                />
                                                <button 
                                                    onClick={() => handleComment(post)}
                                                    disabled={!commentText.trim()}
                                                    className="bg-brand text-white p-2 rounded-lg hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    <FiSend />
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            )}
        </div>
      </div>
    </div>
  )
}
