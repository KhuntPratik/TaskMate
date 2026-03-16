'use client';
import React, { useState, useEffect } from 'react';
import { Users, Mail, Shield, Calendar, Loader2, Search, UserCheck, UserX, Trash2, Edit2, Plus, X } from 'lucide-react';
import styles from './users.module.css';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../context/AuthContext';

interface User {
    userid: number;
    username: string;
    email: string;
    roleid: number | null;
    createdat: string;
    roles?: {
        rolename: string;
    };
}

export default function UsersPage() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // Form states
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        roleid: 2 // Default to User
    });

    const fetchUsers = async () => {
        try {
            const token = currentUser?.token || localStorage.getItem('token');
            const res = await fetch("/api/user", {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.status === 403) {
                return;
            }

            const data = await res.json();
            if (Array.isArray(data)) {
                setUsers(data);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser?.roleid === 1 || localStorage.getItem('token')) {
            fetchUsers();
        } else {
            setLoading(false);
        }
    }, [currentUser]);

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
            return;
        }

        try {
            const token = currentUser?.token || localStorage.getItem('token');
            const res = await fetch(`/api/user/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                setUsers(prev => prev.filter(u => u.userid !== id));
            } else {
                const data = await res.json();
                alert(data.message || "Failed to delete user");
            }
        } catch (error) {
            console.error("Delete user error:", error);
            alert("An error occurred while deleting the user");
        }
    };

    const handleToggleRole = async (user: User) => {
        const newRoleId = user.roleid === 1 ? 2 : 1;
        try {
            const token = currentUser?.token || localStorage.getItem('token');
            const res = await fetch(`/api/user/${user.userid}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ roleid: newRoleId })
            });

            if (res.ok) {
                const updatedUser = await res.json();
                setUsers(prev => prev.map(u => u.userid === user.userid ? updatedUser : u));
            } else {
                const data = await res.json();
                alert(data.message || "Failed to update role");
            }
        } catch (error) {
            console.error("Toggle role error:", error);
            alert("An error occurred while toggling the role");
        }
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = currentUser?.token || localStorage.getItem('token');
            const res = await fetch("/api/user", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                const newUser = await res.json();
                setUsers([...users, newUser]);
                setIsAddModalOpen(false);
                setFormData({ username: '', email: '', password: '', roleid: 2 });
            } else {
                const data = await res.json();
                alert(data.message || "Failed to add user");
            }
        } catch (error) {
            console.error("Add user error:", error);
        }
    };

    const handleEditUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;

        try {
            const token = currentUser?.token || localStorage.getItem('token');
            const res = await fetch(`/api/user/${selectedUser.userid}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    roleid: formData.roleid,
                    ...(formData.password && { password: formData.password })
                })
            });

            if (res.ok) {
                const updatedUser = await res.json();
                setUsers(prev => prev.map(u => u.userid === selectedUser.userid ? updatedUser : u));
                setIsEditModalOpen(false);
                setFormData({ username: '', email: '', password: '', roleid: 2 });
                setSelectedUser(null);
            } else {
                const data = await res.json();
                alert(data.message || "Failed to update user");
            }
        } catch (error) {
            console.error("Edit user error:", error);
        }
    };

    const openEditModal = (user: User) => {
        setSelectedUser(user);
        setFormData({
            username: user.username,
            email: user.email,
            password: '',
            roleid: user.roleid || 2
        });
        setIsEditModalOpen(true);
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <ProtectedRoute>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <Loader2 className="animate-spin text-primary" size={40} />
                </div>
            </ProtectedRoute>
        );
    }

    if (currentUser?.roleid !== 1) {
        return (
            <ProtectedRoute>
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <h2 className="text-destructive">Access Denied</h2>
                    <p>You do not have permission to view this page.</p>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className={styles.container}>
                <header className={styles.header}>
                    <div className={styles.titleSection}>
                        <h1 className={styles.title}>User Management</h1>
                        <p className={styles.subtitle}>Manage system users, roles, and access</p>
                    </div>
                    <button className={styles.addUserBtn} onClick={() => {
                        setFormData({ username: '', email: '', password: '', roleid: 2 });
                        setIsAddModalOpen(true);
                    }}>
                        <Plus size={16} />
                        <span>Add New User</span>
                    </button>
                </header>

                <div className={styles.topBar}>
                    <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className={styles.searchInput}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className={styles.userStats}>
                        <span>{users.length} Total Users</span>
                    </div>
                </div>

                <div className={styles.tableContainer}>
                    <table className={styles.userTable}>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Role</th>
                                <th>Admin Access</th>
                                <th>Joined Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user.userid}>
                                        <td>
                                            <div style={{ fontWeight: 500, color: '#000' }}>{user.username}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#666' }}>{user.email}</div>
                                        </td>
                                        <td>
                                            <span className={user.roleid === 1 ? styles.adminBadge : styles.userBadge}>
                                                {user.roles?.rolename || (user.roleid === 1 ? 'Admin' : 'User')}
                                            </span>
                                        </td>
                                        <td>
                                            <label className={styles.switch}>
                                                <input
                                                    type="checkbox"
                                                    checked={user.roleid === 1}
                                                    onChange={() => handleToggleRole(user)}
                                                    disabled={user.userid === currentUser?.userid}
                                                />
                                                Is Admin
                                            </label>
                                        </td>
                                        <td>{new Date(user.createdat).toLocaleDateString()}</td>
                                        <td>
                                            <div className={styles.actionButtons}>
                                                <button className={styles.iconBtn} onClick={() => openEditModal(user)}>
                                                    Edit
                                                </button>
                                                <button
                                                    className={styles.iconBtn}
                                                    onClick={() => handleDelete(user.userid)}
                                                    disabled={user.userid === currentUser?.userid}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className={styles.emptyState}>
                                        <UserX size={48} />
                                        <p>No users found matching your search.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Add User Modal */}
                {isAddModalOpen && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modal}>
                            <div className={styles.modalHeader}>
                                <h2 className={styles.modalTitle}>Add New User</h2>
                                <button className={styles.closeBtn} onClick={() => setIsAddModalOpen(false)}>
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleAddUser}>
                                <div className={styles.formGroup}>
                                    <label>Username</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Role</label>
                                    <select
                                        value={formData.roleid}
                                        onChange={(e) => setFormData({ ...formData, roleid: parseInt(e.target.value) })}
                                    >
                                        <option value={2}>User</option>
                                        <option value={1}>Admin</option>
                                    </select>
                                </div>
                                <div className={styles.formActions}>
                                    <button type="button" className={styles.cancelBtn} onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                                    <button type="submit" className={styles.submitBtn}>Create User</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit User Modal */}
                {isEditModalOpen && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modal}>
                            <div className={styles.modalHeader}>
                                <h2 className={styles.modalTitle}>Edit User</h2>
                                <button className={styles.closeBtn} onClick={() => {
                                    setIsEditModalOpen(false);
                                    setSelectedUser(null);
                                }}>
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleEditUser}>
                                <div className={styles.formGroup}>
                                    <label>Username</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>New Password (leave blank to keep current)</label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Role</label>
                                    <select
                                        value={formData.roleid}
                                        onChange={(e) => setFormData({ ...formData, roleid: parseInt(e.target.value) })}
                                        disabled={selectedUser?.userid === currentUser?.userid}
                                    >
                                        <option value={2}>User</option>
                                        <option value={1}>Admin</option>
                                    </select>
                                </div>
                                <div className={styles.formActions}>
                                    <button type="button" className={styles.cancelBtn} onClick={() => {
                                        setIsEditModalOpen(false);
                                        setSelectedUser(null);
                                    }}>Cancel</button>
                                    <button type="submit" className={styles.submitBtn}>Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
