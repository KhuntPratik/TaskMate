'use client';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import styles from './group.module.css';
import ProtectedRoute from '../../components/ProtectedRoute';

interface Group {
    id: number;
    name: string;
    description: string;
    members: string[]; // URLs or initials
    memberCount: number;
    tasksCompleted: number;
    totalTasks: number;
    color: string;
    lastActive: string;
}

const DUMMY_GROUPS: Group[] = [
    {
        id: 1,
        name: 'Design Team',
        description: 'UI/UX revisions for the new mobile app launch.',
        members: ['JD', 'AL', 'RK'],
        memberCount: 5,
        tasksCompleted: 12,
        totalTasks: 15,
        color: 'var(--primary)',
        lastActive: '2h ago'
    },
    {
        id: 2,
        name: 'Backend Devs',
        description: 'API optimization and database migration tasks.',
        members: ['TS', 'MP'],
        memberCount: 8,
        tasksCompleted: 45,
        totalTasks: 60,
        color: 'var(--secondary)',
        lastActive: '5m ago'
    },
    {
        id: 3,
        name: 'Marketing Alpha',
        description: 'Q1 campaign planning and social media strategy.',
        members: ['SJ', 'KV', 'RT', 'BL'],
        memberCount: 12,
        tasksCompleted: 8,
        totalTasks: 24,
        color: '#f97316',
        lastActive: '1d ago'
    },
    {
        id: 4,
        name: 'Project Delta',
        description: 'Secret innovative feature development.',
        members: ['AD'],
        memberCount: 3,
        tasksCompleted: 2,
        totalTasks: 10,
        color: '#8b5cf6',
        lastActive: '3h ago'
    }
];

export default function GroupPage() {
    const router = useRouter();
    const [groups, setGroups] = useState(DUMMY_GROUPS);
    const [showForm, setShowForm] = useState(false);
    const [newGroup, setNewGroup] = useState({ name: '', description: '' });

    const getProgress = (completed: number, total: number) => {
        return Math.round((completed / total) * 100);
    };

    const handleCreateGroup = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGroup.name || !newGroup.description) return;

        const newGroupObj: Group = {
            id: Date.now(),
            name: newGroup.name,
            description: newGroup.description,
            members: ['ME'],
            memberCount: 1,
            tasksCompleted: 0,
            totalTasks: 0,
            color: 'var(--surface-active)',
            lastActive: 'Just now'
        };

        setGroups([newGroupObj, ...groups]);
        setNewGroup({ name: '', description: '' });
        setShowForm(false);
    };

    return (
        <ProtectedRoute>
        <div className={styles.container}>
            {/* Main Content */}
            <main className={styles.main}>
                <header className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Your Groups</h1>
                        <p style={{ color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>
                            Collaborate and track team progress
                        </p>
                    </div>
                    <button
                        className={styles.createButton}
                        onClick={() => setShowForm(!showForm)}
                    >
                        <span style={{ fontSize: '1.2rem' }}>{showForm ? '−' : '+'}</span>
                        {showForm ? 'Cancel' : 'Create Group'}
                    </button>
                </header>

                {/* Create Group Form */}
                {showForm && (
                    <div className={styles.formContainer}>
                        <h2 className={styles.formTitle}>Create New Group</h2>
                        <form onSubmit={handleCreateGroup}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Group Name</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    placeholder="e.g. Q1 Marketing Campaign"
                                    value={newGroup.name}
                                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Description</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    placeholder="What is this group for?"
                                    value={newGroup.description}
                                    onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                                />
                            </div>
                            <div className={styles.formActions}>
                                <button
                                    type="button"
                                    className={styles.cancelButton}
                                    onClick={() => setShowForm(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={styles.submitButton}
                                >
                                    Create Group
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className={styles.groupsGrid}>
                    {groups.map((group, index) => (
                        <div
                            key={group.id}
                            className={styles.groupCard}
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className={styles.cardHeader}>
                                <div
                                    className={styles.groupIcon}
                                    style={{ background: group.color }}
                                >
                                    {group.name.charAt(0)}
                                </div>
                                <button className={styles.moreButton}>•••</button>
                            </div>

                            <h3 className={styles.groupName}>{group.name}</h3>
                            <p className={styles.groupDesc}>{group.description}</p>

                            <div className={styles.progressContainer}>
                                <div className={styles.progressLabel}>
                                    <span>Progress</span>
                                    <span>{group.totalTasks > 0 ? getProgress(group.tasksCompleted, group.totalTasks) : 0}%</span>
                                </div>
                                <div className={styles.progressBar}>
                                    <div
                                        className={styles.progressFill}
                                        style={{
                                            width: `${group.totalTasks > 0 ? getProgress(group.tasksCompleted, group.totalTasks) : 0}%`,
                                        }}
                                    />
                                </div>
                            </div>

                            <div className={styles.cardFooter}>
                                <div className={styles.memberStack}>
                                    {group.members.slice(0, 3).map((initial, i) => (
                                        <div key={i} className={styles.memberAvatar}>
                                            {initial}
                                        </div>
                                    ))}
                                    {group.memberCount > 3 && (
                                        <div className={styles.memberAvatar} style={{ background: 'var(--surface-active)' }}>
                                            +{group.memberCount - 3}
                                        </div>
                                    )}
                                </div>
                                <span className={styles.activityStatus}>
                                    {group.lastActive}
                                </span>
                            </div>
                        </div>
                    ))}

                    {/* Add New Group Placeholder Card - also opens form */}
                    <div
                        className={styles.groupCard}
                        style={{
                            borderStyle: 'dashed',
                            background: 'var(--surface)',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            minHeight: '300px',
                            borderColor: 'var(--border-color)'
                        }}
                        onClick={() => setShowForm(true)}
                    >
                        <div
                            style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                background: 'var(--surface-active)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2rem',
                                color: 'var(--muted-foreground)',
                                marginBottom: '1rem',
                                border: '1px solid var(--border-color)'
                            }}
                        >
                            +
                        </div>
                        <h3 style={{ color: 'var(--muted-foreground)' }}>Join or Create Group</h3>
                    </div>
                </div>
            </main>
        </div>
        </ProtectedRoute>
    );
}
