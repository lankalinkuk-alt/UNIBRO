import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole, UserPermission, Language } from '../types';
import { translations } from '../translations';
import {
  PERMISSION_METADATA,
  DEFAULT_ROLE_PERMISSIONS,
  ROLE_DETAILS,
  hasUserPermission
} from '../utils/permissionUtils';
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  Key,
  Lock,
  Unlock,
  Building,
  Briefcase,
  Mail,
  Phone,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Check,
  X,
  Eye,
  Sliders,
  UserCheck
} from 'lucide-react';

interface UserManagementProps {
  language: Language;
  currentRole: UserRole;
  currentUserId?: string;
  onUserSwitch?: (user: UserProfile) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  language,
  currentRole,
  currentUserId,
  onUserSwitch,
}) => {
  const t = translations[language];
  const isAdmin = currentRole === 'admin';

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    designation: string;
    department: string;
    role: UserRole;
    status: 'active' | 'inactive';
    permissions: UserPermission[];
  }>({
    name: '',
    email: '',
    phone: '',
    designation: '',
    department: '',
    role: 'hr',
    status: 'active',
    permissions: DEFAULT_ROLE_PERMISSIONS.hr,
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [permissionGroupTab, setPermissionGroupTab] = useState<'all' | 'admin' | 'hr' | 'payroll' | 'biometric' | 'system'>('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/profiles');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Failed to fetch user profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      designation: 'Human Resources Officer',
      department: 'Human Resources',
      role: 'hr',
      status: 'active',
      permissions: [...DEFAULT_ROLE_PERMISSIONS.hr],
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: UserProfile) => {
    setEditingUser(user);
    const userPermissions = (Array.isArray(user.permissions) && user.permissions.length > 0)
      ? [...user.permissions]
      : [...(DEFAULT_ROLE_PERMISSIONS[user.role] || [])];

    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      designation: user.designation || '',
      department: user.department || '',
      role: user.role,
      status: user.status || 'active',
      permissions: userPermissions,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleRoleChangeInForm = (newRole: UserRole) => {
    const defaultPerms = DEFAULT_ROLE_PERMISSIONS[newRole] || [];
    setFormData(prev => ({
      ...prev,
      role: newRole,
      permissions: [...defaultPerms],
    }));
  };

  const handleTogglePermission = (permKey: UserPermission) => {
    setFormData(prev => {
      const current = prev.permissions;
      if (current.includes(permKey)) {
        return { ...prev, permissions: current.filter(p => p !== permKey) };
      } else {
        return { ...prev, permissions: [...current, permKey] };
      }
    });
  };

  const handleSelectAllPermissions = () => {
    const all = PERMISSION_METADATA.map(p => p.key);
    setFormData(prev => ({ ...prev, permissions: all }));
  };

  const handleClearPermissions = () => {
    setFormData(prev => ({ ...prev, permissions: [] }));
  };

  const handleApplyRoleDefaults = () => {
    const defaults = DEFAULT_ROLE_PERMISSIONS[formData.role] || [];
    setFormData(prev => ({ ...prev, permissions: [...defaults] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      setFormError('Only administrators can create or edit users.');
      return;
    }

    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError('Please enter both Name and Email address.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const url = editingUser ? `/api/profiles/${editingUser.id}` : '/api/profiles';
      const method = editingUser ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentRole,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save user profile');
      }

      const savedUser = await res.json();
      setIsModalOpen(false);
      await fetchUsers();

      // If updating current active user session, notify parent
      if (editingUser && editingUser.id === currentUserId && onUserSwitch) {
        onUserSwitch(savedUser);
      }
    } catch (err: any) {
      setFormError(err.message || 'An error occurred while saving user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (user: UserProfile) => {
    if (!isAdmin) return;

    if (user.role === 'admin') {
      const activeAdmins = users.filter(u => u.id !== user.id && u.role === 'admin' && u.status !== 'inactive');
      if (activeAdmins.length === 0) {
        alert(t.cannot_delete_self_or_last_admin);
        return;
      }
    }

    const confirmMsg = language === 'ta'
      ? `பயனர் "${user.name}" கணக்கை நீக்க விரும்புகிறீர்களா?`
      : language === 'si'
      ? `පරිශීලක "${user.name}" ගිණුම මකා දැමීමට ඔබට විශ්වාසද?`
      : `Are you sure you want to permanently delete user account "${user.name}" (${user.email})?`;

    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/profiles/${user.id}`, {
        method: 'DELETE',
        headers: { 'x-user-role': currentRole },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete user');
      }

      await fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to delete user.');
    }
  };

  const handleToggleStatus = async (user: UserProfile) => {
    if (!isAdmin) return;

    try {
      const res = await fetch(`/api/profiles/${user.id}/toggle-status`, {
        method: 'POST',
        headers: { 'x-user-role': currentRole },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to toggle status');
      }

      await fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to change status.');
    }
  };

  // Filtered Users
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.designation && user.designation.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.department && user.department.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || (user.status || 'active') === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalActive = users.filter(u => (u.status || 'active') === 'active').length;
  const adminCount = users.filter(u => u.role === 'admin' && (u.status || 'active') === 'active').length;
  const hrCount = users.filter(u => u.role === 'hr' && (u.status || 'active') === 'active').length;
  const payrollCount = users.filter(u => u.role === 'payroll' && (u.status || 'active') === 'active').length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Metrics */}
      <div className="bg-linear-to-r from-stone-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-400/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t.roles_permissions}</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              {t.user_management}
            </h2>
            <p className="text-sm text-stone-300 max-w-xl">
              {language === 'ta'
                ? 'கணினி பயனர்களை உருவாக்குங்கள், பணிகளை ஒதுக்குங்கள், மற்றும் தொகுதிக்கான அனுமதிகளைத் துல்லியமாகக் கட்டுப்படுத்துங்கள்.'
                : language === 'si'
                ? 'පද්ධති පරිශීලකයින් සාදන්න, භූමිකාවන් පවරන්න සහ මොඩියුල අවසර සකසන්න.'
                : 'Create and manage system user accounts, assign operational roles, and finely configure module rights & security permissions.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={fetchUsers}
              className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer border border-white/10"
              title="Refresh users list"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            {isAdmin && (
              <button
                onClick={handleOpenCreateModal}
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-md transition flex items-center space-x-2 cursor-pointer border border-indigo-400/30"
              >
                <UserPlus className="w-4 h-4" />
                <span>{t.add_user}</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <div className="text-xs text-stone-400 font-medium">{t.active_users}</div>
            <div className="text-xl font-black text-white mt-1">{totalActive} / {users.length}</div>
          </div>
          <div className="bg-purple-950/30 backdrop-blur-xs rounded-xl p-3 border border-purple-500/20">
            <div className="text-xs text-purple-300 font-medium">Administrators</div>
            <div className="text-xl font-black text-purple-200 mt-1">{adminCount}</div>
          </div>
          <div className="bg-blue-950/30 backdrop-blur-xs rounded-xl p-3 border border-blue-500/20">
            <div className="text-xs text-blue-300 font-medium">HR Managers</div>
            <div className="text-xl font-black text-blue-200 mt-1">{hrCount}</div>
          </div>
          <div className="bg-emerald-950/30 backdrop-blur-xs rounded-xl p-3 border border-emerald-500/20">
            <div className="text-xs text-emerald-300 font-medium">Payroll Officers</div>
            <div className="text-xl font-black text-emerald-200 mt-1">{payrollCount}</div>
          </div>
        </div>
      </div>

      {!isAdmin && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-xl text-sm flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
          <span>
            {language === 'ta'
              ? 'பயனர்களை உருவாக்க அல்லது திருத்த நிர்வாகி (Admin) உரிமைகள் தேவை. நீங்கள் தற்போதைய பயனர்களின் பட்டியலை மட்டுமே பார்க்கலாம்.'
              : language === 'si'
              ? 'පරිශීලකයින් සෑදීමට හෝ සංස්කරණය කිරීමට පරිපාලක (Admin) අවසර අවශ්‍ය වේ.'
              : 'Administrator credentials are required to create or modify user profiles and rights. You can currently view registered system accounts.'}
          </span>
        </div>
      )}

      {/* Controls / Filter Bar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.search}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-stone-100 p-1 rounded-xl text-xs font-semibold text-stone-600">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${roleFilter === 'all' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'hover:text-stone-900'}`}
            >
              All Roles
            </button>
            <button
              onClick={() => setRoleFilter('admin')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${roleFilter === 'admin' ? 'bg-purple-600 text-white shadow-xs font-bold' : 'hover:text-stone-900'}`}
            >
              Admin
            </button>
            <button
              onClick={() => setRoleFilter('hr')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${roleFilter === 'hr' ? 'bg-blue-600 text-white shadow-xs font-bold' : 'hover:text-stone-900'}`}
            >
              HR
            </button>
            <button
              onClick={() => setRoleFilter('payroll')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${roleFilter === 'payroll' ? 'bg-emerald-600 text-white shadow-xs font-bold' : 'hover:text-stone-900'}`}
            >
              Payroll
            </button>
          </div>

          <div className="flex items-center bg-stone-100 p-1 rounded-xl text-xs font-semibold text-stone-600">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${statusFilter === 'all' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'hover:text-stone-900'}`}
            >
              All Status
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${statusFilter === 'active' ? 'bg-emerald-600 text-white shadow-xs font-bold' : 'hover:text-stone-900'}`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('inactive')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${statusFilter === 'inactive' ? 'bg-stone-600 text-white shadow-xs font-bold' : 'hover:text-stone-900'}`}
            >
              Inactive
            </button>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center shadow-xs">
          <Users className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800">No users found</h3>
          <p className="text-xs text-stone-500 mt-1">Try adjusting your search query or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredUsers.map((user) => {
            const roleInfo = ROLE_DETAILS[user.role] || ROLE_DETAILS.hr;
            const isSelf = user.id === currentUserId;
            const isActive = (user.status || 'active') === 'active';
            const permsCount = Array.isArray(user.permissions) ? user.permissions.length : (DEFAULT_ROLE_PERMISSIONS[user.role] || []).length;

            return (
              <div
                key={user.id}
                className={`bg-white rounded-2xl border transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between overflow-hidden ${
                  isActive ? 'border-stone-200' : 'border-stone-300 opacity-70 bg-stone-50/60'
                }`}
              >
                <div className="p-5 space-y-4">
                  
                  {/* Top Row: Avatar + Role Badge + Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg text-white shadow-xs ${
                        user.role === 'admin' ? 'bg-purple-600' : user.role === 'hr' ? 'bg-blue-600' : user.role === 'payroll' ? 'bg-emerald-600' : 'bg-stone-700'
                      }`}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <h3 className="font-bold text-stone-900 text-base">{user.name}</h3>
                          {isSelf && (
                            <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.5 rounded-full border border-indigo-200">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-500">{user.designation || 'Staff Member'}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${roleInfo.color}`}>
                        {roleInfo.label[language]}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                        isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-200 text-stone-600'
                      }`}>
                        {isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{isActive ? t.status_active : t.status_inactive}</span>
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 text-xs text-stone-600 pt-2 border-t border-stone-100">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    {user.department && (
                      <div className="flex items-center gap-2">
                        <Building className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span>{user.department}</span>
                      </div>
                    )}
                    {user.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Permissions summary pill */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-stone-500 mb-1.5">
                      <span className="flex items-center gap-1">
                        <Key className="w-3 h-3 text-indigo-600" />
                        <span>{t.user_rights}</span>
                      </span>
                      <span className="text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded-full">
                        {user.role === 'admin' ? 'Full Access (All)' : `${permsCount} / ${PERMISSION_METADATA.length} Rights`}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {(user.permissions || DEFAULT_ROLE_PERMISSIONS[user.role] || []).slice(0, 4).map(permKey => {
                        const meta = PERMISSION_METADATA.find(m => m.key === permKey);
                        if (!meta) return null;
                        return (
                          <span
                            key={permKey}
                            className="text-[10px] px-2 py-0.5 bg-stone-100 text-stone-700 rounded-md font-medium truncate max-w-[130px]"
                            title={meta.label[language]}
                          >
                            {meta.label[language]}
                          </span>
                        );
                      })}
                      {permsCount > 4 && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-stone-100 text-stone-500 rounded-md font-bold">
                          +{permsCount - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                </div>

                {/* Card Action Footer */}
                <div className="px-5 py-3 bg-stone-50/80 border-t border-stone-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {isAdmin && (
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                          isActive
                            ? 'text-amber-700 hover:bg-amber-100'
                            : 'text-emerald-700 hover:bg-emerald-100'
                        }`}
                        title={isActive ? 'Deactivate account' : 'Activate account'}
                      >
                        {isActive ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        <span>{isActive ? 'Deactivate' : 'Activate'}</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isAdmin && (
                      <button
                        onClick={() => handleOpenEditModal(user)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>{t.edit}</span>
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        title="Delete User Account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT USER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-stone-200 max-w-3xl w-full shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-5 bg-stone-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
                  {editingUser ? <Edit2 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {editingUser ? t.edit_user : t.add_user}
                  </h3>
                  <p className="text-xs text-stone-300">
                    {editingUser
                      ? `Update account details & rights for ${editingUser.name}`
                      : 'Create a new user account with customized system permissions'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
              
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Section 1: Personal & Role Details */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>1. User Profile & Account Details</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Kumari Perera"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Email Address (Login ID) *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. kumari@unibro.lk"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Designation
                    </label>
                    <input
                      type="text"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      placeholder="e.g. Senior HR Specialist"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="e.g. Human Resources"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. +94 77 123 4567"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Account Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    >
                      <option value="active">Active (Full Login Access)</option>
                      <option value="inactive">Inactive / Suspended</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Operational Role Selection */}
              <div className="space-y-3 pt-4 border-t border-stone-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-indigo-600" />
                    <span>2. Select Operational Role</span>
                  </h4>
                  <span className="text-xs text-stone-500">Choosing a role auto-populates standard rights</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(['admin', 'hr', 'payroll', 'viewer'] as UserRole[]).map((roleKey) => {
                    const isSelected = formData.role === roleKey;
                    const rInfo = ROLE_DETAILS[roleKey];
                    return (
                      <button
                        type="button"
                        key={roleKey}
                        onClick={() => handleRoleChangeInForm(roleKey)}
                        className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                            : 'border-stone-200 hover:border-stone-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[11px] font-black uppercase ${isSelected ? 'text-indigo-900' : 'text-stone-700'}`}>
                            {roleKey}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                        </div>
                        <span className="text-xs text-stone-600 font-medium line-clamp-1">
                          {rInfo.label[language]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 3: Fine-Grained User Rights & Permissions Matrix */}
              <div className="space-y-4 pt-4 border-t border-stone-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-indigo-600" />
                      <span>3. Granular User Rights & Permissions ({formData.permissions.length} Enabled)</span>
                    </h4>
                    <p className="text-xs text-stone-500">
                      Toggle specific capabilities to customize exact access for this user
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={handleSelectAllPermissions}
                      className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      {t.grant_all_rights}
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyRoleDefaults}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      Reset Defaults
                    </button>
                    <button
                      type="button"
                      onClick={handleClearPermissions}
                      className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      {t.clear_rights}
                    </button>
                  </div>
                </div>

                {/* Category tabs */}
                <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setPermissionGroupTab('all')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer whitespace-nowrap ${
                      permissionGroupTab === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    All Permissions ({PERMISSION_METADATA.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPermissionGroupTab('admin')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer whitespace-nowrap ${
                      permissionGroupTab === 'admin' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Admin & Security
                  </button>
                  <button
                    type="button"
                    onClick={() => setPermissionGroupTab('hr')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer whitespace-nowrap ${
                      permissionGroupTab === 'hr' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    HR & Attendance
                  </button>
                  <button
                    type="button"
                    onClick={() => setPermissionGroupTab('payroll')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer whitespace-nowrap ${
                      permissionGroupTab === 'payroll' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Payroll & EPF
                  </button>
                  <button
                    type="button"
                    onClick={() => setPermissionGroupTab('biometric')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer whitespace-nowrap ${
                      permissionGroupTab === 'biometric' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Biometric Hardware
                  </button>
                </div>

                {/* Permission Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                  {PERMISSION_METADATA.filter(p => permissionGroupTab === 'all' || p.group === permissionGroupTab).map((perm) => {
                    const isChecked = formData.permissions.includes(perm.key);
                    return (
                      <div
                        key={perm.key}
                        onClick={() => handleTogglePermission(perm.key)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                          isChecked
                            ? 'bg-indigo-50/70 border-indigo-300 shadow-xs'
                            : 'bg-white border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition ${
                          isChecked ? 'bg-indigo-600 text-white' : 'border border-stone-300 bg-stone-50'
                        }`}>
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-stone-900">
                              {perm.label[language]}
                            </span>
                            {perm.isDangerous && (
                              <span className="text-[10px] bg-red-100 text-red-800 font-bold px-1.5 py-0.2 rounded">
                                Admin Critical
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-500 leading-relaxed">
                            {perm.description[language]}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold text-xs transition cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>{editingUser ? 'Save User & Rights' : 'Create User Account'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
