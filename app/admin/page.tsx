"use client";

import { useEffect, useState } from "react";
import { getToken, getUser } from "@/lib/auth";

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "reports" | "blocked" | "users" | "system">("overview");

  const [reports, setReports] = useState<any[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  // Ban modal state
  const [showBanModal, setShowBanModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [banType, setBanType] = useState<"temporary" | "permanent">("temporary");
  const [banDuration, setBanDuration] = useState("7");
  const [banReason, setBanReason] = useState("");

  // ✅ CLIENT-SIDE AUTH LOAD
  useEffect(() => {
    const u = getUser();
    setUser(u);
    setLoading(false);

    if (u?.isAdmin) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/reports`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
        .then(res => res.json())
        .then(setReports);

      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/blocked-users`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
        .then(res => res.json())
        .then(setBlockedUsers);

      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
        .then(res => res.json())
        .then(setUsers);
    }
  }, []);

  // ⏳ Prevent hydration mismatch
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // 🔒 Admin gate
  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">This area is restricted to administrators only.</p>
        </div>
      </div>
    );
  }

  const totalUsers = users.filter(u => !u.isSystemUser).length;
  const activeReports = reports.length;
  const totalBlocked = blockedUsers.reduce((sum, u) => sum + (u.blockedUsers?.length || 0), 0);
  const completedProfiles = users.filter(u => u.profileCompleted && !u.isSystemUser).length;

  const realUsers = users.filter(u => !u.isSystemUser);
  const systemUsers = users.filter(u => u.isSystemUser);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Manage ZixChat platform</p>
            </div>
            <div className="flex items-center gap-3 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                <p className="text-xs text-gray-600">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex gap-2 border-b border-gray-200 min-w-max">
            {[
              { id: "overview", label: "Overview", icon: "📊" },
              { id: "reports", label: "Reports", icon: "🚨", badge: activeReports },
              { id: "blocked", label: "Blocked Users", icon: "🚫", badge: totalBlocked },
              { id: "users", label: "Real Users", icon: "👥", badge: totalUsers },
              { id: "system", label: "System Users", icon: "🤖", badge: systemUsers.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 sm:px-6 py-3 font-medium text-sm sm:text-base transition-all whitespace-nowrap relative ${
                  activeTab === tab.id
                    ? "text-purple-600 border-b-2 border-purple-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Stat Cards */}
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Users</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{totalUsers}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-pink-500 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Active Reports</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{activeReports}</p>
                  </div>
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Blocked Users</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{totalBlocked}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Completed Profiles</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{completedProfiles}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Stats</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Profile Completion Rate</span>
                  <span className="text-purple-600 font-bold text-lg">
                    {totalUsers > 0 ? Math.round((completedProfiles / totalUsers) * 100) : 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-pink-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Quiz Completed</span>
                  <span className="text-pink-600 font-bold text-lg">
                    {users.filter(u => u.quizCompleted).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Users Tab */}
        {activeTab === "system" && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50">
              <h2 className="text-2xl font-bold text-gray-800">System Users</h2>
              <p className="text-gray-600 mt-1">Auto-generated users created for onboarding</p>
            </div>
            <div className="p-6">
              {systemUsers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 font-medium">No system users found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {systemUsers.map((u: any) => (
                    <div
                      key={u._id}
                      className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-all bg-gradient-to-br from-white to-gray-50"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-slate-500 to-gray-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 overflow-hidden">
                            {u.photo ? (
                              <img src={u.photo} alt={u.name} className="w-full h-full object-cover" />
                            ) : (
                              <span>{u.name?.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-bold text-gray-800">{u.name}</h3>
                              <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded-full">System</span>
                            </div>
                            <p className="text-sm text-gray-600">{u.gender || "N/A"}</p>
                            <p className="text-sm text-gray-500">Email: {u.email}</p>
                            <p className="text-sm text-gray-500">City: {u.city || "N/A"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={async () => {
                              if (!confirm("Delete this system user?")) return;
                              await fetch(
                                `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${u._id}`,
                                {
                                  method: "DELETE",
                                  headers: { Authorization: `Bearer ${getToken()}` }
                                }
                              );
                              alert("System user deleted");
                              location.reload();
                            }}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-purple-50">
              <h2 className="text-2xl font-bold text-gray-800">User Reports</h2>
              <p className="text-gray-600 mt-1">Review and manage user-reported content</p>
            </div>
            <div className="p-6">
              {reports.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium">No active reports</p>
                  <p className="text-gray-400 text-sm mt-1">All clear!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((r, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow bg-gradient-to-br from-white to-gray-50">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                              REPORT #{i + 1}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                            <div>
                              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Reporter</p>
                              <p className="text-gray-800 font-medium">{r.reporter?.name || "Unknown"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Reported User</p>
                              <p className="text-gray-800 font-medium">{r.reportedUser?.name || "Unknown"}</p>
                            </div>
                          </div>
                          <div className="mt-3">
                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Reason</p>
                            <p className="text-gray-700 bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400">
                              {r.reason}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={async () => {
                            if (!confirm("Are you sure you want to delete this report?"))
                              return;

                            await fetch(
                              `${process.env.NEXT_PUBLIC_API_URL}/api/admin/reports/${r._id}`,  
                              {
                                method: "DELETE",
                                headers: {
                                  Authorization: `Bearer ${getToken()}`
                                }
                              }
                            );

                            alert("Report deleted successfully");
                            location.reload();
                          }}
                          className="px-4 sm:px-6 py-2 sm:py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow flex-shrink-0 text-sm sm:text-base"
                        >
                          Delete Report
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Blocked Users Tab */}
        {activeTab === "blocked" && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <h2 className="text-2xl font-bold text-gray-800">Blocked Users</h2>
              <p className="text-gray-600 mt-1">Manage user blocking relationships</p>
            </div>
            <div className="p-6">
              {blockedUsers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium">No blocked users</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {blockedUsers.map((u, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{u.name}</p>
                          <p className="text-sm text-gray-500">Has blocked {u.blockedUsers?.length || 0} user(s)</p>
                        </div>
                      </div>
                      {u.blockedUsers && u.blockedUsers.length > 0 && (
                        <div className="space-y-2">
                          {u.blockedUsers.map((b: any) => (
                            <div key={b._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-semibold text-sm">
                                  {b.name?.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-gray-700 font-medium">{b.name}</span>
                              </div>
                              <button
                                onClick={async () => {
                                  await fetch(
                                    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/unblock`,
                                    {
                                      method: "POST",
                                      headers: {
                                        "Content-Type": "application/json",
                                        Authorization: `Bearer ${getToken()}`
                                      },
                                      body: JSON.stringify({
                                        blockerId: u._id,
                                        blockedUserId: b._id
                                      })
                                    }
                                  );
                                  alert("User unblocked successfully");
                                  location.reload();
                                }}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm hover:shadow"
                              >
                                Unblock
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Real Users Tab */}
        {activeTab === "users" && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
              <h2 className="text-2xl font-bold text-gray-800">Real Users</h2>
              <p className="text-gray-600 mt-1">Manage all real users</p>
            </div>
            <div className="p-6">
              {realUsers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 font-medium">No users found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {realUsers.map((u: any) => (
                    <div
                      key={u._id}
                      className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-all bg-gradient-to-br from-white to-gray-50"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 overflow-hidden">
                            {u.photo ? (
                              <img src={u.photo} alt={u.name} className="w-full h-full object-cover" />
                            ) : (
                              <span>{u.name?.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-gray-800 text-lg">{u.name}</p>
                              {u.isAdmin && (
                                <span className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full">
                                  ADMIN
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1 break-all">{u.email}</p>
                            <div className="flex flex-wrap gap-2 mt-3">
                              {u.isBanned && (
                                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                                  🚫 Banned {u.banType === "permanent" ? "(Permanent)" : "(Temporary)"}
                                  {u.banType === "temporary" && u.banExpiresAt && (
                                    <span className="ml-1">- Until {new Date(u.banExpiresAt).toLocaleDateString()}</span>
                                  )}
                                </span>
                              )}
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                u.profileCompleted 
                                  ? "bg-green-100 text-green-700" 
                                  : "bg-gray-100 text-gray-600"
                              }`}>
                                {u.profileCompleted ? "✓ Profile Complete" : "○ Profile Incomplete"}
                              </span>
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                u.quizCompleted 
                                  ? "bg-blue-100 text-blue-700" 
                                  : "bg-gray-100 text-gray-600"
                              }`}>
                                {u.quizCompleted ? "✓ Quiz Complete" : "○ Quiz Incomplete"}
                              </span>
                            </div>
                            {u.isBanned && u.banReason && (
                              <p className="text-xs text-red-600 mt-2 bg-red-50 p-2 rounded">
                                <strong>Ban Reason:</strong> {u.banReason}
                              </p>
                            )}
                          </div>
                        </div>

                        {!u.isAdmin && (
                          <div className="flex flex-col sm:flex-row gap-2">
                            {u.isBanned ? (
                              <button
                                onClick={async () => {
                                  if (!confirm(`Are you sure you want to unban ${u.name}?`))
                                    return;

                                  await fetch(
                                    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${u._id}/unban`,
                                    {
                                      method: "POST",
                                      headers: {
                                        Authorization: `Bearer ${getToken()}`
                                      }
                                    }
                                  );

                                  alert("User unbanned successfully");
                                  location.reload();
                                }}
                                className="px-4 sm:px-6 py-2 sm:py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow flex-shrink-0 text-sm sm:text-base"
                              >
                                Unban User
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedUser(u);
                                  setBanReason("");
                                  setShowBanModal(true);
                                }}
                                className="px-4 sm:px-6 py-2 sm:py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow flex-shrink-0 text-sm sm:text-base"
                              >
                                Ban User
                              </button>
                            )}
                            <button
                              onClick={async () => {
                                if (
                                  !confirm(
                                    `Are you sure you want to permanently delete ${u.name}? This action cannot be undone.`
                                  )
                                )
                                  return;

                                await fetch(
                                  `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${u._id}`,
                                  {
                                    method: "DELETE",
                                    headers: {
                                      Authorization: `Bearer ${getToken()}`
                                    }
                                  }
                                );

                                alert("User deleted successfully");
                                location.reload();
                              }}
                              className="px-4 sm:px-6 py-2 sm:py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow flex-shrink-0 text-sm sm:text-base"
                            >
                              Delete User
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Ban Modal */}
      {showBanModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Ban User</h3>
              <button
                onClick={() => setShowBanModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                You are about to ban <strong>{selectedUser.name}</strong>
              </p>

              {/* Ban Type */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ban Type
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="banType"
                      value="temporary"
                      checked={banType === "temporary"}
                      onChange={(e) => setBanType(e.target.value as "temporary")}
                      className="mr-2 w-4 h-4 text-purple-600"
                    />
                    <span className="text-gray-700">Temporary</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="banType"
                      value="permanent"
                      checked={banType === "permanent"}
                      onChange={(e) => setBanType(e.target.value as "permanent")}
                      className="mr-2 w-4 h-4 text-purple-600"
                    />
                    <span className="text-gray-700">Permanent</span>
                  </label>
                </div>
              </div>

              {/* Duration (for temporary ban) */}
              {banType === "temporary" && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Duration (days)
                  </label>
                  <select
                    value={banDuration}
                    onChange={(e) => setBanDuration(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="1">1 Day</option>
                    <option value="3">3 Days</option>
                    <option value="7">7 Days</option>
                    <option value="14">14 Days</option>
                    <option value="30">30 Days</option>
                    <option value="90">90 Days</option>
                  </select>
                </div>
              )}

              {/* Ban Reason */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reason (Optional)
                </label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Enter reason for ban..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowBanModal(false)}
                className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${selectedUser._id}/ban`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getToken()}`
                      },
                      body: JSON.stringify({
                        banType,
                        banDuration: banType === "temporary" ? parseInt(banDuration) : null,
                        banReason: banReason || "No reason provided"
                      })
                    }
                  );

                  alert(`User banned ${banType === "temporary" ? "temporarily" : "permanently"}`);
                  setShowBanModal(false);
                  location.reload();
                }}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow"
              >
                Confirm Ban
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
