import { useState } from 'react'
import api from '../api/client'
import { motion } from 'framer-motion'
import { FiBriefcase, FiMapPin, FiLink, FiTag, FiFileText, FiSend, FiCheckCircle, FiAlertCircle, FiAward } from 'react-icons/fi'

export default function JobPost() {
  const [postType, setPostType] = useState('job') // 'job' or 'opportunity'
  const [form, setForm] = useState({
    company: '',
    org: '',
    title: '',
    description: '',
    category: '',
    city: '',
    link_url: '',
    tags: '',
  })
  const [status, setStatus] = useState({ type: '', msg: '' })

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setStatus({ type: 'loading', msg: `Posting ${postType}...` })
    
    let formattedLink = form.link_url
    if (formattedLink && !formattedLink.startsWith('http')) {
        formattedLink = `https://${formattedLink}`
    }

    const tagsArray = form.tags.split(',').map((t) => t.trim()).filter(Boolean)

    let payload = {}
    let endpoint = ''

    if (postType === 'job') {
        endpoint = '/api/jobs/'
        payload = {
            company: form.company,
            title: form.title,
            description: form.description,
            city: form.city,
            link_url: formattedLink,
            tags: tagsArray
        }
    } else {
        endpoint = '/api/opportunities/'
        payload = {
            org: form.org,
            title: form.title,
            description: form.description,
            category: form.category,
            city: form.city,
            link_url: formattedLink,
            tags: tagsArray
        }
    }

    try {
      await api.post(endpoint, payload)
      setStatus({ type: 'success', msg: `${postType === 'job' ? 'Job' : 'Opportunity'} posted successfully!` })
      setForm({ company: '', org: '', title: '', description: '', category: '', city: '', link_url: '', tags: '' })
      setTimeout(() => setStatus({ type: '', msg: '' }), 3000)
    } catch (err) {
      console.error(err.response?.data || err.message)
      setStatus({ type: 'error', msg: err.response?.data ? JSON.stringify(err.response.data) : `Failed to post ${postType}. Please try again.` })
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <div className="glass rounded-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Post a New {postType === 'job' ? 'Job' : 'Opportunity'}</h2>
            <p className="text-slate-500 dark:text-slate-400">Reach thousands of qualified candidates</p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex">
                <button
                    type="button"
                    onClick={() => setPostType('job')}
                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                        postType === 'job' 
                        ? 'bg-white dark:bg-slate-700 text-brand shadow-sm' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                >
                    Job
                </button>
                <button
                    type="button"
                    onClick={() => setPostType('opportunity')}
                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                        postType === 'opportunity' 
                        ? 'bg-white dark:bg-slate-700 text-brand shadow-sm' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                >
                    Opportunity
                </button>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="input-label">{postType === 'job' ? 'Company Name' : 'Organization Name'}</label>
                <div className="relative">
                  <FiBriefcase className="input-icon" />
                  <input
                    name={postType === 'job' ? 'company' : 'org'}
                    value={postType === 'job' ? form.company : form.org}
                    onChange={onChange}
                    className="input-field"
                    placeholder={postType === 'job' ? "e.g. Acme Corp" : "e.g. Non-Profit Org"}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="input-label">{postType === 'job' ? 'Job Title' : 'Opportunity Title'}</label>
                <div className="relative">
                  {postType === 'job' ? <FiBriefcase className="input-icon" /> : <FiAward className="input-icon" />}
                  <input
                    name="title"
                    value={form.title}
                    onChange={onChange}
                    className="input-field"
                    placeholder={postType === 'job' ? "e.g. Senior Developer" : "e.g. Research Grant"}
                    required
                  />
                </div>
              </div>
            </div>

            {postType === 'opportunity' && (
                <div className="space-y-2">
                    <label className="input-label">Category</label>
                    <div className="relative">
                        <FiTag className="input-icon" />
                        <select
                            name="category"
                            value={form.category}
                            onChange={onChange}
                            className="input-field appearance-none"
                            required
                        >
                            <option value="" disabled>Select a category</option>
                            <option value="scholarship">Scholarship</option>
                            <option value="grant">Grant</option>
                            <option value="internship">Internship</option>
                            <option value="fellowship">Fellowship</option>
                            <option value="hackathon">Hackathon</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>
            )}

            <div className="space-y-2">
              <label className="input-label">Description</label>
              <div className="relative">
                <FiFileText className="input-icon" />
                <textarea
                  name="description"
                  value={form.description}
                  onChange={onChange}
                  rows={6}
                  className="input-field"
                  placeholder="Describe the role and responsibilities..."
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="input-label">Location (City)</label>
                <div className="relative">
                  <FiMapPin className="input-icon" />
                  <input
                    name="city"
                    value={form.city}
                    onChange={onChange}
                    className="input-field"
                    placeholder="e.g. New York, Remote"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="input-label">Application Link</label>
                <div className="relative">
                  <FiLink className="input-icon" />
                  <input
                    name="link_url"
                    value={form.link_url}
                    onChange={onChange}
                    className="input-field"
                    placeholder="https://..."
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="input-label">Tags</label>
              <div className="relative">
                <FiTag className="input-icon" />
                <input
                  name="tags"
                  value={form.tags}
                  onChange={onChange}
                  className="input-field"
                  placeholder="e.g. react, python, full-time (comma separated)"
                />
              </div>
            </div>

            <div className="pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={status.type === 'loading'}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status.type === 'loading' ? (
                  'Posting...'
                ) : (
                  <>
                    Post Opportunity <FiSend />
                  </>
                )}
              </motion.button>
            </div>
          </form>

          {status.msg && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-6 p-4 rounded-lg flex items-center gap-2 justify-center ${
                status.type === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 
                status.type === 'error' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
              }`}
            >
              {status.type === 'success' ? <FiCheckCircle /> : 
               status.type === 'error' ? <FiAlertCircle /> : null}
              {status.msg}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
