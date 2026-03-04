'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Plus, MoreVertical, Calendar, Loader2, FolderKanban } from 'lucide-react';
import styles from './project.module.css';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProjectPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState<any[]>([]);

    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await fetch("/api/project");
                const data = await res.json();
                setProjects(data);
            } catch (error) {
                console.error("Failed to fetch projects", error);
            } finally {
                setLoading(false);
            }
        }
        fetchProjects();
    }, [])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenuId(null);
            }
        };

        if (openMenuId !== null) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openMenuId]);

    // Navigation handler
    const handleCardClick = (projectId: number) => {
        router.push(`/Project/${projectId}`);
    };

    const toggleMenu = (e: React.MouseEvent, projectId: number) => {
        e.preventDefault();
        e.stopPropagation();
        setOpenMenuId(prev => prev === projectId ? null : projectId);
    };

    const handleDelete = async (e: React.MouseEvent, projectId: number) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this project?")) return;

        try {
            const res = await fetch(`/api/project/${projectId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setProjects(prev => prev.filter(p => p.projectid !== projectId));
                setOpenMenuId(null);
            } else {
                console.error("Failed to delete project");
                alert("Failed to delete project");
            }
        } catch (error) {
            console.error("Error deleting project:", error);
            alert("Error deleting project");
        }
    };

    const handleEdit = (e: React.MouseEvent, projectId: number) => {
        e.stopPropagation();
        setOpenMenuId(null);
        router.push(`/Project/${projectId}/edit`);
    };

    const handleShowTask = (e: React.MouseEvent, projectId: number) => {
        e.stopPropagation();
        setOpenMenuId(null);
        router.push(`/Project/${projectId}`);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleSection}>
                    <h1 className={styles.title}>Projects</h1>
                    <p className={styles.subtitle}>Manage and track your ongoing projects</p>
                </div>
                <Link href="/Project/AddProject" className={styles.addButton}>
                    <Plus size={20} />
                    <span>New Project</span>
                </Link>
            </header>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                    <Loader2 className="animate-spin text-primary" size={40} />
                </div>
            ) : (
                <div className={styles.grid}>
                    {projects.map((project: any) => (
                        <div
                            key={project.projectid}
                            className={styles.card}
                            style={{
                                zIndex: openMenuId === project.projectid ? 50 : 1,
                                cursor: 'pointer'
                            }}
                            onClick={() => handleCardClick(project.projectid)}
                        >
                            <div className={styles.cardTop}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                                    <div className={styles.projectIcon}>
                                        <FolderKanban size={24} />
                                    </div>
                                    <span className={styles.idBadge}>ID: {project.projectid}</span>
                                </div>
                                <div className={styles.moreButtonWrapper} ref={openMenuId === project.projectid ? menuRef : null}>
                                    <button
                                        className={styles.moreButton}
                                        onClick={(e) => toggleMenu(e, project.projectid)}
                                    >
                                        <MoreVertical size={20} />
                                    </button>

                                    {openMenuId === project.projectid && (
                                        <div className={styles.menuDropdown}>
                                            <button
                                                className={styles.menuItem}
                                                onClick={(e) => handleShowTask(e, project.projectid)}
                                            >
                                                <FolderKanban size={16} />
                                                Show Tasks
                                            </button>
                                            <button
                                                className={styles.menuItem}
                                                onClick={(e) => handleEdit(e, project.projectid)}
                                            >
                                                <MoreVertical size={16} />
                                                Edit
                                            </button>
                                            <button
                                                className={`${styles.menuItem} ${styles.delete}`}
                                                onClick={(e) => handleDelete(e, project.projectid)}
                                            >
                                                <MoreVertical size={16} style={{ transform: 'rotate(45deg)' }} />
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className={styles.cardContent}>
                                <h3>{project.projectname}</h3>
                                <p className={styles.description}>{project.description}</p>
                            </div>

                
                            <div className={styles.cardFooter}>
                                <div className={styles.avatars}>
                                    {project.members && project.members.map((member: string, i: number) => (
                                        <div
                                            key={i}
                                            className={styles.avatar}
                                            style={{ backgroundColor: `hsl(${Math.random() * 360}, 60%, 40%)` }}
                                        >
                                            {member}
                                        </div>
                                    ))}
                                </div>
                                <div className={styles.date}>
                                    <Calendar size={14} />
                                    <span>{project.createdat ? new Date(project.createdat).toLocaleDateString() : 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
