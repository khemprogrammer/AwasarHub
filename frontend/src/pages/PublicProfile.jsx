import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiUser, FiMapPin, FiCalendar, FiHeart, FiMessageSquare, FiRepeat, FiShare2, FiSend, FiBriefcase, FiAward, FiUserPlus, FiUserCheck, FiX } from 'react-icons/fi'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import PostDropdown from '../components/PostDropdown'

export default function PublicProfile() {
  const { username } = useParams()
  const { user: currentUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [followers, setFollowers] = useState([])
  const [following, setFollowing] = useState([])
  const [showFollowers, setShowFollowers] = useState(false)
  const [showFollowing, setShowFollowing] = useState(false)
  const [loadingFollowers, setLoadingFollowers] = useState(false)
  const [loadingFollowing, setLoadingFollowing] = useState(false)
  const [myFollowing, setMyFollowing] = useState(new Set())
  const [pendingUser, setPendingUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [commenting, setCommenting] = useState(null)
  const [commentText, setCommentText] = useState('')
  const [comments, setComments] = useState({})
  const [loadingComments, setLoadingComments] = useState(false)

  useEffect(() => {
    fetchProfile()
    fetchPosts()
    setFollowers([])
    setFollowing([])
    setShowFollowers(false)
    setShowFollowing(false)
    fetchMyFollowing()
  }, [username])

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/api/auth/profile/${username}/`)
      setProfile(res.data)
    } catch (error) {
      console.error("Failed to fetch profile", error)
    }
  }

  const fetchConnections = async () => {
    try {
      const res = await api.get(`/api/auth/profile/${username}/connections/`)
      setFollowers(res.data.followers || [])
      setFollowing(res.data.following || [])
    } catch (e) {
      console.error("Failed to fetch connections", e)
    }
  }

  const fetchMyFollowing = async () => {
    try {
      const res = await api.get('/api/auth/connections/')
      const names = new Set((res.data.following || []).map(u => u.username))
      setMyFollowing(names)
    } catch (e) {
      // Non-blocking
      console.error('Failed to fetch my following', e)
    }
  }

  const getAvatarUrl = (u) => {
    if (u?.avatar) return u.avatar
    const name = `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username || 'User'
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
  }

  const toggleFollowUser = async (u) => {
    if (!u?.username || u.username === currentUser?.username) return
    const isFollowing = myFollowing.has(u.username)
    setPendingUser(u.username)
    try {
      if (isFollowing) {
        await api.delete(`/api/auth/follow/${u.username}/`)
        const next = new Set(myFollowing)
        next.delete(u.username)
        setMyFollowing(next)
      } else {
        await api.post(`/api/auth/follow/${u.username}/`)
        const next = new Set(myFollowing)
        next.add(u.username)
        setMyFollowing(next)
      }
    } catch (e) {
      console.error('Failed to toggle follow', e)
    } finally {
      setPendingUser(null)
    }
  }

  const openFollowers = async () => {
    setShowFollowers(true)
    if (followers.length === 0) {
      setLoadingFollowers(true)
      await fetchConnections()
      setLoadingFollowers(false)
    }
  }

  const openFollowing = async () => {
    setShowFollowing(true)
    if (following.length === 0) {
      setLoadingFollowing(true)
      await fetchConnections()
      setLoadingFollowing(false)
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

  const handlePostDeleted = (postId, type) => {
    setPosts(posts.filter(p => !(p.id === postId && p.type === type)))
  }

  const handlePostUpdated = (updatedData) => {
    setPosts(posts.map(p => {
      if (p.id === updatedData.id && p.type === (updatedData.type || p.type)) {
        return { ...p, ...updatedData }
      }
      return p
    }))
  }

  if (!profile) return <div className="min-h-screen pt-24 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-4 border-brand border-t-transparent"></div></div>

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-black rounded-2xl shadow-xl overflow-hidden mb-8 border border-slate-200 dark:border-zinc-800"
        >
          <div className="h-32 bg-gradient-to-r from-brand to-brand-dark"></div>
          <div className="px-8 pb-8">
            <div className="relative flex justify-between items-end -mt-12 mb-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-white dark:bg-black p-1 shadow-lg">
                  <div className="w-full h-full rounded-full bg-slate-200 dark:bg-zinc-800 flex items-center justify-center text-3xl font-bold text-slate-400">
                    {profile.username?.[0]?.toUpperCase()}
                  </div>
                </div>
              </div>
              {currentUser && currentUser.username !== profile.username && (
                <button
                  onClick={handleFollow}
                  className={`px-6 py-2 rounded-full font-medium transition-colors flex items-center gap-2 ${profile.is_following
                      ? 'bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-zinc-800 dark:text-slate-200'
                      : 'bg-brand text-white hover:bg-brand-dark'
                    }`}
                >
                  {profile.is_following ? <><FiUserCheck /> Following</> : <><FiUserPlus /> Follow</>}
                </button>
              )}
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{profile.first_name} {profile.last_name}</h1>
              <p className="text-brand font-medium mb-4">@{profile.username}</p>

              <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-300 mb-6">
                {profile.city && (
                  <div className="flex items-center gap-1">
                    <FiMapPin /> {profile.city}, {profile.country}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <FiCalendar /> Joined {new Date(profile.date_joined).toLocaleDateString()}
                </div>
              </div>

              <div className="flex gap-6 border-t border-slate-100 dark:border-zinc-800 pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{posts.length}</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{profile.followers_count}</div>
                  <button type="button" onClick={openFollowers} className="text-xs text-slate-500 uppercase tracking-wide hover:text-slate-700 dark:hover:text-slate-300 transition-colors underline decoration-dotted cursor-pointer">
                    Followers
                  </button>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{profile.following_count}</div>
                  <button type="button" onClick={openFollowing} className="text-xs text-slate-500 uppercase tracking-wide hover:text-slate-700 dark:hover:text-slate-300 transition-colors underline decoration-dotted cursor-pointer">
                    Following
                  </button>
                </div>
              </div>

              {/* Followers Modal */}
              {showFollowers && (
                <div className="fixed inset-0 z-40 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/50" onClick={() => setShowFollowers(false)}></div>
                  <div className="relative z-50 w-full max-w-md glass rounded-2xl p-5 bg-white/90 dark:bg-black/70">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white">Followers</h3>
                      <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800" onClick={() => setShowFollowers(false)}><FiX /></button>
                    </div>
                    {loadingFollowers ? (
                      <div className="py-6 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-brand border-t-transparent"></div>
                      </div>
                    ) : followers.length === 0 ? (
                      <div className="text-sm text-slate-500">No followers yet</div>
                    ) : (
                      <ul className="space-y-2 max-h-72 overflow-y-auto">
                        {followers.map(u => (
                          <li key={u.id}>
                            <div className="flex items-center gap-3 rounded-lg px-2 py-1 hover:bg-slate-100 dark:hover:bg-zinc-800 pipeline-colors">
                              <Link to={`/profile/${u.username}`} onClick={() => setShowFollowers(false)} className="flex items-center gap-3 flex-1 min-w-0">
                                <img alt="" src={getAvatarUrl(u)} className="w-8 h-8 rounded-full object-cover border border-white/20" />
                                <div className="text-sm truncate">
                                  <div className="font-medium text-slate-900 dark:text-white truncate">{u.first_name || u.username}</div>
                                  <div className="text-xs text-slate-500">@{u.username}</div>
                                </div>
                              </Link>
                              {currentUser?.username !== u.username && (
                                <button
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFollowUser(u) }}
                                  disabled={pendingUser === u.username}
                                  className={`px-2 py-1 text-xs rounded-full border transition-colors ${myFollowing.has(u.username)
                                      ? 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-zinc-700'
                                      : 'bg-brand text-white border-brand hover:bg-brand-dark'
                                    }`}
                                  title={myFollowing.has(u.username) ? 'Unfollow' : 'Follow'}
                                >
                                  {pendingUser === u.username ? '...' : myFollowing.has(u.username) ? 'Following' : 'Follow'}
                                </button>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {/* Following Modal */}
              {showFollowing && (
                <div className="fixed inset-0 z-40 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/50" onClick={() => setShowFollowing(false)}></div>
                  <div className="relative z-50 w-full max-w-md glass rounded-2xl p-5 bg-white/90 dark:bg-black/70">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white">Following</h3>
                      <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800" onClick={() => setShowFollowing(false)}><FiX /></button>
                    </div>
                    {loadingFollowing ? (
                      <div className="py-6 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-brand border-t-transparent"></div>
                      </div>
                    ) : following.length === 0 ? (
                      <div className="text-sm text-slate-500">Not following anyone</div>
                    ) : (
                      <ul className="space-y-2 max-h-72 overflow-y-auto">
                        {following.map(u => (
                          <li key={u.id}>
                            <div className="flex items-center gap-3 rounded-lg px-2 py-1 hover:bg-slate-100 dark:hover:bg-zinc-800">
                              <Link to={`/profile/${u.username}`} onClick={() => setShowFollowing(false)} className="flex items-center gap-3 flex-1 min-w-0">
                                <img alt="" src={getAvatarUrl(u)} className="w-8 h-8 rounded-full object-cover border border-white/20" />
                                <div className="text-sm truncate">
                                  <div className="font-medium text-slate-900 dark:text-white truncate">{u.first_name || u.username}</div>
                                  <div className="text-xs text-slate-500">@{u.username}</div>
                                </div>
                              </Link>
                              {currentUser?.username !== u.username && (
                                <button
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFollowUser(u) }}
                                  disabled={pendingUser === u.username}
                                  className={`px-2 py-1 text-xs rounded-full border transition-colors ${myFollowing.has(u.username)
                                      ? 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-zinc-700'
                                      : 'bg-brand text-white border-brand hover:bg-brand-dark'
                                    }`}
                                  title={myFollowing.has(u.username) ? 'Unfollow' : 'Follow'}
                                >
                                  {pendingUser === u.username ? '...' : myFollowing.has(u.username) ? 'Following' : 'Follow'}
                                </button>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Posts Grid */}
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white px-2">Posts</h2>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-brand border-t-transparent"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-black rounded-xl shadow border border-slate-200 dark:border-zinc-800">
              <p className="text-slate-500">No posts yet.</p>
            </div>
          ) : (
            posts.map(post => (
              <motion.div
                key={`${post.type}-${post.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl overflow-hidden hover:shadow-2xl hover:border-slate-300 dark:hover:border-white/20 transition-all duration-200 hover:translate-y-[1px] group"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-lg border border-brand/20">
                        {profile?.username?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">{profile?.first_name} {profile?.last_name || profile?.username}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(post.created_at).toLocaleDateString()} • {post.type === 'job' ? 'Job Posting' : 'Opportunity'}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ring-1 ring-inset ${post.type === 'job'
                        ? 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-gradient-to-r dark:from-blue-900/50 dark:to-blue-700/40 dark:text-blue-200 dark:ring-blue-400/20'
                        : 'bg-purple-50 text-purple-700 ring-purple-200 dark:bg-gradient-to-r dark:from-purple-900/50 dark:to-purple-700/40 dark:text-purple-200 dark:ring-purple-400/20'
                      }`}>
                      {post.type === 'job' ? <><FiBriefcase className="inline mr-1" /> Job</> : <><FiAward className="inline mr-1" /> Opportunity</>}
                    </span>
                    <PostDropdown
                      post={post}
                      isOwner={currentUser?.username === profile?.username}
                      onPostDeleted={handlePostDeleted}
                      onPostUpdated={handlePostUpdated}
                    />
                  </div>

                  <div className="mt-2">
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{post.title}</h4>
                    <p className="text-slate-700 dark:text-slate-300 mb-2 leading-relaxed whitespace-pre-line">{post.description}</p>
                    {post.company && <p className="mt-3 text-sm font-semibold text-brand">@ {post.company}</p>}
                    {post.org && <p className="mt-3 text-sm font-semibold text-brand">@ {post.org}</p>}
                    {post.city && (
                      <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                        <FiMapPin size={14} /> {post.city}
                      </p>
                    )}
                  </div>

                  {/* Engagement Stats */}
                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-zinc-800 pt-4 px-6 py-3 -mx-6 mb-[-1.5rem] mt-6 bg-white/80 dark:bg-black/70 backdrop-blur-sm rounded-b-2xl">
                    <button
                      onClick={() => handleAction(post, 'like')}
                      className={`flex items-center gap-2 text-sm font-medium transition-colors ${post.liked_by_user ? 'text-pink-500' : 'text-slate-500 hover:text-pink-500'
                        }`}
                    >
                      <FiHeart className={post.liked_by_user ? 'fill-current' : ''} size={18} /> {post.likes}
                    </button>

                    <button
                      onClick={() => toggleComments(post)}
                      className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-500 transition-colors"
                    >
                      <FiMessageSquare size={18} /> {post.comments}
                    </button>

                    <button
                      onClick={() => handleAction(post, 'repost')}
                      className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-green-500 transition-colors"
                    >
                      <FiRepeat size={18} /> {post.reposts}
                    </button>

                    <button
                      onClick={() => handleAction(post, 'share')}
                      className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-brand transition-colors"
                    >
                      <FiShare2 size={18} /> {post.shares}
                    </button>
                  </div>

                  {/* Comments Section */}
                  <AnimatePresence>
                    {commenting === post.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800 bg-white/80 dark:bg-black/70 backdrop-blur-sm px-6 pb-6 -mx-6 mb-[-1.5rem]"
                      >
                        <div className="flex gap-2 mb-6">
                          <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Write a comment..."
                            className="flex-1 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand text-slate-900 dark:text-white"
                            onKeyPress={(e) => e.key === 'Enter' && submitComment(post)}
                          />
                          <button
                            onClick={() => submitComment(post)}
                            disabled={!commentText.trim()}
                            className="p-2 w-10 h-10 flex items-center justify-center bg-brand text-white rounded-full disabled:opacity-50 hover:bg-brand-dark transition-colors"
                          >
                            <FiSend size={16} className="ml-1" />
                          </button>
                        </div>

                        {loadingComments ? (
                          <div className="text-center text-sm text-slate-500 py-4">Loading comments...</div>
                        ) : comments[`${post.type}-${post.id}`]?.length > 0 ? (
                          <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                            {comments[`${post.type}-${post.id}`].map((comment, idx) => (
                              <div key={idx} className="bg-slate-50 dark:bg-zinc-900 p-4 rounded-xl border border-slate-100 dark:border-zinc-800">
                                <div className="flex justify-between items-start mb-2">
                                  <span className="font-semibold text-sm text-slate-900 dark:text-white">{comment.user}</span>
                                  <span className="text-xs text-slate-400 font-medium">{new Date(comment.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{comment.text}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center text-sm text-slate-500 py-4">No comments yet. Be the first to say something!</div>
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
