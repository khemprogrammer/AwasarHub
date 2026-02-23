import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { formatDistanceToNow } from 'date-fns'
import { 
  FiMoreHorizontal, FiHeart, FiMessageSquare, FiShare2, FiBookmark, 
  FiBriefcase, FiZap, FiMapPin, FiDollarSign, FiCalendar, FiExternalLink, 
  FiSearch, FiFilter, FiUser, FiActivity, FiTrendingUp, FiVideo, FiClock 
} from 'react-icons/fi'

export default function Feed() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [briefing, setBriefing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [activeTab, setActiveTab] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('recent')
  const loaderRef = useRef(null)

  const fetchFeed = async () => {
    try {
      const res = await api.get('/api/feed/global_feed/')
      setItems(res.data.items) 
    } catch (err) {
      console.error("Failed to fetch feed", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    api.get('/api/briefing/daily/').then(res => setBriefing(res.data)).catch(() => {})
    fetchFeed()
  }, [])

  // Infinite scroll observer placeholder
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loading) {
        setPage(p => p + 1)
        // fetchMore() // Implement fetch more logic here
      }
    }, { threshold: 1 })
    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [loading])

  const getAvatarUrl = (u) => {
    if (u?.avatar) return u.avatar
    const name = u?.first_name ? `${u.first_name} ${u.last_name}` : (u?.username || 'User')
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`
  }

  const getDisplayName = (u) => {
    if (!u) return 'Unknown User'
    if (u.first_name && u.last_name) return `${u.first_name} ${u.last_name}`
    return u.username || 'Unknown User'
  }

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'Just now'
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch (e) {
      return 'Just now'
    }
  }

  const getApplyLink = (item) => {
    const url = item.link_url || item.application_url
    if (!url) return null
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    return `https://${url}`
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-6 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left Sidebar - User Profile & Navigation */}
          <div className="hidden md:block md:col-span-3 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden sticky top-24">
              <div className="h-24 bg-gradient-to-r from-brand-light to-brand-dark"></div>
              <div className="px-6 pb-6 text-center relative">
                <div className="w-20 h-20 mx-auto -mt-10 rounded-full bg-white dark:bg-slate-900 p-1">
                  <div className="w-full h-full rounded-full bg-brand/10 flex items-center justify-center text-2xl font-bold text-brand overflow-hidden">
                    <img src={getAvatarUrl(user)} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                </div>
                <h2 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">
                  {getDisplayName(user)}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  {user?.headline || 'Software Engineer | AI Enthusiast'}
                </p>
                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-around text-center">
                  <div>
                    <span className="block text-lg font-bold text-slate-900 dark:text-white">245</span>
                    <span className="text-xs text-slate-500">Connections</span>
                  </div>
                  <div>
                    <span className="block text-lg font-bold text-slate-900 dark:text-white">82</span>
                    <span className="text-xs text-slate-500">Views</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 sticky top-[26rem]">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Explore</h3>
              <nav className="space-y-2">
                <Link to="/feed" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-brand bg-brand/5 rounded-lg">
                  <FiActivity /> My Feed
                </Link>
                <Link to="/jobs" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <FiBriefcase /> Jobs
                </Link>
                <Link to="/opportunities" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <FiZap /> Opportunities
                </Link>
                <Link to="/saved" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <FiBookmark /> Saved Items
                </Link>
              </nav>
            </div>
          </div>

          {/* Center - Main Feed */}
          <div className="md:col-span-9 lg:col-span-6 space-y-6">
            
            {/* Mobile Header (Briefing Summary) */}
            <div className="md:hidden bg-gradient-to-r from-brand to-brand-dark rounded-xl p-4 text-white shadow-lg mb-6">
               <h1 className="font-bold text-lg mb-1">Your Daily Briefing</h1>
               <p className="text-sm opacity-90 line-clamp-2">{briefing?.script_text || 'Loading your personalized insights...'}</p>
            </div>

            {/* Create Post Placeholder */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 flex gap-4 items-center">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex-shrink-0 overflow-hidden">
                <img src={getAvatarUrl(user)} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <Link to="/jobs/new" className="flex-grow bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 px-4 py-2.5 rounded-full text-sm font-medium transition-colors text-left border border-slate-200 dark:border-slate-700">
                Start a post, share an opportunity...
              </Link>
            </div>

            {/* Feed Filters */}
            <div className="flex flex-col gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
               <div className="flex items-center justify-between">
                 <div className="flex gap-4">
                   <button 
                     onClick={() => setActiveTab('all')}
                     className={`text-sm font-semibold transition-colors ${activeTab === 'all' ? 'text-slate-900 dark:text-white border-b-2 border-brand pb-2 -mb-2.5' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                   >
                     All Updates
                   </button>
                   <button 
                     onClick={() => setActiveTab('job')}
                     className={`text-sm font-medium transition-colors ${activeTab === 'job' ? 'text-slate-900 dark:text-white border-b-2 border-brand pb-2 -mb-2.5' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                   >
                     Jobs
                   </button>
                   <button 
                     onClick={() => setActiveTab('opportunity')}
                     className={`text-sm font-medium transition-colors ${activeTab === 'opportunity' ? 'text-slate-900 dark:text-white border-b-2 border-brand pb-2 -mb-2.5' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                   >
                     Opportunities
                   </button>
                 </div>
                 <button 
                   onClick={() => setShowFilters(!showFilters)}
                   className={`p-2 rounded-full transition-colors ${showFilters ? 'bg-slate-100 dark:bg-slate-800 text-brand' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                 >
                   <FiFilter />
                 </button>
               </div>

               {/* Expandable Filter Panel */}
                {showFilters && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                      <span className="font-medium">Sort by:</span>
                      <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-transparent border-none focus:ring-0 cursor-pointer font-medium text-slate-900 dark:text-white"
                      >
                        <option value="recent">Most Recent</option>
                        <option value="popular">Popular</option>
                      </select>
                    </div>
                  </div>
                )}
             </div>

            {/* Feed Items */}
            <div className="space-y-6">
              {loading && (
                [1, 2, 3].map(i => (
                  <div key={i} className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm animate-pulse space-y-4">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
                        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
                      </div>
                    </div>
                    <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded"></div>
                  </div>
                ))
              )}

              {!loading && items.filter(item => activeTab === 'all' || item.type === activeTab).length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                    <FiBriefcase className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {activeTab === 'all' ? 'No posts yet' : `No ${activeTab === 'opportunity' ? 'opportunities' : activeTab + 's'} yet`}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
                    Be the first to share an opportunity or job with the community!
                  </p>
                  <Link to="/jobs/new" className="px-4 py-2 bg-brand text-white font-medium rounded-lg hover:bg-brand-dark transition-colors">
                    Create Post
                  </Link>
                </div>
              )}

              {items
                .filter(item => activeTab === 'all' || item.type === activeTab)
                .sort((a, b) => {
                  if (sortBy === 'popular') {
                    // Sort by combined engagement (likes + comments)
                    const engagementA = (a.likes || 0) + (a.comments || 0)
                    const engagementB = (b.likes || 0) + (b.comments || 0)
                    return engagementB - engagementA
                  }
                  // Default to most recent
                  return new Date(b.created_at) - new Date(a.created_at)
                })
                .map((item, idx) => (
                <div 
                  key={idx}
                  className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-5">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-3">
                        <Link to={`/profile/${item.posted_by_details?.username}`} className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
                           <img src={getAvatarUrl(item.posted_by_details)} alt="" className="w-full h-full object-cover" />
                        </Link>
                        <div>
                          <Link to={`/profile/${item.posted_by_details?.username}`} className="font-bold text-slate-900 dark:text-white hover:underline text-base block">
                            {getDisplayName(item.posted_by_details)}
                          </Link>
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <span>{item.company || item.org || item.organization || 'Independent'}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <FiClock className="w-3 h-3" />
                              {formatDate(item.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                         <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                            item.type === 'job' 
                              ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300'
                              : item.type === 'opportunity'
                              ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {(item.type || 'Update').toUpperCase()}
                          </span>
                          <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                            <FiMoreHorizontal />
                          </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                        {item.title}
                      </h3>
                      
                      <div className="flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-300">
                        {(item.city || item.location) && (
                          <span className="flex items-center gap-1"><FiMapPin className="text-slate-400" /> {item.city || item.location}</span>
                        )}
                        {item.salary_range && (
                          <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium"><FiDollarSign /> {item.salary_range}</span>
                        )}
                        {item.deadline && (
                          <span className="flex items-center gap-1 text-red-500 dark:text-red-400"><FiCalendar /> Deadline: {new Date(item.deadline).toLocaleDateString()}</span>
                        )}
                      </div>

                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                        {item.description?.length > 250 ? item.description.substring(0, 250) + '...' : item.description}
                      </p>

                      {item.tags && Array.isArray(item.tags) && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {item.tags.map((tag, i) => (
                            <span key={i} className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 px-2 py-1 rounded-md">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Media / Video */}
                  {item.video_url && (
                    <div className="w-full bg-black aspect-video relative group">
                      <video src={item.video_url} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" controls />
                    </div>
                  )}

                  {/* Footer Actions */}
                  <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex gap-6">
                      <button className="flex items-center gap-2 text-slate-500 hover:text-red-500 transition-colors text-sm font-medium group">
                        <div className="p-1.5 rounded-full group-hover:bg-red-50 dark:group-hover:bg-red-900/20"><FiHeart className="w-5 h-5" /></div>
                        <span>{item.likes || 0}</span>
                      </button>
                      <button className="flex items-center gap-2 text-slate-500 hover:text-blue-500 transition-colors text-sm font-medium group">
                        <div className="p-1.5 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20"><FiMessageSquare className="w-5 h-5" /></div>
                        <span>{item.comments || 0}</span>
                      </button>
                      <button className="flex items-center gap-2 text-slate-500 hover:text-green-500 transition-colors text-sm font-medium group">
                        <div className="p-1.5 rounded-full group-hover:bg-green-50 dark:group-hover:bg-green-900/20"><FiShare2 className="w-5 h-5" /></div>
                        <span>Share</span>
                      </button>
                    </div>
                    
                    {getApplyLink(item) ? (
                      <a 
                        href={getApplyLink(item)} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-dark transition-colors shadow-sm hover:shadow-md"
                      >
                        Apply Now <FiExternalLink />
                      </a>
                    ) : (
                      <button disabled className="inline-flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-400 text-sm font-medium rounded-lg cursor-not-allowed">
                        No Link Available
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              <div ref={loaderRef} className="py-8 flex justify-center">
                 {/* Infinite scroll loader placeholder */}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Widgets */}
          <div className="hidden lg:block lg:col-span-3 space-y-6">
            
            {/* Daily Briefing Widget */}
            {briefing && (
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="bg-gradient-to-br from-brand to-purple-600 p-4 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <FiTrendingUp className="text-white/80" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white/80">Daily Digest</span>
                  </div>
                  <h3 className="font-bold text-lg leading-tight">Your AI-Curated Insights</h3>
                </div>
                <div className="p-5">
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    {briefing.script_text?.substring(0, 150)}...
                  </p>
                  <button className="w-full py-2 text-sm font-medium text-brand border border-brand rounded-lg hover:bg-brand hover:text-white transition-colors">
                    Read Full Briefing
                  </button>
                </div>
              </div>
            )}

            {/* Trending/Recommended Widget */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 sticky top-24">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-900 dark:text-white">Recommended</h3>
                <FiSearch className="text-slate-400" />
              </div>
              <ul className="space-y-4">
                {[1, 2, 3].map((_, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0 overflow-hidden">
                       <img src={`https://ui-avatars.com/api/?name=User+${i}&background=random`} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Senior React Dev</h4>
                      <p className="text-xs text-slate-500">TechGlobal • Remote</p>
                      <button className="mt-1 text-xs font-medium text-brand hover:underline">+ Follow</button>
                    </div>
                  </li>
                ))}
              </ul>
              <button className="w-full mt-4 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium">
                View all recommendations
              </button>
            </div>

            {/* Footer Links */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 px-2 text-xs text-slate-400">
              <a href="#" className="hover:text-slate-600 dark:hover:text-slate-300">About</a>
              <a href="#" className="hover:text-slate-600 dark:hover:text-slate-300">Accessibility</a>
              <a href="#" className="hover:text-slate-600 dark:hover:text-slate-300">Help Center</a>
              <a href="#" className="hover:text-slate-600 dark:hover:text-slate-300">Privacy & Terms</a>
              <span>© 2024 AwasarHub</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
