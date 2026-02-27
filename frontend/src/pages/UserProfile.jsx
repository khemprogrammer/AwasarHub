import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiUser, FiMapPin, FiCalendar, FiHeart, FiMessageSquare, FiRepeat, FiShare2, FiSend, FiBriefcase, FiAward, FiX, FiEdit3 } from 'react-icons/fi'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

const AvatarCropModal = ({ src, onClose, onCropped }) => {
    const container = 300
    const minScale = 1
    const maxScale = 3
    const [scale, setScale] = useState(1)
    const [imgEl, setImgEl] = useState(null)
    const [dims, setDims] = useState({ w: 0, h: 0 })
    const [pos, setPos] = useState({ x: 0, y: 0 })
    const dragRef = useRef({ dragging: false, x: 0, y: 0 })
    const pinchRef = useRef({ active: false, startDist: 0, startScale: 1 })
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
    const dist = (t1, t2) => Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY)

    const onImgLoad = (e) => {
        const iw = e.target.naturalWidth
        const ih = e.target.naturalHeight
        setDims({ w: iw, h: ih })
        const base = Math.max(container / iw, container / ih)
        const dw = iw * base * 1
        const dh = ih * base * 1
        setPos({ x: (container - dw) / 2, y: (container - dh) / 2 })
    }

    const onMouseDown = (e) => {
        dragRef.current = { dragging: true, x: e.clientX - pos.x, y: e.clientY - pos.y }
        window.addEventListener('mouseup', onMouseUp)
        window.addEventListener('mousemove', onMouseMove)
    }
    const onMouseUp = () => {
        dragRef.current.dragging = false
        window.removeEventListener('mouseup', onMouseUp)
        window.removeEventListener('mousemove', onMouseMove)
    }
    const onMouseMove = (e) => {
        if (!dragRef.current.dragging) return
        setPos({ x: e.clientX - dragRef.current.x, y: e.clientY - dragRef.current.y })
    }

    const onTouchStart = (e) => {
        if (e.touches.length === 1) {
            const t = e.touches[0]
            dragRef.current = { dragging: true, x: t.clientX - pos.x, y: t.clientY - pos.y }
        } else if (e.touches.length === 2) {
            pinchRef.current = { active: true, startDist: dist(e.touches[0], e.touches[1]), startScale: scale }
        }
    }
    const onTouchMove = (e) => {
        if (pinchRef.current.active && e.touches.length === 2) {
            const d = dist(e.touches[0], e.touches[1])
            const ratio = d / (pinchRef.current.startDist || d)
            setScale(clamp(pinchRef.current.startScale * ratio, minScale, maxScale))
            e.preventDefault()
            return
        }
        if (dragRef.current.dragging && e.touches.length === 1) {
            const t = e.touches[0]
            setPos({ x: t.clientX - dragRef.current.x, y: t.clientY - dragRef.current.y })
            e.preventDefault()
        }
    }
    const onTouchEnd = () => {
        dragRef.current.dragging = false
        pinchRef.current.active = false
    }

    const doCrop = async () => {
        if (!imgEl || !dims.w) return
        const base = Math.max(container / dims.w, container / dims.h)
        const dw = dims.w * base * scale
        const dh = dims.h * base * scale
        const canvas = document.createElement('canvas')
        canvas.width = 512
        canvas.height = 512
        const ctx = canvas.getContext('2d')
        const r = 512 / container
        ctx.scale(r, r)
        ctx.drawImage(imgEl, pos.x, pos.y, dw, dh)
        canvas.toBlob((blob) => {
            if (!blob) return
            const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })
            onCropped(file)
        }, 'image/jpeg', 0.9)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-zinc-800">
                <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Adjust Avatar</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"><FiX /></button>
                </div>
                <div className="p-5 space-y-4">
                    <div
                      style={{ width: container, height: container }}
                      className="mx-auto rounded-xl overflow-hidden bg-slate-200 dark:bg-zinc-800 relative cursor-grab touch-none"
                      onMouseDown={onMouseDown}
                      onTouchStart={onTouchStart}
                      onTouchMove={onTouchMove}
                      onTouchEnd={onTouchEnd}
                    >
                        <img
                          ref={setImgEl}
                          src={src}
                          onLoad={onImgLoad}
                          alt=""
                          style={{
                            width: dims.w ? 'auto' : '100%',
                            height: dims.w ? 'auto' : '100%',
                            position: 'absolute',
                            left: pos.x,
                            top: pos.y,
                            transform: `scale(${(Math.max(container / dims.w, container / dims.h) || 1) * scale})`,
                            transformOrigin: 'top left'
                          }}
                          draggable={false}
                        />
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{ background: `radial-gradient(circle at 50% 50%, transparent ${container/2 - 1}px, rgba(0,0,0,0.55) ${container/2}px)` }}
                        />
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full ring-2 ring-white/70 pointer-events-none"></div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500">Zoom</span>
                        <input type="range" min={minScale} max={maxScale} step="0.01" value={scale} onChange={(e) => setScale(parseFloat(e.target.value))} className="flex-1" />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 dark:border-zinc-700">Cancel</button>
                        <button onClick={doCrop} className="px-4 py-2 rounded-lg bg-brand text-white">Save</button>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

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
                className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 dark:border-zinc-800"
            >
                <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Edit Profile</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <FiX size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">First Name</label>
                            <input 
                                type="text" 
                                value={formData.first_name}
                                onChange={e => setFormData({...formData, first_name: e.target.value})}
                                className="w-full rounded-lg border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Last Name</label>
                            <input 
                                type="text" 
                                value={formData.last_name}
                                onChange={e => setFormData({...formData, last_name: e.target.value})}
                                className="w-full rounded-lg border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Headline</label>
                        <input 
                            type="text" 
                            value={formData.headline}
                            onChange={e => setFormData({...formData, headline: e.target.value})}
                            placeholder="Software Engineer | AI Enthusiast"
                            className="w-full rounded-lg border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">City</label>
                            <input 
                                type="text" 
                                value={formData.city}
                                onChange={e => setFormData({...formData, city: e.target.value})}
                                className="w-full rounded-lg border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Country</label>
                            <input 
                                type="text" 
                                value={formData.country}
                                onChange={e => setFormData({...formData, country: e.target.value})}
                                className="w-full rounded-lg border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Bio</label>
                        <textarea 
                            value={formData.bio}
                            onChange={e => setFormData({...formData, bio: e.target.value})}
                            rows={3}
                            className="w-full rounded-lg border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand"
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
            className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[80vh] border border-slate-200 dark:border-zinc-800"
        >
            <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center">
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
  const { user, refreshUser } = useAuth()
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
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef(null)
  const [cropSrc, setCropSrc] = useState(null)

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

  const triggerAvatarPicker = () => {
      if (fileInputRef.current) fileInputRef.current.click()
  }

  const onAvatarSelected = async (e) => {
      const f = e.target.files && e.target.files[0]
      if (!f) return
      const reader = new FileReader()
      reader.onload = () => setCropSrc(reader.result)
      reader.readAsDataURL(f)
  }

  const handleProfileUpdate = (updatedUser) => {
      if (refreshUser) {
          refreshUser()
      } else {
          window.location.reload()
      }
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
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-black transition-colors duration-300">
      <AnimatePresence>
          {cropSrc && (
              <AvatarCropModal 
                src={cropSrc}
                onClose={() => setCropSrc(null)}
                onCropped={async (file) => {
                    const form = new FormData()
                    form.append('avatar', file)
                    setUploadingAvatar(true)
                    try {
                        await api.post('/api/auth/avatar/upload/', form, { headers: { 'Content-Type': 'multipart/form-data' } })
                        setCropSrc(null)
                        if (refreshUser) await refreshUser()
                    } finally {
                        setUploadingAvatar(false)
                    }
                }}
              />
          )}
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
            <div className="relative mt-12 flex flex-col md:flex-row items-start gap-6">
                <div className="w-32 h-32 rounded-full border-4 border-white dark:border-zinc-900 bg-white dark:bg-zinc-800 flex items-center justify-center text-6xl text-brand shadow-xl overflow-hidden shrink-0">
                     {user?.avatar ? (
                        <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                        user?.username?.[0]?.toUpperCase()
                    )}
                </div>
                <div className="flex-1 mb-2 md:mt-16 text-left">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{user?.first_name} {user?.last_name || user?.username}</h1>
                    {user?.headline ? (
                        <p className="text-slate-600 dark:text-slate-400 font-medium">{user.headline}</p>
                    ) : (
                        <p className="text-slate-500 dark:text-slate-500 italic">No headline added</p>
                    )}
                    
                    <div className="flex flex-wrap justify-start gap-4 mt-4 text-sm text-slate-500 dark:text-slate-400">
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

                    <div className="flex justify-start gap-6 mt-6">
                        <button 
                            onClick={() => setShowFollowers(true)}
                            className="text-center group hover:bg-slate-100 dark:hover:bg-zinc-800 p-2 rounded-lg transition-colors cursor-pointer"
                        >
                            <span className="block text-xl font-bold text-slate-900 dark:text-white group-hover:text-brand transition-colors">{connections.followers.length}</span>
                            <span className="text-xs text-slate-500 uppercase tracking-wide">Followers</span>
                        </button>
                        <button 
                            onClick={() => setShowFollowing(true)}
                            className="text-center group hover:bg-slate-100 dark:hover:bg-zinc-800 p-2 rounded-lg transition-colors cursor-pointer"
                        >
                            <span className="block text-xl font-bold text-slate-900 dark:text-white group-hover:text-brand transition-colors">{connections.following.length}</span>
                            <span className="text-xs text-slate-500 uppercase tracking-wide">Following</span>
                        </button>
                    </div>
                </div>
                <div className="flex flex-col gap-2 md:mt-16 self-start mt-4 md:mt-16">
                    <button 
                        onClick={() => setShowEditProfile(true)}
                        className="btn-primary py-2 px-6 text-sm flex items-center gap-2"
                    >
                        <FiEdit3 /> Edit Profile
                    </button>
                    <button 
                        onClick={() => { if (fileInputRef) { fileInputRef.current?.click() } }}
                        disabled={uploadingAvatar}
                        className="px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                    >
                        {uploadingAvatar ? 'Uploading...' : 'Change Avatar'}
                    </button>
                    <input ref={fileInputRef} onChange={onAvatarSelected} type="file" accept="image/*" className="hidden" />
                </div>
            </div>
        </div>

        {/* Posts Section */}
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white px-2">Your Activity</h2>
            
            {posts.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-black rounded-2xl border border-slate-200 dark:border-zinc-800">
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
                            className="glass rounded-2xl overflow-hidden hover:shadow-2xl hover:border-slate-300 dark:hover:border-white/20 transition-all duration-200 hover:translate-y-[1px] group"
                        >
                            <div className="p-5">
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
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ring-1 ring-inset ${post.type === 'job' ? 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-gradient-to-r dark:from-blue-900/50 dark:to-blue-700/40 dark:text-blue-200 dark:ring-blue-400/20' : 'bg-purple-50 text-purple-700 ring-purple-200 dark:bg-gradient-to-r dark:from-purple-900/50 dark:to-purple-700/40 dark:text-purple-200 dark:ring-purple-400/20'}`}>
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
                                <div className="mt-6 flex items-center justify-between border-t border-slate-100 dark:border-zinc-800 pt-4 px-4 py-3 -mx-6 mb-[-1.5rem] bg-white/80 dark:bg-black/70 backdrop-blur-sm rounded-b-2xl">
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
                                            className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800 bg-white/80 dark:bg-black/70 backdrop-blur-sm px-5 pb-5 -mx-6 mb-[-1.5rem]"
                                        >
                                            {/* Comment List */}
                                            <div className="mb-4 space-y-3 max-h-60 overflow-y-auto">
                                                {loadingComments ? (
                                                    <div className="text-center text-sm text-slate-500">Loading comments...</div>
                                                ) : comments[`${post.type}-${post.id}`]?.length > 0 ? (
                                                    comments[`${post.type}-${post.id}`].map(comment => (
                                                        <div key={comment.id} className="bg-white dark:bg-zinc-900 p-3 rounded-lg text-sm border border-slate-100 dark:border-zinc-800">
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
                                                    className="flex-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
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
