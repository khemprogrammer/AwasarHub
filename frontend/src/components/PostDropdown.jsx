import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMoreHorizontal, FiEdit2, FiTrash2, FiFlag, FiPaperclip } from 'react-icons/fi'
import api from '../api/client'

export default function PostDropdown({ post, isOwner, onPostDeleted, onPostUpdated }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editData, setEditData] = useState({
        title: post.title || '',
        description: post.description || '',
        company: post.company || '',
        org: post.org || '',
        category: post.category || '',
        city: post.city || '',
        link_url: post.link_url || '',
        tags: post.tags ? post.tags.join(', ') : ''
    })
    const menuRef = useRef(null)

    // Handle clicking outside the menu to close it
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const toggleMenu = (e) => {
        e.stopPropagation()
        setIsOpen(!isOpen)
    }

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this post?")) return
        try {
            const endpoint = post.type === 'job' ? `/api/jobs/${post.id}/` : `/api/opportunities/${post.id}/`
            await api.delete(endpoint)
            setIsOpen(false)
            if (onPostDeleted) onPostDeleted(post.id, post.type)
        } catch (error) {
            console.error("Failed to delete post", error)
            alert("Failed to delete post. Check console.")
        }
    }

    const handleEditSave = async () => {
        try {
            const endpoint = post.type === 'job' ? `/api/jobs/${post.id}/` : `/api/opportunities/${post.id}/`

            // Format tags back into an array
            const formattedData = { ...editData }
            if (typeof editData.tags === 'string') {
                formattedData.tags = editData.tags.split(',').map(t => t.trim()).filter(t => t)
            }

            const res = await api.patch(endpoint, formattedData)
            setIsEditing(false)
            if (onPostUpdated) onPostUpdated(res.data)
        } catch (error) {
            console.error("Failed to edit post", error)
            alert("Failed to edit post.")
        }
    }

    const handlePin = () => {
        setIsOpen(false)
        alert("Post pinned! (Mocked frontend action)")
    }

    const handleReport = () => {
        setIsOpen(false)
        alert("Post reported successfully. Our team will review it. (Mocked frontend action)")
    }

    return (
        <>
            <div className="relative" ref={menuRef}>
                <button
                    onClick={toggleMenu}
                    className="p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-zinc-800 dark:hover:text-slate-300 transition-colors"
                >
                    <FiMoreHorizontal size={20} />
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-slate-100 dark:border-zinc-800 z-50 overflow-hidden"
                        >
                            <div className="py-1">
                                {isOwner && (
                                    <>
                                        <button onClick={() => { setIsOpen(false); setIsEditing(true); }} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-3 transition-colors">
                                            <FiEdit2 className="text-slate-400" /> Edit Post
                                        </button>
                                        <button onClick={handlePin} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-3 transition-colors">
                                            <FiPaperclip className="text-slate-400" /> Pin to profile
                                        </button>
                                        <div className="border-t border-slate-100 dark:border-zinc-800 my-1"></div>
                                        <button onClick={handleDelete} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors">
                                            <FiTrash2 className="text-red-500" /> Delete Post
                                        </button>
                                    </>
                                )}
                                {!isOwner && (
                                    <button onClick={handleReport} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors">
                                        <FiFlag className="text-red-500" /> Report Post
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Edit Modal */}
            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {isEditing && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-zinc-800 flex flex-col max-h-[90vh]"
                            >
                                <div className="p-6 border-b border-slate-100 dark:border-zinc-800 shrink-0">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Edit Post</h3>
                                </div>
                                <div className="p-6 flex-1 overflow-y-auto space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Title</label>
                                        <input
                                            type="text"
                                            value={editData.title}
                                            onChange={e => setEditData({ ...editData, title: e.target.value })}
                                            className="w-full rounded-lg border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand"
                                        />
                                    </div>
                                    {post.type === 'job' ? (
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Company</label>
                                            <input
                                                type="text"
                                                value={editData.company}
                                                onChange={e => setEditData({ ...editData, company: e.target.value })}
                                                className="w-full rounded-lg border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand"
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Organization</label>
                                                <input
                                                    type="text"
                                                    value={editData.org}
                                                    onChange={e => setEditData({ ...editData, org: e.target.value })}
                                                    className="w-full rounded-lg border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Category</label>
                                                <select
                                                    value={editData.category}
                                                    onChange={e => setEditData({ ...editData, category: e.target.value })}
                                                    className="w-full rounded-lg border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand"
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
                                        </>
                                    )}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Location / City</label>
                                            <input
                                                type="text"
                                                value={editData.city}
                                                onChange={e => setEditData({ ...editData, city: e.target.value })}
                                                className="w-full rounded-lg border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Link URL</label>
                                            <input
                                                type="url"
                                                value={editData.link_url}
                                                onChange={e => setEditData({ ...editData, link_url: e.target.value })}
                                                className="w-full rounded-lg border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Description</label>
                                        <textarea
                                            rows={4}
                                            value={editData.description}
                                            onChange={e => setEditData({ ...editData, description: e.target.value })}
                                            className="w-full rounded-lg border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Tags (comma separated)</label>
                                        <input
                                            type="text"
                                            value={editData.tags}
                                            onChange={e => setEditData({ ...editData, tags: e.target.value })}
                                            placeholder="e.g. React, Python, Remote"
                                            className="w-full rounded-lg border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand"
                                        />
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 flex justify-end gap-3 border-t border-slate-100 dark:border-zinc-800 shrink-0 rounded-b-2xl">
                                    <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors">
                                        Cancel
                                    </button>
                                    <button onClick={handleEditSave} className="px-6 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark font-medium transition-colors">
                                        Save Changes
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    )
}
