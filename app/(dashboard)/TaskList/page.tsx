'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './taskList.module.css';
import ProtectedRoute from '../../components/ProtectedRoute';
import { ListChecks, Search, Filter, Calendar, FolderKanban, Edit, Trash2, Loader2, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

interface Task {
    taskid: number;
    title: string;
    description: string | null;
    priority: 'Low' | 'Medium' | 'High';
    status: 'Pending' | 'In Progress' | 'Done' | 'Completed';
    duedate: string | null;
    tasklists?: {
        listname: string;
        projects?: {
            projectname: string;
        }
    }
}

export default function TaskListPage() {
    const router = useRouter();
    const { user } = useAuth();
    const isAdmin = user?.roleid === 1;
    const [tasks, setTasks] = useState<Task[]>([]);
    const [taskLists, setTaskLists] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedListName, setSelectedListName] = useState<string>('All Lists');

    // Add Task List modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [projects, setProjects] = useState<any[]>([]);
    const [newListName, setNewListName] = useState("");
    const [selectedProjectId, setSelectedProjectId] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchTasks = async () => {
        try {
            const token = user?.token || localStorage.getItem('token');
            const res = await fetch("/api/task", {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setTasks(data);
            }
        } catch (error) {
            console.error("Failed to fetch tasks", error);
        }
    };

    const fetchTaskLists = async () => {
        try {
            const token = user?.token || localStorage.getItem('token');
            const res = await fetch("/api/tasklist", {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setTaskLists(data);
            }
        } catch (error) {
            console.error("Failed to fetch task lists", error);
        }
    };

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            const token = user?.token || localStorage.getItem('token');
            if (token) {
                await Promise.all([fetchTasks(), fetchTaskLists()]);
                if (isAdmin) {
                    await fetchProjects();
                }
            }
            setLoading(false);
        };
        init();
    }, [user, isAdmin]);

    const fetchProjects = async () => {
        try {
            const token = user?.token || localStorage.getItem('token');
            const res = await fetch("/api/project", {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setProjects(data);
                if (data.length > 0) setSelectedProjectId(data[0].projectid.toString());
            }
        } catch (error) {
            console.error("Failed to fetch projects", error);
        }
    };

    const handleDelete = async (taskId: number) => {
        if (!isAdmin) return;
        if (!confirm("Are you sure you want to delete this task?")) return;
        try {
            const res = await fetch(`/api/task/${taskId}`, { method: 'DELETE' });
            if (res.ok) {
                setTasks(prev => prev.filter(t => t.taskid !== taskId));
            }
        } catch (error) {
            console.error("Failed to delete task", error);
        }
    };

    const handleDeleteList = async (listId: number) => {
        if (!isAdmin) return;
        if (!confirm("Are you sure you want to delete this Entire Task List and all its tasks?")) return;
        try {
            const token = user?.token || localStorage.getItem('token');
            const res = await fetch(`/api/tasklist/${listId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                await Promise.all([fetchTasks(), fetchTaskLists()]);
            } else {
                const data = await res.json();
                alert(data.message || "Failed to delete task list");
            }
        } catch (error) {
            console.error("Failed to delete task list", error);
        }
    };

    // Extract unique list names from tasks and actual task lists
    const uniqueListNames = Array.from(new Set([
        ...tasks.map(t => t.tasklists?.listname || 'Unassigned'),
        ...taskLists.map(l => l.listname)
    ])).sort();

    const filteredTasks = tasks.filter(task => {
        // Search Filter
        const searchMatch = task.title.toLowerCase().includes(searchQuery.toLowerCase());

        // List Name Filter
        const listMatch = selectedListName === 'All Lists'
            ? true
            : (task.tasklists?.listname || 'Unassigned') === selectedListName;

        return searchMatch && listMatch;
    });

    // Final grouped structure using actual taskLists to ensure empty ones show up
    const groupedData = uniqueListNames
        .filter(name => selectedListName === 'All Lists' || name === selectedListName)
        .map(listName => {
            const listTasks = filteredTasks.filter(t => (t.tasklists?.listname || 'Unassigned') === listName);
            const listInfo = taskLists.find(l => l.listname === listName);
            return {
                listName,
                tasks: listTasks,
                projectName: listInfo?.projects?.projectname || 'Default',
                listId: listInfo?.listid
            };
        });
    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '4rem' }}>
                <Loader2 className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <div className={styles.container}>
                <header className={styles.header}>
                    <div className={styles.headerText}>
                        <h1 className={styles.title}>Task List</h1>
                        <p className={styles.subtitle}>All your tasks organized by list and project</p>
                    </div>
                    {isAdmin && (
                        <button className={styles.addBtn} onClick={() => setIsAddModalOpen(true)}>
                            <Plus size={20} strokeWidth={2.5} />
                            <span>Add Task List</span>
                        </button>
                    )}
                </header>

                <div className={styles.filters}>
                    <div className={styles.filterTabs}>
                        <div style={{ position: 'relative' }}>
                            <select
                                className={styles.filterTab}
                                style={{
                                    paddingRight: '2.5rem',
                                    appearance: 'none',
                                    outline: 'none',
                                    cursor: 'pointer',
                                    background: selectedListName !== 'All Lists' ? '#6366f1' : 'transparent',
                                    color: selectedListName !== 'All Lists' ? 'white' : 'inherit',
                                    borderColor: selectedListName !== 'All Lists' ? '#6366f1' : 'rgba(255,255,255,0.1)'
                                }}
                                value={selectedListName}
                                onChange={(e) => setSelectedListName(e.target.value)}
                            >
                                <option value="All Lists">All Lists</option>
                                {uniqueListNames.map(name => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                            </select>
                            <Filter size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.6 }} />
                        </div>
                    </div>

                    <div className={styles.searchContainer}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', zIndex: 1 }} />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            className={styles.searchInput}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>


                {groupedData.length === 0 ? (
                    <div className={styles.emptyState}>
                        <FolderKanban size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                        <p>No task lists found.</p>
                    </div>
                ) : (
                    groupedData.map(({ listName, tasks: listTasks, listId }) => (
                        <div key={listName} className={styles.listGroup}>
                            <div className={styles.listHeader}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                                    <FolderKanban size={24} style={{ color: '#6366f1' }} />
                                    <h2 className={styles.listTitle}>{listName}</h2>
                                    <span className={styles.taskCount}>{listTasks.length} {listTasks.length === 1 ? 'Task' : 'Tasks'}</span>
                                </div>
                                {isAdmin && listId && (
                                    <button
                                        className={styles.deleteListBtn}
                                        onClick={() => handleDeleteList(listId)}
                                        title="Delete List"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>

                            <div className={styles.taskGrid}>
                                {listTasks.length === 0 ? (
                                    <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.05)', color: 'var(--muted-foreground)', gridColumn: '1 / -1' }}>
                                        No tasks in this list yet.
                                    </div>
                                ) : (
                                    listTasks.map(task => (
                                        <div key={task.taskid} className={styles.taskCard}>
                                            <div className={styles.taskCardHeader}>
                                                <div className={styles.taskMainInfo}>
                                                    <span className={styles.idBadge}>#{task.taskid}</span>
                                                    <h3 className={styles.taskTitleText}>{task.title}</h3>
                                                </div>
                                                <div className={styles.taskActions}>
                                                    {isAdmin && (
                                                        <>
                                                            <button
                                                                className={styles.actionBtn}
                                                                onClick={() => router.push(`/MyTask/${task.taskid}/edit`)}
                                                                title="Edit Task"
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                            <button
                                                                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                                                onClick={() => handleDelete(task.taskid)}
                                                                title="Delete Task"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <div className={styles.taskMeta}>
                                                <span className={`${styles.badge} ${task.priority === 'High' ? styles.badgeHigh :
                                                    task.priority === 'Medium' ? styles.badgeMedium :
                                                        styles.badgeLow
                                                    }`}>
                                                    {task.priority}
                                                </span>
                                            </div>

                                            <div className={styles.cardFooter}>
                                                <div className={styles.dueDate}>
                                                    <Calendar size={14} />
                                                    <span>{task.duedate ? new Date(task.duedate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No deadline'}</span>
                                                </div>
                                                <div className={styles.projectTag}>
                                                    <FolderKanban size={14} />
                                                    <span>{task.tasklists?.projects?.projectname || 'Default'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    ))
                )}
                {/* Add Task List Modal */}
                {isAddModalOpen && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modal}>
                            <button className={styles.closeBtn} onClick={() => setIsAddModalOpen(false)}>
                                <X size={24} />
                            </button>
                            <div className={styles.modalHeader}>
                                <h2 className={styles.modalTitle}>Add New Task List</h2>
                            </div>
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                setIsSubmitting(true);
                                try {
                                    const token = user?.token || localStorage.getItem('token');
                                    const res = await fetch("/api/tasklist", {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'Authorization': `Bearer ${token}`
                                        },
                                        body: JSON.stringify({
                                            ProjectID: selectedProjectId,
                                            ListName: newListName
                                        })
                                    });

                                    if (res.ok) {
                                        setIsAddModalOpen(false);
                                        setNewListName("");
                                        // Reload tasks and lists
                                        await Promise.all([fetchTasks(), fetchTaskLists()]);
                                    } else {
                                        const data = await res.json();
                                        alert(data.message || "Failed to add task list");
                                    }
                                } catch (error) {
                                    console.error("Add task list error:", error);
                                } finally {
                                    setIsSubmitting(false);
                                }
                            }}>
                                <div className={styles.formGroup}>
                                    <label className={styles.modalLabel}>List Name</label>
                                    <input
                                        type="text"
                                        required
                                        className={styles.modalInput}
                                        placeholder="e.g. To Do, Done, Review"
                                        value={newListName}
                                        onChange={(e) => setNewListName(e.target.value)}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.modalLabel}>Select Project</label>
                                    <select
                                        required
                                        className={styles.modalSelect}
                                        value={selectedProjectId}
                                        onChange={(e) => setSelectedProjectId(e.target.value)}
                                    >
                                        {projects.map(p => (
                                            <option key={p.projectid} value={p.projectid}>{p.projectname}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles.formActions}>
                                    <button type="button" className={styles.cancelBtn} onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                                    <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                                        {isSubmitting ? "Creating..." : "Create List"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
