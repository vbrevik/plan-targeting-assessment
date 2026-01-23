import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { getUserInfo, changePassword, updateProfile } from '@/features/auth/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { User, Lock, Mail, AlertCircle, CheckCircle2, Shield } from 'lucide-react'

export const Route = createFileRoute('/profile')({
  component: Profile,
})

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

function Profile() {
  const [username, setUsername] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [editUsername, setEditUsername] = useState<string>('')
  const [isEditing, setIsEditing] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    async function load() {
      const user = await getUserInfo()
      if (!mounted) return
      setUsername(user?.username ?? '')
      setEditUsername(user?.username ?? '')
      setEmail(user?.email ?? '')
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  async function onUpdateProfile(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    setIsSuccess(false)

    if (!editUsername.trim()) {
      setMessage('Username cannot be empty')
      return
    }

    setProfileLoading(true)
    const res = await updateProfile(editUsername)
    setProfileLoading(false)

    if (res.success) {
      setIsSuccess(true)
      setMessage('Profile updated successfully')
      setUsername(editUsername)
      setIsEditing(false)
    } else {
      setMessage(res.error || 'Failed to update profile')
    }
  }

  async function onUpdatePassword(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    setIsSuccess(false)

    if (newPassword !== confirmPassword) {
      setMessage('New password and confirmation do not match')
      return
    }
    if (newPassword.length < 8) {
      setMessage('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    const res = await changePassword(email, currentPassword, newPassword)
    setLoading(false)

    if (res.success) {
      setIsSuccess(true)
      setMessage('Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } else {
      setMessage(res.error || 'Failed to change password')
    }
  }

  const strength = getPasswordStrength(newPassword)

  return (
    <div className="p-6 max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Profile Settings</h1>
      </div>

      {message && (
        <div className="animate-in slide-in-from-top-2 duration-300">
          {isSuccess ? (
            <Alert className="mb-6 py-3 px-4 text-sm border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle className="text-xs uppercase font-bold tracking-wider">Success</AlertTitle>
              <AlertDescription className="text-xs">{message}</AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive" className="mb-6 py-3 px-4 text-sm">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="text-xs uppercase font-bold tracking-wider">Error</AlertTitle>
              <AlertDescription className="text-xs">{message}</AlertDescription>
            </Alert>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Information Card */}
        <Card className="border-border/40 overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="py-4 px-5 bg-muted/30 border-b border-border/40">
            <CardTitle className="text-base font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User size={18} className="text-primary" />
                Account Details
              </div>
              {!isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[10px] uppercase font-bold"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="py-5 px-5 space-y-5">
            <form onSubmit={onUpdateProfile} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <User size={12} /> Username
                </label>
                {isEditing ? (
                  <Input
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="h-9 transition-all focus:ring-1"
                    placeholder="Enter new username"
                  />
                ) : (
                  <div className="px-4 py-2.5 bg-muted/40 rounded-lg text-sm font-medium border border-border/40 group-hover:border-primary/20 transition-colors">
                    {username || <span className="text-muted-foreground italic">Loading...</span>}
                  </div>
                )}
              </div>
              <div className="space-y-1.5 opacity-80">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Mail size={12} /> Email Address
                </label>
                <div className="px-4 py-2.5 bg-muted/20 rounded-lg text-sm font-medium border border-border/20 cursor-not-allowed">
                  {email || <span className="text-muted-foreground italic">Loading...</span>}
                </div>
                <p className="text-[9px] text-muted-foreground italic pl-1">Email cannot be changed currently</p>
              </div>

              {isEditing && (
                <div className="flex gap-2 pt-2 animate-in zoom-in-95 duration-200">
                  <Button type="submit" disabled={profileLoading} size="sm" className="h-8 text-[11px] font-bold">
                    {profileLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 text-[11px] font-bold"
                    onClick={() => {
                      setIsEditing(false)
                      setEditUsername(username)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Security Settings Card */}
        <Card className="border-border/40 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="py-4 px-5 bg-muted/30 border-b border-border/40">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Shield size={18} className="text-primary" />
              Security Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="py-5 px-5 space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center py-1 border-b border-border/20">
                <span className="text-xs text-muted-foreground">Account Status</span>
                <span className="text-xs font-bold text-green-500 uppercase tracking-wider">Active</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border/20">
                <span className="text-xs text-muted-foreground">MFA Status</span>
                <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Disabled</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border/20">
                <span className="text-xs text-muted-foreground">Last Login</span>
                <span className="text-xs font-medium">Recently</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Change Password Card */}
      <Card className="mt-8 border-primary/10 bg-primary/[0.02] overflow-hidden shadow-sm">
        <CardHeader className="py-4 px-5 border-b border-primary/5">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Lock size={18} className="text-primary" />
            Security & Password
          </CardTitle>
        </CardHeader>
        <CardContent className="py-6 px-5">
          <form onSubmit={onUpdatePassword} className="max-w-2xl space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Current Password
              </label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="h-10 transition-all border-primary/10"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    New Password
                  </label>
                  {newPassword && <span className="text-[9px] font-black uppercase tracking-widest text-primary">{strength.label}</span>}
                </div>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-10 transition-all border-primary/10"
                  required
                />
                {newPassword && (
                  <div className="h-1 w-full bg-muted rounded-full overflow-hidden mt-2">
                    <div
                      className={`h-full ${strength.color} transition-all duration-500`}
                      style={{ width: strength.label === 'Strong' ? '100%' : strength.label === 'Medium' ? '66%' : '33%' }}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Confirm Password
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-10 transition-all border-primary/10"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <Button type="submit" disabled={loading} className="gap-2 h-10 px-6 font-bold text-xs uppercase tracking-widest">
                <Lock size={14} />
                {loading ? 'Processing...' : 'Change Password'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCurrentPassword('')
                  setNewPassword('')
                  setConfirmPassword('')
                  setMessage(null)
                }}
                className="h-10 text-xs font-bold uppercase tracking-widest"
              >
                Reset Form
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
