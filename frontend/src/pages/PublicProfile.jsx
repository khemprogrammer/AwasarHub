import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiUser, FiMapPin, FiCalendar, FiHeart, FiMessageSquare, FiRepeat, FiShare2, FiSend, FiBriefcase, FiAward, FiUserPlus, FiUserCheck } from 'react-icons/fi'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function PublicProfile() {
  const { username } = useParams()
  const { user: currentUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [commenting, setCommenting] = useState(null)
  const [commentText, setCommentText] = useState('')
  const [comments, setComments] = useState({}) 
  const [loadingComments, setLoadingComments] = useState(false)

  useEffect(() => {
    fetchProfile()
    fetchPosts()
  }, [username])

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/api/auth/profile/${username}/`)
      setProfile(res.data)
    } catch (error) {
      console.error("Failed to fetch profile", error)
    }
  }

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/api/auth/profile/${username}/posts/`)
      setPosts(res.data)
    } catch (error) {
      console.error("Failed to fetch posts", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async () => {
    try {
      if (profile.is_following) {
        await api.delete(`/api/auth/follow/${username}/`)
        setProfile(prev => ({ ...prev, is_following: false, followers_count: prev.followers_count - 1 }))
      } else {
        await api.post(`/api/auth/follow/${username}/`)
        setProfile(prev => ({ ...prev, is_following: true, followers_count: prev.followers_count + 1 }))
      }
    } catch (error) {
      console.error("Failed to follow/unfollow", error)
    }
  }

  // Reuse engagement logic from UserProfile (could be extracted to a hook or component)
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
          navigator.clipboard.writeText(`${window.location.origin}/feed`) 
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

  const submitComment = async (post) => {
      if (!commentText.trim()) return
      try {
          await api.post('/api/engagement/comments/', {
              content_type: post.type,
              content_id: post.id,
              text: commentText
          })
          setCommentText('')
          fetchComments(post)
          // Update comment count locally
          setPosts(posts.map(p => {
              if (p.id === post.id && p.type === post.type) {
                  return { ...p, comments: p.comments + 1 }
              }
              return p
          }))
      } catch (error) {
          console.error("Failed to post comment", error)
      }
  }

  if (!profile) return <div className="min-h-screen pt-24 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-4 border-brand border-t-transparent"></div></div>

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8"
        >
          <div className="h-32 bg-gradient-to-r from-brand to-brand-dark"></div>
          <div className="px-8 pb-8">
            <div className="relative flex justify-between items-end -mt-12 mb-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-700 p-1 shadow-lg">
                  <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-3xl font-bold text-gray-400">
                    {profile.username?.[0]?.toUpperCase()}
                  </div>
                </div>
              </div>
              {currentUser && currentUser.username !== profile.username && (
                <button 
                  onClick={handleFollow}
                  className={`px-6 py-2 rounded-full font-medium transition-colors flex items-center gap-2 ${
                    profile.is_following 
                      ? 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200' 
                      : 'bg-brand text-white hover:bg-brand-dark'
                  }`}
                >
                  {profile.is_following ? <><FiUserCheck /> Following</> : <><FiUserPlus /> Follow</>}
                </button>
              )}
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{profile.first_name} {profile.last_name}</h1>
              <p className="text-brand font-medium mb-4">@{profile.username}</p>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300 mb-6">
                 {profile.city && (
                    <div className="flex items-center gap-1">
                      <FiMapPin /> {profile.city}, {profile.country}
                    </div>
                 )}
                 <div className="flex items-center gap-1">
                   <FiCalendar /> Joined {new Date(profile.date_joined).toLocaleDateString()}
                 </div>
              </div>

              <div className="flex gap-6 border-t border-gray-100 dark:border-gray-700 pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{posts.length}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{profile.followers_count}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{profile.following_count}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Following</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Posts Grid */}
        <div className="grid gap-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Posts</h2>
          {loading ? (
             <div className="text-center py-12">
               <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-brand border-t-transparent"></div>
             </div>
          ) : posts.length === 0 ? (
             <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow">
               <p className="text-gray-500">No posts yet.</p>
             </div>
          ) : (
             posts.map(post => (
               <motion.div 
                 key={`${post.type}-${post.id}`}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
               >
                 <div className="p-6">
                   <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          post.type === 'job' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        }`}>
                          {post.type === 'job' ? <><FiBriefcase className="inline mr-1"/> Job</> : <><FiAward className="inline mr-1"/> Opportunity</>}
                        </span>
                        <span className="text-gray-400 text-sm ml-2">{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                   </div>

                   <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{post.title}</h3>
                   <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{post.description}</p>
                   
                   {/* Engagement Stats */}
                   <div className="flex items-center gap-6 border-t border-gray-100 dark:border-gray-700 pt-4 mt-4">
                     <button 
                       onClick={() => handleAction(post, 'like')}
                       className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                         post.liked_by_user ? 'text-pink-500' : 'text-gray-500 hover:text-pink-500'
                       }`}
                     >
                       <FiHeart className={post.liked_by_user ? 'fill-current' : ''} /> {post.likes}
                     </button>
                     
                     <button 
                       onClick={() => toggleComments(post)}
                       className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-500 transition-colors"
                     >
                       <FiMessageSquare /> {post.comments}
                     </button>

                     <button 
                       onClick={() => handleAction(post, 'repost')}
                       className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-green-500 transition-colors"
                     >
                       <FiRepeat /> {post.reposts}
                     </button>

                     <button 
                       onClick={() => handleAction(post, 'share')}
                       className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-brand transition-colors"
                     >
                       <FiShare2 /> {post.shares}
                     </button>
                   </div>

                   {/* Comments Section */}
                   <AnimatePresence>
                     {commenting === post.id && (
                       <motion.div 
                         initial={{ height: 0, opacity: 0 }}
                         animate={{ height: 'auto', opacity: 1 }}
                         exit={{ height: 0, opacity: 0 }}
                         className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700"
                       >
                         <div className="flex gap-2 mb-4">
                           <input 
                             type="text" 
                             value={commentText}
                             onChange={(e) => setCommentText(e.target.value)}
                             placeholder="Write a comment..."
                             className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-brand"
                             onKeyPress={(e) => e.key === 'Enter' && submitComment(post)}
                           />
                           <button 
                             onClick={() => submitComment(post)}
                             disabled={!commentText.trim()}
                             className="p-2 bg-brand text-white rounded-full disabled:opacity-50 hover:bg-brand-dark transition-colors"
                           >
                             <FiSend size={16} />
                           </button>
                         </div>

                         {loadingComments ? (
                            <div className="text-center text-sm text-gray-500">Loading comments...</div>
                         ) : (
                            <div className="space-y-3 max-h-60 overflow-y-auto">
                              {comments[`${post.type}-${post.id}`]?.map((comment, idx) => (
                                <div key={idx} className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl">
                                  <div className="flex justify-between items-start mb-1">
                                    <span className="font-semibold text-sm text-gray-900 dark:text-white">{comment.user}</span>
                                    <span className="text-xs text-gray-400">{new Date(comment.created_at).toLocaleDateString()}</span>
                                  </div>
                                  <p className="text-sm text-gray-700 dark:text-gray-300">{comment.text}</p>
                                </div>
                              ))}
                            </div>
                         )}
                       </motion.div>
                     )}
                   </AnimatePresence>
                 </div>
               </motion.div>
             ))
          )}
        </div>
      </div>
    </div>
  )
}