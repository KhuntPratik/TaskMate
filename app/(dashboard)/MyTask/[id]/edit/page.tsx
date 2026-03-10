"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save } from 'lucide-react';
import styles from './editTask.module.css';
import { useAuth } from '../../../../context/AuthContext';

export default function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        priority: "Medium",
        status: "Pending",
        duedate: ""
    });

    useEffect(() => {
        const fetchTask = async () => {
            try {
                const token = user?.token || localStorage.getItem('token');
                const res = await fetch(`/api/task/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!res.ok) throw new Error("Failed to fetch task");
                const data = await res.json();

                // Format date for input type="date"
                let dateStr = "";
                if (data.duedate) {
                    const d = new Date(data.duedate);
                    dateStr = d.toISOString().split('T')[0];
                }

                setFormData({
                    title: data.title,
                    description: data.description || "",
                    priority: data.priority || "Medium",
                    status: data.status || "Pending",
                    duedate: dateStr
                });
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        if (user) fetchTask();
    }, [id, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            const token = user?.token || localStorage.getItem('token');
            const res = await fetch(`/api/task/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    duedate: formData.duedate ? new Date(formData.duedate).toISOString() : null
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to update task');
            }

            router.push('/MyTask');
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                <Loader2 className="animate-spin" size={40} />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Edit Task</h1>

            <div className={styles.formCard}>
                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.formGroup}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Task Title</label>
                        <input
                            type="text"
                            required
                            className={styles.input}
                            placeholder="e.g. Fix Navigation Bug"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Description</label>
                        <textarea
                            className={styles.textarea}
                            placeholder="Describe the task..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Priority</label>
                            <select
                                className={styles.select}
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            >
                                <option className={styles.selectoption} value="High">High</option>
                                <option className={styles.selectoption} value="Medium">Medium</option>
                                <option className={styles.selectoption} value="Low">Low</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Status</label>
                            <select
                                className={styles.select}
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option className={styles.selectoption} value="Pending">Pending</option>
                                <option className={styles.selectoption} value="In Progress">In Progress</option>
                                <option className={styles.selectoption} value="Completed">Completed</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Due Date</label>
                        <input
                            type="date"
                            className={styles.input}
                            value={formData.duedate}
                            onChange={(e) => setFormData({ ...formData, duedate: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Updating...
                            </>
                        ) : (
                            <>
                                <Save size={20} />
                                Update Task
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
