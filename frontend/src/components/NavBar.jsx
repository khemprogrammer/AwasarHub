import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiInfo, FiMenu, FiX, FiUser, FiLogOut, FiSun, FiMoon, FiSearch } from 'react-icons/fi'
import api from '../api/client'

export default function NavBar() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = async (e) => {
    const query = e.target.value
    setSearchQuery(query)
    if (query.length > 1) {
      try {
        const res = await api.get(`/api/auth/search/?q=${query}`)
        setSearchResults(res.data)
        setShowResults(true)
      } catch (error) {
        console.error("Search failed", error)
      }
    } else {
      setSearchResults([])
      setShowResults(false)
    }
  }

  const handleUserClick = (username) => {
      setSearchQuery('')
      setShowResults(false)
      navigate(`/profile/${username}`)
  }

  const getPageInfo = () => {
    switch (location.pathname) {
      case '/feed': return { title: 'Personalized Feed', desc: 'Your daily AI-curated briefing and job opportunities tailored to your interests.' }
      case '/jobs/new': return { title: 'Post Opportunity', desc: 'Create a new job or opportunity listing to reach thousands of potential candidates.' }
      case '/login': return { title: 'Login', desc: 'Access your account to view your personalized dashboard.' }
      case '/register': return { title: 'Register', desc: 'Join AwasarHub to start your professional journey.' }
      default: return { title: 'AwasarHub', desc: 'Connecting you to the best opportunities.' }
    }
  }

  const pageInfo = getPageInfo()

  return (
    <>
      <nav className="fixed w-full z-50 glass shadow-lg text-slate-800 dark:text-white transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-brand-light to-brand-dark bg-clip-text text-transparent hover:scale-105 transition-transform">
                AwasarHub
              </Link>
            </div>

            {/* Search Bar */}
            <div className="hidden md:block flex-1 max-w-md mx-8 relative" ref={searchRef}>
                <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e)}
                        onFocus={() => searchQuery.length > 1 && setShowResults(true)}
                        className="w-full pl-10 pr-4 py-2 rounded-full border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand text-slate-900 dark:text-white transition-all focus:bg-white dark:focus:bg-black"
                    />
                </div>
                <AnimatePresence>
                    {showResults && searchResults.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute top-full mt-2 w-full bg-white dark:bg-black rounded-xl shadow-xl border border-slate-100 dark:border-zinc-800 overflow-hidden z-50"
                        >
                            {searchResults.map(resultUser => (
                                <button
                                    key={resultUser.id}
                                    onClick={() => handleUserClick(resultUser.username)}
                                    className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors text-left"
                                >
                                     <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-sm overflow-hidden">
                                        {resultUser.avatar ? (
                                            <img src={resultUser.avatar} alt={resultUser.username} className="w-full h-full object-cover" />
                                        ) : (
                                            resultUser.username?.[0]?.toUpperCase()
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white text-sm">{resultUser.first_name} {resultUser.last_name || resultUser.username}</p>
                                        <p className="text-xs text-slate-500">@{resultUser.username}</p>
                                    </div>
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link to="/feed" className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">Feed</Link>
                <Link to="/jobs/new" className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">Post Job/Opp</Link>
                
                <button 
                  onClick={toggleTheme}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-yellow-500 dark:text-yellow-400"
                  title="Toggle Theme"
                >
                  {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} className="text-brand dark:text-brand-light" />}
                </button>

                <button 
                  onClick={() => setShowInfo(!showInfo)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-brand dark:text-brand-light"
                  title="Page Info"
                >
                  <FiInfo size={20} />
                </button>

                {user ? (
                  <div className="flex items-center gap-4 ml-4">
                    <Link to="/profile" className="flex items-center gap-2 group">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-light to-brand text-white flex items-center justify-center text-sm font-bold shadow-md group-hover:shadow-lg transition-all">
                        {user.username?.[0]?.toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-brand dark:group-hover:text-brand-light transition-colors">
                        {user.username}
                      </span>
                    </Link>
                    <button 
                      onClick={logout}
                      className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors"
                      title="Logout"
                    >
                      <FiLogOut size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="ml-4 flex gap-2">
                    <Link to="/login" className="px-4 py-2 text-sm rounded-full border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-200 transition-colors">Login</Link>
                    <Link to="/register" className="px-4 py-2 text-sm rounded-full bg-gradient-to-r from-brand-light to-brand-dark text-white hover:shadow-lg hover:scale-105 transition-all">Register</Link>
                  </div>
                )}
              </div>
            </div>

            <div className="-mr-2 flex md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 focus:outline-none transition-colors"
              >
                {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden glass border-t border-slate-200 dark:border-zinc-800"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-slate-600 dark:text-slate-300">Theme</span>
                  <button 
                    onClick={toggleTheme}
                    className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors text-yellow-500 dark:text-yellow-400"
                  >
                    {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} className="text-blue-600 dark:text-blue-300" />}
                  </button>
                </div>
                <Link to="/feed" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors">Feed</Link>
                <Link to="/jobs/new" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors">Post Job/Opp</Link>
                {user ? (
                  <>
                    <div className="px-3 py-2 text-sm text-slate-600 dark:text-slate-400">Signed in as {user.username}</div>
                    <button onClick={logout} className="block w-full text-left px-3 py-2 text-red-600 dark:text-red-400 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-md transition-colors">Logout</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors">Login</Link>
                    <Link to="/register" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors">Register</Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Info Modal/Tooltip */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 md:right-20 z-40 w-80 glass p-6 rounded-xl shadow-2xl border border-blue-200 dark:border-blue-500/30 text-slate-800 dark:text-white"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                <FiInfo /> About this Page
              </h3>
              <button onClick={() => setShowInfo(false)} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors">
                <FiX />
              </button>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              {pageInfo.desc}
            </p>
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-zinc-800 text-xs text-slate-500 dark:text-slate-500">
              AwasarHub Professional Suite v1.0
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Spacer for fixed navbar */}
      <div className="h-16"></div>
    </>
  )
}
