'use client';

import { useState, useEffect } from 'react';
import { 
  Shield, 
  Plus,
  Search,
  Edit2,
  Trash2,
  User,
  Loader2,
  UserCheck,
  UserX,
  Eye,
  EyeOff,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PermissionManager from '@/components/staff/PermissionManager';
import type { PermissionMap } from '@/lib/services/rbacService';

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  department?: string;
  designation?: string;
  status?: 'active' | 'inactive' | 'suspended';
  permissions?: PermissionMap;
  lastLogin?: string;
  isActive: boolean;
  createdAt: string;
}

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'receptionist', label: 'Receptionist' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'pharmacist', label: 'Pharmacist' },
  { value: 'accountant', label: 'Accountant' },
];

const ROLE_COLORS: Record<string, string> = {
  owner: 'bg-purple-100 text-purple-700',
  admin: 'bg-red-100 text-red-700',
  receptionist: 'bg-blue-100 text-blue-700',
  doctor: 'bg-green-100 text-green-700',
  pharmacist: 'bg-orange-100 text-orange-700',
  accountant: 'bg-yellow-100 text-yellow-700',
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [permissionUser, setPermissionUser] = useState<UserData | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'receptionist',
    phone: '',
    department: '', designation: '', status: 'active',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.data.users || []);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (user: UserData | null = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        role: user.role || 'receptionist',
        phone: user.phone || '',
        department: user.department || '', designation: user.designation || '', status: user.status || (user.isActive === false ? 'inactive' : 'active'),
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'receptionist',
        phone: '',
        department: '', designation: '', status: 'active',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setShowPassword(false);
    setFormData({ name: '', email: '', password: '', role: 'receptionist', phone: '', department: '', designation: '', status: 'active' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }
    if (!editingUser && !formData.password) {
      toast.error('Password is required for new users');
      return;
    }
    if (formData.password && formData.password.length < 10) {
      toast.error('Password must be at least 10 characters');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      const url = editingUser 
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/users/${editingUser._id}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/users`;
      
      const payload: Record<string, string> = {
        name: formData.name,
        email: formData.email,
      };
      const currentStatus = editingUser?.status || (editingUser?.isActive === false ? 'inactive' : 'active');
      if (!editingUser || (editingUser.role !== 'owner' && formData.status !== currentStatus)) payload.status = formData.status;

      // Owner roles cannot be changed. Omit unchanged roles on updates too.
      if (!editingUser || (editingUser.role !== 'owner' && formData.role !== editingUser.role)) {
        payload.role = formData.role;
      }

      // The API accepts an omitted optional phone, but rejects an empty string.
      if (formData.phone.trim()) {
        payload.phone = formData.phone.trim();
      }
      if (formData.department.trim()) payload.department = formData.department.trim();
      if (formData.designation.trim()) payload.designation = formData.designation.trim();
      
      if (formData.password) {
        payload.password = formData.password;
      }

      const response = await fetch(url, {
        method: editingUser ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(editingUser ? 'User updated successfully' : 'User created successfully');
        handleCloseModal();
        fetchUsers();
      } else {
        toast.error(data.error || 'Failed to save user');
      }
    } catch (error) {
      console.error('Failed to save user:', error);
      toast.error('Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    setDeletingId(userId);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        toast.success('User deleted successfully');
        setUsers(prev => prev.filter(u => u._id !== userId));
      } else {
        toast.error(data.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('Failed to delete user');
    } finally {
      setDeletingId(null);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary-700">Administration</p>
          <h1 className="text-2xl font-bold tracking-tight text-secondary-900">Staff</h1>
          <p className="mt-1 text-sm text-secondary-500">Manage staff accounts, roles and access status.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary"
        >
          <Plus className="w-5 h-5" />
          Add User
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { label: 'Total staff', value: users.length, icon: Shield, color: 'patients-stat-green' },
          { label: 'Active accounts', value: users.filter(item => item.isActive !== false).length, icon: UserCheck, color: 'patients-stat-blue' },
          { label: 'Clinical users', value: users.filter(item => item.role === 'doctor').length, icon: User, color: 'patients-stat-violet' },
          { label: 'Inactive accounts', value: users.filter(item => item.isActive === false).length, icon: UserX, color: 'patients-stat-amber' },
        ].map(item => <article key={item.label} className={`patients-stat-card ${item.color}`}><span className="patients-stat-icon"><item.icon className="h-5 w-5" /></span><div><p className="text-xl font-bold text-secondary-900">{item.value}</p><p className="text-xs font-medium text-secondary-500">{item.label}</p></div></article>)}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-300" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-sans text-secondary-700 placeholder:text-secondary-300"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-secondary-400 font-sans">No users found</p>
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center gap-2 mt-4 text-primary-600 hover:text-primary-700 font-sans font-semibold"
            >
              <Plus className="w-4 h-4" />
              Add your first user
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-secondary-400 uppercase font-sans tracking-wider">User</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-secondary-400 uppercase font-sans tracking-wider hidden md:table-cell">Department / Designation</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-secondary-400 uppercase font-sans tracking-wider">Role</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-secondary-400 uppercase font-sans tracking-wider hidden lg:table-cell">Status</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-secondary-400 uppercase font-sans tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-primary-600 font-sans">
                            {getInitials(user.name)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-secondary-800 font-sans">{user.name}</p>
                          <p className="text-sm text-secondary-400 font-sans md:hidden">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <p className="text-sm font-medium text-secondary-700">{user.department || '—'}</p><p className="text-xs text-secondary-400">{user.designation || user.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-xl font-sans capitalize ${ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-700'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-xl font-sans ${
                        user.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {user.isActive !== false ? (
                          <><UserCheck className="w-3.5 h-3.5" /> Active</>
                        ) : (
                          <><UserX className="w-3.5 h-3.5" /> Inactive</>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(user)}
                          className="p-2 text-secondary-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {user.role !== 'owner' && <button onClick={() => setPermissionUser(user)} className="p-2 text-secondary-400 hover:bg-primary-50 hover:text-primary-700 rounded-xl transition-all" title="Manage permissions" aria-label={`Manage ${user.name} permissions`}><Shield className="w-4 h-4" /></button>}
                        {user.role !== 'owner' && (
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            disabled={deletingId === user._id}
                            className="p-2 text-secondary-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50"
                            title="Delete"
                          >
                            {deletingId === user._id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-600 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                    {editingUser ? (
                      <Edit2 className="w-7 h-7 text-white" />
                    ) : (
                      <Plus className="w-7 h-7 text-white" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white font-heading">
                      {editingUser ? 'Edit User' : 'Add New User'}
                    </h2>
                    <p className="text-white/80 text-sm font-sans mt-1">
                      {editingUser ? 'Update user information and permissions' : 'Create a new staff member account'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/80 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Personal Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input 
                        type="text" 
                        value={formData.name} 
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-sans text-gray-900 placeholder:text-gray-400" 
                        placeholder="Enter full name" 
                      />
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <div className="relative">
                      <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m9 9a9 9 0 01-9-9m9 9H7m9 9a9 9 0 01-9-9" />
                      </svg>
                      <input 
                        type="email" 
                        value={formData.email} 
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-sans text-gray-900 placeholder:text-gray-400" 
                        placeholder="user@clinic.com" 
                      />
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password {editingUser && <span className="text-gray-400 font-normal">(leave blank to keep current)</span>}
                    </label>
                    <div className="relative">
                      <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        value={formData.password} 
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                        className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-sans text-gray-900 placeholder:text-gray-400" 
                        placeholder={editingUser ? '••••••••' : 'Create a strong password'} 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {formData.password && (
                      <div className="mt-2">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((level) => (
                            <div 
                              key={level} 
                              className={`h-1 flex-1 rounded-full transition-colors ${
                                formData.password.length >= level * 3 
                                  ? level <= 2 ? 'bg-red-500' 
                                  : level === 3 ? 'bg-yellow-500' 
                                  : 'bg-green-500'
                                  : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {formData.password.length < 10 ? 'Use 10+ characters for a strong password' : 'Strong password'}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <div className="relative">
                      <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <input 
                        type="tel" 
                        value={formData.phone} 
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-sans text-gray-900 placeholder:text-gray-400" 
                        placeholder="+91 98765 43210" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Role & Access Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-secondary-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-secondary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Role & Access</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Select Role</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {(editingUser?.role === 'owner' ? [{ value: 'owner', label: 'Owner' }] : ROLE_OPTIONS).map((role) => (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, role: role.value })}
                        disabled={editingUser?.role === 'owner'}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          formData.role === role.value
                            ? `${ROLE_COLORS[role.value]} border-current bg-opacity-10`
                            : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                        } ${editingUser?.role === 'owner' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            formData.role === role.value ? 'bg-white/30' : 'bg-gray-100'
                          }`}>
                            {role.value === 'admin' && <Shield className="w-4 h-4" />}
                            {role.value === 'receptionist' && <User className="w-4 h-4" />}
                            {role.value === 'doctor' && <UserCheck className="w-4 h-4" />}
                            {role.value === 'pharmacist' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>}
                            {role.value === 'accountant' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                            {role.value === 'owner' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
                          </div>
                          <span className="font-medium text-sm">{role.label}</span>
                        </div>
                        <p className="text-xs opacity-75">
                          {role.value === 'admin' && 'Full system access'}
                          {role.value === 'receptionist' && 'Front desk operations'}
                          {role.value === 'doctor' && 'Medical consultations'}
                          {role.value === 'pharmacist' && 'Medicine management'}
                          {role.value === 'accountant' && 'Billing & accounts'}
                          {role.value === 'owner' && 'Account owner'}
                        </p>
                      </button>
                    ))}
                  </div>
                  {editingUser?.role === 'owner' && (
                    <p className="mt-2 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      The owner role cannot be changed. You can still edit other details.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <div className="relative">
                      <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <input 
                        value={formData.department} 
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })} 
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-sans text-gray-900 placeholder:text-gray-400" 
                        placeholder="e.g. Reception" 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
                    <div className="relative">
                      <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <input 
                        value={formData.designation} 
                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })} 
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-sans text-gray-900 placeholder:text-gray-400" 
                        placeholder="e.g. Front desk executive" 
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Account Status</label>
                  <div className="flex gap-3">
                    {[
                      { value: 'active', label: 'Active', icon: UserCheck, color: 'bg-green-100 text-green-700 border-green-300' },
                      { value: 'inactive', label: 'Inactive', icon: UserX, color: 'bg-gray-100 text-gray-700 border-gray-300' },
                      { value: 'suspended', label: 'Suspended', icon: Shield, color: 'bg-red-100 text-red-700 border-red-300' },
                    ].map((status) => (
                      <button
                        key={status.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, status: status.value })}
                        disabled={editingUser?.role === 'owner'}
                        className={`flex-1 p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                          formData.status === status.value
                            ? `${status.color} border-current`
                            : 'border-gray-200 hover:border-gray-300'
                        } ${editingUser?.role === 'owner' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <status.icon className="w-4 h-4" />
                        <span className="font-medium text-sm">{status.label}</span>
                      </button>
                    ))}
                  </div>
                  {editingUser?.role === 'owner' && (
                    <p className="mt-2 text-xs text-gray-500">Owner account status cannot be changed</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={handleCloseModal} 
                  className="flex-1 px-6 py-3 font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-sans"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-medium rounded-xl hover:from-primary-700 hover:to-primary-600 transition-all font-sans disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingUser ? (
                        <>
                          <Edit2 className="w-5 h-5" />
                          Update User
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5" />
                          Create User
                        </>
                      )}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {permissionUser && <PermissionManager user={permissionUser} onClose={() => setPermissionUser(null)} onSaved={fetchUsers} />}
    </div>
  );
}
