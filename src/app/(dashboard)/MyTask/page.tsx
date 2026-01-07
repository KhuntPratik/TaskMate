'use client';
import { useState } from 'react';
import styles from './mytask.module.css';
import { useRouter } from 'next/navigation';

interface Task {
    id: number;
    title: string;
    category: string;
    dueDate: string;
    priority: 'High' | 'Medium' | 'Low';
    completed: boolean;
}

const DUMMY_TASKS: Task[] = [
    { id: 1, title: 'Finalize Project Proposal', category: 'Work', dueDate: 'Today', priority: 'High', completed: false },
    { id: 2, title: 'Buy Groceries', category: 'Personal', dueDate: 'Tomorrow', priority: 'Low', completed: false },
    { id: 3, title: 'Team Meeting', category: 'Work', dueDate: 'Jan 10', priority: 'Medium', completed: true },
    { id: 4, title: 'Renew Gym Membership', category: 'Health', dueDate: 'Jan 12', priority: 'Low', completed: false },
    { id: 5, title: 'Fix Login Bug', category: 'Dev', dueDate: 'Jan 08', priority: 'High', completed: false },
];

export default function MyTaskPage() {
    const router = useRouter();
    const [filter, setFilter] = useState<'All' | 'Pending' | 'Completed'>('All');

    const filteredTasks = DUMMY_TASKS.filter(task => {
        if (filter === 'All') return true;
        if (filter === 'Pending') return !task.completed;
        if (filter === 'Completed') return task.completed;
        return true;
    });

    return (
        <div className={styles.container}>
            {/* Sidebar REMOVED - handeled by Layout */}

            {/* Main Content */}
            <main className={styles.main}>
                <header className={styles.header}>
                    <h1 className={styles.title}>My Tasks</h1>
                    <button className={styles.newTaskBtn}>+ NEW TASK</button>
                </header>

                {/* Filter Tabs */}
                <div className={styles.filters}>
                    <div
                        className={`${styles.filterTab} ${filter === 'All' ? styles.filterActive : ''}`}
                        onClick={() => setFilter('All')}
                    >
                        All Tasks
                    </div>
                    <div
                        className={`${styles.filterTab} ${filter === 'Pending' ? styles.filterActive : ''}`}
                        onClick={() => setFilter('Pending')}
                    >
                        Pending
                    </div>
                    <div
                        className={`${styles.filterTab} ${filter === 'Completed' ? styles.filterActive : ''}`}
                        onClick={() => setFilter('Completed')}
                    >
                        Completed
                    </div>
                </div>

                {/* Task List */}
                <table className={styles.taskTable}>
                    <thead>
                        <tr>
                            <th className={styles.tableHeader}>Task Name</th>
                            <th className={styles.tableHeader}>Priority</th>
                            <th className={styles.tableHeader}>Due Date</th>
                            <th className={styles.tableHeader}>Category</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTasks.map(task => (
                            <tr key={task.id} className={styles.tableRow}>
                                <td className={`${styles.tableCell} ${task.completed ? styles.statusDone : styles.statusPending} ${styles.statusIndicator}`}>
                                    {task.title}
                                </td>
                                <td className={styles.tableCell}>
                                    <span className={`${styles.badge} ${task.priority === 'High' ? styles.badgeHigh :
                                        task.priority === 'Medium' ? styles.badgeMedium :
                                            styles.badgeLow
                                        }`}>
                                        {task.priority}
                                    </span>
                                </td>
                                <td className={styles.tableCell} style={{ opacity: 0.7 }}>{task.dueDate}</td>
                                <td className={styles.tableCell} style={{ opacity: 0.7 }}>{task.category}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </main>
        </div>
    );
}
