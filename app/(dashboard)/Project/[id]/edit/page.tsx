"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save } from 'lucide-react';
import styles from './editProject.module.css';
import { useAuth } from '../../../../context/AuthContext';

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        projectname: "",
        description: ""
    });

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const token = user?.token || localStorage.getItem('token');
                const res = await fetch(`/api/project/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!res.ok) throw new Error("Failed to fetch project");
                const data = await res.json();
                setFormData({
                    projectname: data.projectname,
                    description: data.description || ""
                });
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProject();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            const token = user?.token || localStorage.getItem('token');
            const res = await fetch(`/api/project/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to update project');
            }

            router.push('/Project');
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
            <h1 className={styles.title}>Edit Project</h1>

            <div className={styles.formCard}>
                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.formGroup}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Project Name</label>
                        <input
                            type="text"
                            required
                            className={styles.input}
                            placeholder="e.g. Website Redesign"
                            value={formData.projectname}
                            onChange={(e) => setFormData({ ...formData, projectname: e.target.value })}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Description</label>
                        <textarea
                            className={styles.textarea}
                            placeholder="Describe the project goals and scope..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                                Update Project
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
