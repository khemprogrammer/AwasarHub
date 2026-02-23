import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiUser, FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi'

export default function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      await register(username, email, password)
      navigate('/feed')
    } catch {
      setError('Registration failed. Please try again.')
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="glass rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-500 bg-clip-text text-transparent">
              Join AwasarHub
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Start your professional journey today</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="input-label">Username</label>
              <div className="relative">
                <FiUser className="input-icon" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field"
                  placeholder="Choose a username"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="input-label">Email Address</label>
              <div className="relative">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="input-label">Password</label>
              <div className="relative">
                <FiLock className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="Create a strong password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-600 dark:text-red-400 text-sm text-center bg-red-100 dark:bg-red-900/20 py-2 rounded-lg"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full btn-primary"
            >
              Create Account <FiArrowRight />
            </motion.button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium">
              Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
