import React, { useEffect, useState } from 'react'
import { getCsrfToken } from '@/features/auth/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, Save, X, Edit2, AlertCircle, CheckCircle2, Eye, Calendar, Terminal, Shield, Key, RefreshCw, UserPlus } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { UserRolesPanel } from './UserRolesPanel'

export type User = {
    id: string
    username: string
    email: string
    created_at: string
    last_login_ip?: string | null
    last_user_agent?: string | null
    last_login_at?: string | null
    notification_preferences?: string | null
}

function getPasswordStrength(password: string) {
    if (!password) return { label: '', color: 'bg-slate-200' };
    if (password.length < 6) return { label: 'Too Weak', color: 'bg-red-500' };
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const score = [hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;

    if (password.length >= 10 && score >= 2) return { label: 'Strong', color: 'bg-green-500' };
    if (password.length >= 8 && score >= 1) return { label: 'Medium', color: 'bg-yellow-500' };
    return { label: 'Weak', color: 'bg-orange-500' };
}

export default function UserManagement() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [expandedUserId, setExpandedUserId] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [editAccordionOpen, setEditAccordionOpen] = useState<Record<string, boolean>>({})

    // Form state
    const [userPasswords, setUserPasswords] = useState<Record<string, { password: string, forceChange: boolean }>>({})
    const [userEdits, setUserEdits] = useState<Record<string, { username: string, email: string }>>({})
    // Create User form state
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [createForm, setCreateForm] = useState({ username: '', email: '', password: '' })

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users', { credentials: 'include' })
            if (!res.ok) throw new Error('Failed to fetch users')
            const data = await res.json()
            setUsers(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])


    const clearMessages = () => {
        setError(null)
        setSuccessMessage(null)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return
        clearMessages()
        const token = getCsrfToken()
        if (!token) {
            setError('CSRF session expired. Please refresh the page.')
            return
        }

        try {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-Token': token,
                },
                credentials: 'include',
            })
            if (!res.ok) {
                const text = await res.text()
                throw new Error(text || 'Failed to delete user')
            }
            setSuccessMessage('User deleted successfully')
            fetchUsers()
        } catch (err: any) {
            setError(err.message)
        }
    }

    const toggleExpand = (userId: string) => {
        setExpandedUserId(expandedUserId === userId ? null : userId)
        // Close edit accordion when toggling view
        if (editAccordionOpen[userId]) {
            setEditAccordionOpen(prev => ({ ...prev, [userId]: false }))
        }
    }

    const toggleEditAccordion = (userId: string, user: User) => {
        const isOpening = !editAccordionOpen[userId]

        // Close the view accordion when opening edit
        if (isOpening && expandedUserId === userId) {
            setExpandedUserId(null)
        }

        setEditAccordionOpen(prev => ({
            ...prev,
            [userId]: isOpening
        }))
        // Initialize edit form with current values when opening
        if (isOpening) {
            setUserEdits(prev => ({
                ...prev,
                [userId]: {
                    username: user.username,
                    email: user.email
                }
            }))
        }
    }

    const updateUserEdit = (userId: string, field: 'username' | 'email', value: string) => {
        setUserEdits(prev => ({
            ...prev,
            [userId]: {
                username: field === 'username' ? value : prev[userId]?.username || '',
                email: field === 'email' ? value : prev[userId]?.email || ''
            }
        }))
    }

    const handleUpdateUser = async (e: React.FormEvent, userId: string) => {
        e.preventDefault()
        clearMessages()

        const userEdit = userEdits[userId]
        if (!userEdit) return

        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': getCsrfToken() || '',
                },
                body: JSON.stringify({ username: userEdit.username, email: userEdit.email }),
                credentials: 'include',
            })
            if (!res.ok) {
                const text = await res.text()
                throw new Error(text || 'Failed to update user')
            }

            setSuccessMessage('User updated successfully')
            setUserEdits(prev => {
                const newState = { ...prev }
                delete newState[userId]
                return newState
            })
            setEditAccordionOpen(prev => ({ ...prev, [userId]: false }))
            fetchUsers()
        } catch (err: any) {
            setError(err.message)
        }
    }

    const updateUserPassword = (userId: string, field: 'password' | 'forceChange', value: string | boolean) => {
        setUserPasswords(prev => ({
            ...prev,
            [userId]: {
                password: field === 'password' ? value as string : prev[userId]?.password || '',
                forceChange: field === 'forceChange' ? value as boolean : prev[userId]?.forceChange || false
            }
        }))
    }

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        clearMessages()

        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': getCsrfToken() || '',
                },
                body: JSON.stringify(createForm),
                credentials: 'include',
            })

            if (!res.ok) {
                const text = await res.text()
                throw new Error(text || 'Failed to create user')
            }

            setSuccessMessage('User created successfully')
            setCreateForm({ username: '', email: '', password: '' })
            setShowCreateForm(false)
            fetchUsers()
        } catch (err: any) {
            setError(err.message)
        }
    }

    if (loading) return <div className="p-6">Loading users...</div>

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">User Management</h1>
                <Button
                    onClick={() => {
                        clearMessages()
                        setShowCreateForm(!showCreateForm)
                    }}
                    variant={showCreateForm ? "outline" : "default"}
                    className="gap-2"
                >
                    {showCreateForm ? <X size={16} /> : <UserPlus size={16} />}
                    {showCreateForm ? "Cancel" : "Create New User"}
                </Button>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-4 py-2 px-3 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle className="text-xs uppercase font-bold">Error</AlertTitle>
                    <AlertDescription className="text-xs">{error}</AlertDescription>
                </Alert>
            )}

            {successMessage && (
                <Alert className="mb-4 py-2 px-3 text-sm border-green-500 bg-green-50 text-green-700">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <AlertTitle className="text-xs uppercase font-bold">Success</AlertTitle>
                    <AlertDescription className="text-xs">{successMessage}</AlertDescription>
                </Alert>
            )}

            {showCreateForm && (
                <div className="mb-8 p-6 bg-slate-50 border-2 border-primary/20 rounded-xl shadow-sm animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <UserPlus className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Register New User</h2>
                            <p className="text-xs text-muted-foreground tracking-wide uppercase font-medium">Core System Access Creation</p>
                        </div>
                    </div>

                    <form onSubmit={handleCreateUser} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Username</label>
                                <Input
                                    className="h-10 border-slate-200"
                                    placeholder="j.doe"
                                    value={createForm.username}
                                    onChange={e => setCreateForm({ ...createForm, username: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Email Address</label>
                                <Input
                                    className="h-10 border-slate-200"
                                    type="email"
                                    placeholder="doe@mission-control.mil"
                                    value={createForm.email}
                                    onChange={e => setCreateForm({ ...createForm, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Initial Password</label>
                                <Input
                                    className="h-10 border-slate-200"
                                    type="password"
                                    placeholder="••••••••"
                                    value={createForm.password}
                                    onChange={e => setCreateForm({ ...createForm, password: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button type="submit" className="gap-2 px-8 h-10 shadow-md">
                                <Save size={16} /> Create User Account
                            </Button>
                        </div>
                    </form>
                </div>
            )}



            <div className="border rounded-lg overflow-hidden bg-background">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="py-2 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">Username</th>
                            <th className="py-2 px-4 text-xs font-bold uppercase tracking-wider text-slate-500 hidden sm:table-cell">Email</th>
                            <th className="py-2 px-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="py-12 text-center text-muted-foreground italic text-sm">
                                    No users found.
                                </td>
                            </tr>
                        ) : (
                            users.map(user => (
                                <React.Fragment key={user.id}>
                                    <tr className={`hover:bg-slate-50/50 transition-colors ${expandedUserId === user.id ? 'bg-primary/5' : ''}`}>
                                        <td className="py-2 px-4">
                                            <div className="font-medium text-sm">{user.username}</div>
                                            <div className="text-[10px] text-muted-foreground sm:hidden">{user.email}</div>
                                        </td>
                                        <td className="py-2 px-4 text-sm text-slate-600 hidden sm:table-cell">{user.email}</td>
                                        <td className="py-2 px-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className={`h-8 w-8 ${expandedUserId === user.id ? 'text-primary' : 'text-slate-400'}`}
                                                    onClick={() => toggleExpand(user.id)}
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className={`h-8 w-8 ${editAccordionOpen[user.id] ? 'text-primary' : 'text-slate-400 hover:text-blue-600'}`}
                                                    onClick={() => toggleEditAccordion(user.id, user)}
                                                    title="Edit User"
                                                >
                                                    <Edit2 size={16} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-400 hover:text-red-600"
                                                    onClick={() => handleDelete(user.id)}
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                    {expandedUserId === user.id && (
                                        <tr className="bg-primary/5 border-b shadow-inner">
                                            <td colSpan={4} className="p-0">
                                                <div className="px-12 py-4 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-2 duration-200">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-slate-500">
                                                            <Calendar size={14} />
                                                            <span className="text-[10px] font-bold uppercase tracking-wider">Created</span>
                                                        </div>
                                                        <p className="text-xs font-medium">{new Date(user.created_at).toLocaleString()}</p>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-slate-500">
                                                            <Terminal size={14} />
                                                            <span className="text-[10px] font-bold uppercase tracking-wider">Last Login IP</span>
                                                        </div>
                                                        <p className="text-xs font-mono">{user.last_login_ip || 'n/a'}</p>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-slate-500">
                                                            <CheckCircle2 size={14} />
                                                            <span className="text-[10px] font-bold uppercase tracking-wider">Last Activity</span>
                                                        </div>
                                                        <p className="text-xs font-medium">{user.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Never'}</p>
                                                    </div>
                                                    <div className="md:col-span-3 space-y-2">
                                                        <div className="flex items-center gap-2 text-slate-500">
                                                            <Shield size={14} />
                                                            <span className="text-[10px] font-bold uppercase tracking-wider">User Agent</span>
                                                        </div>
                                                        <p className="text-[11px] bg-background p-2 rounded border font-mono break-all leading-relaxed">
                                                            {user.last_user_agent || 'No agent recorded'}
                                                        </p>
                                                    </div>

                                                    <div className="md:col-span-3 pt-4 border-t">
                                                        <UserRolesPanel userId={user.id} />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    {editAccordionOpen[user.id] && (
                                        <tr className="bg-blue-50/50 dark:bg-blue-950/20 border-b shadow-inner">
                                            <td colSpan={4} className="p-0">
                                                <div className="px-12 py-4 animate-in slide-in-from-top-2 duration-200">
                                                    <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-blue-200 dark:border-blue-900/50">
                                                        <form onSubmit={(e) => handleUpdateUser(e, user.id)} className="space-y-4">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div className="space-y-1">
                                                                    <label className="text-xs font-medium uppercase tracking-wider text-slate-500">Username</label>
                                                                    <Input
                                                                        value={userEdits[user.id]?.username || ''}
                                                                        onChange={e => updateUserEdit(user.id, 'username', e.target.value)}
                                                                        required
                                                                        className="h-9"
                                                                    />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-xs font-medium uppercase tracking-wider text-slate-500">Email</label>
                                                                    <Input
                                                                        type="email"
                                                                        value={userEdits[user.id]?.email || ''}
                                                                        onChange={e => updateUserEdit(user.id, 'email', e.target.value)}
                                                                        required
                                                                        className="h-9"
                                                                    />
                                                                </div>
                                                            </div>

                                                            {/* Password Section */}
                                                            <div className="pt-4 border-t">
                                                                <div className="flex items-center gap-2 mb-3">
                                                                    <Key size={14} className="text-orange-600" />
                                                                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password Management</h4>
                                                                </div>
                                                                <div className="space-y-3">
                                                                    <div className="space-y-1">
                                                                        <div className="flex justify-between items-center">
                                                                            <label className="text-xs font-medium uppercase tracking-wider text-slate-500">New Password (Optional)</label>
                                                                            {userPasswords[user.id]?.password && (
                                                                                <span className="text-[9px] font-bold uppercase tracking-wider">
                                                                                    {getPasswordStrength(userPasswords[user.id]?.password).label}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <Input
                                                                            type="password"
                                                                            value={userPasswords[user.id]?.password || ''}
                                                                            onChange={e => updateUserPassword(user.id, 'password', e.target.value)}
                                                                            className="h-9"
                                                                            placeholder="Leave blank to keep current password"
                                                                        />
                                                                        {userPasswords[user.id]?.password && (
                                                                            <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden mt-1">
                                                                                <div
                                                                                    className={`h-full ${getPasswordStrength(userPasswords[user.id]?.password).color} transition-all duration-300`}
                                                                                    style={{
                                                                                        width: getPasswordStrength(userPasswords[user.id]?.password).label === 'Strong' ? '100%' :
                                                                                            getPasswordStrength(userPasswords[user.id]?.password).label === 'Medium' ? '66%' : '33%'
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-900/50">
                                                                        <input
                                                                            type="checkbox"
                                                                            id={`forceChange-${user.id}`}
                                                                            checked={userPasswords[user.id]?.forceChange || false}
                                                                            onChange={e => updateUserPassword(user.id, 'forceChange', e.target.checked)}
                                                                            className="h-4 w-4 rounded border-slate-300"
                                                                        />
                                                                        <label htmlFor={`forceChange-${user.id}`} className="text-xs font-medium flex items-center gap-2 cursor-pointer">
                                                                            <RefreshCw size={12} className="text-orange-600" />
                                                                            Force user to change password on next login
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex gap-2 pt-2">
                                                                <Button type="submit" size="sm" className="flex-1 gap-2 h-9">
                                                                    <Save size={16} /> Update User
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setUserEdits(prev => {
                                                                            const newState = { ...prev }
                                                                            delete newState[user.id]
                                                                            return newState
                                                                        })
                                                                        setUserPasswords(prev => {
                                                                            const newState = { ...prev }
                                                                            delete newState[user.id]
                                                                            return newState
                                                                        })
                                                                        setEditAccordionOpen(prev => ({ ...prev, [user.id]: false }))
                                                                    }}
                                                                    className="h-9"
                                                                >
                                                                    <X size={16} /> Cancel
                                                                </Button>
                                                            </div>
                                                        </form>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
