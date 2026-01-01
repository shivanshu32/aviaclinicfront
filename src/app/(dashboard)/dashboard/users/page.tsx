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
} from 'lucide-react';
import toast from 'react-hot-toast';

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'receptionist',
    phone: '',
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
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'receptionist',
        phone: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({ name: '', email: '', password: '', role: 'receptionist', phone: '' });
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

    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      const url = editingUser 
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/users/${editingUser._id}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/users`;
      
      const payload: Record<string, string> = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        phone: formData.phone,
      };
      
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-secondary-800 flex items-center gap-2">
            <Shield className="w-7 h-7 text-primary-600" />
            User Management
          </h1>
          <p className="text-secondary-400 mt-1 font-sans">Manage staff accounts and permissions</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-md shadow-primary-500/20 font-sans font-semibold"
        >
          <Plus className="w-5 h-5" />
          Add User
        </button>
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
                  <th className="text-left px-6 py-4 text-xs font-semibold text-secondary-400 uppercase font-sans tracking-wider hidden md:table-cell">Email</th>
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
                      <p className="text-sm text-secondary-600 font-sans">{user.email}</p>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-heading font-bold text-secondary-800">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-secondary-700 mb-1.5 font-sans">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-sans text-secondary-700"
                  placeholder="Enter name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-secondary-700 mb-1.5 font-sans">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-sans text-secondary-700"
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-secondary-700 mb-1.5 font-sans">
                  Password {editingUser && <span className="text-secondary-400 font-normal">(leave blank to keep current)</span>}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-sans text-secondary-700"
                  placeholder={editingUser ? '••••••••' : 'Enter password'}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-secondary-700 mb-1.5 font-sans">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-sans text-secondary-700"
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-secondary-700 mb-1.5 font-sans">Phone <span className="text-secondary-400 font-normal">(optional)</span></label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-sans text-secondary-700"
                  placeholder="Enter phone"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-secondary-600 rounded-xl hover:bg-gray-50 transition-all font-sans font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-md shadow-primary-500/20 font-sans font-semibold disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (editingUser ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
