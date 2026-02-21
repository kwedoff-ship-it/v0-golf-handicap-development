"use client"

import React from "react"

import { useState, useRef } from "react"
import { TabNavigation } from "@/components/TabNavigation"
import { GolfGreeting } from "@/components/GolfGreeting"
import { updateProfile, removeProfilePicture } from "@/app/actions/profile"
import type { UserProfile } from "@/lib/types"
import { Camera, Trash2, User } from "lucide-react"

interface SettingsClientProps {
  profile: UserProfile | null
  userEmail: string
  isAuthenticated: boolean
}

export function SettingsClient({ profile, userEmail, isAuthenticated }: SettingsClientProps) {
  const [displayName, setDisplayName] = useState(profile?.display_name || "")
  const [profilePictureUrl, setProfilePictureUrl] = useState(profile?.profile_picture_url || "")
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Upload failed")
      }

      setProfilePictureUrl(data.url)
      setMessage({ type: "success", text: "Image uploaded. Click Save to apply changes." })
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Upload failed",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemovePicture = async () => {
    setMessage(null)
    const result = await removeProfilePicture()
    if (result.success) {
      setProfilePictureUrl("")
      setMessage({ type: "success", text: "Profile picture removed." })
    } else {
      setMessage({ type: "error", text: result.error || "Failed to remove picture." })
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    const formData = new FormData()
    formData.append("display_name", displayName)
    if (profilePictureUrl) {
      formData.append("profile_picture_url", profilePictureUrl)
    }

    const result = await updateProfile(formData)

    if (result.success) {
      setMessage({ type: "success", text: "Profile saved successfully." })
    } else {
      setMessage({ type: "error", text: result.error || "Failed to save profile." })
    }

    setIsSaving(false)
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8 text-white">
      <div className="mx-auto max-w-7xl">
        <GolfGreeting displayName={displayName} email={userEmail} isAuthenticated={isAuthenticated} />
        <TabNavigation isAuthenticated={isAuthenticated} profilePictureUrl={profilePictureUrl} displayName={displayName} />

        <main className="space-y-8">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 tracking-tight">Settings</h1>
            <p className="text-slate-300 text-lg">Manage your account and profile</p>
          </div>

          {/* Profile Settings Card */}
          <div className="mx-auto max-w-2xl">
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl shadow-xl overflow-hidden">
              <div className="p-6 border-b border-slate-800">
                <h2 className="text-xl font-semibold text-white">Profile</h2>
                <p className="text-sm text-slate-400 mt-1">Your personal information</p>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-8">
                {/* Profile Picture Section */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative group">
                    <div className="h-28 w-28 rounded-full overflow-hidden border-2 border-slate-700 bg-slate-800 flex items-center justify-center">
                      {profilePictureUrl ? (
                        <img
                          src={profilePictureUrl || "/placeholder.svg"}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-12 w-12 text-slate-500" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      aria-label="Change profile picture"
                    >
                      <Camera className="h-6 w-6 text-white" />
                    </button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="px-4 py-2 text-sm font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isUploading ? "Uploading..." : "Upload Photo"}
                    </button>
                    {profilePictureUrl && (
                      <button
                        type="button"
                        onClick={handleRemovePicture}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">JPEG, PNG, WebP, or GIF. Max 5MB.</p>
                </div>

                {/* Account Info */}
                <div className="space-y-5">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={userEmail}
                      disabled
                      className="flex h-9 w-full rounded-md border border-slate-700 bg-slate-800/50 px-3 py-1 text-sm text-slate-400 cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-500 mt-1">Email cannot be changed.</p>
                  </div>

                  <div>
                    <label htmlFor="display_name" className="block text-sm font-medium text-slate-300 mb-2">
                      Display Name
                    </label>
                    <input
                      id="display_name"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your display name"
                      className="flex h-9 w-full rounded-md border border-slate-700 bg-slate-800/80 px-3 py-1 text-sm text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Status Message */}
                {message && (
                  <p
                    className={`text-sm ${
                      message.type === "success" ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {message.text}
                  </p>
                )}

                {/* Save Button */}
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
