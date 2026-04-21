"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Type, AlignLeft, Save, CheckSquare, AlertCircle, List, User, Plus, ArrowLeft } from "lucide-react";
import styles from './addtask.module.css';
import { useAuth } from "../../../context/AuthContext";

type TaskForm = {
  listid: number | "";
  assignedto: number | "";
  title: string;
  description: string;
  priority: "Low" | "Medium" | "High";
  status: "Pending" | "In Progress";
  duedate: string;
};

export default function AddTaskPage() {
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.roleid === 1;

  const [formData, setFormData] = useState<TaskForm>({
    listid: "",
    assignedto: "",
    title: "",
    description: "",
    priority: "Medium",
    status: "Pending",
    duedate: ""
  });

  const [taskLists, setTaskLists] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Partial<TaskForm>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = user?.token || localStorage.getItem('token');
        if (!token) return;

        // Fetch Task Lists
        const listRes = await fetch("/api/tasklist", {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const listData = await listRes.json();
        if (Array.isArray(listData)) setTaskLists(listData);

        // Fetch Users (only if admin)
        if (isAdmin) {
          const userRes = await fetch("/api/user", {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const userData = await userRes.json();
          if (Array.isArray(userData)) setUsers(userData);
        } else if (user) {
          // If not admin, the only assignable user is themselves
          setUsers([{ userid: user.userid, username: user.email?.split('@')[0] || 'Me' }]);
          setFormData(prev => ({ ...prev, assignedto: user.userid || "" }));
        }
      } catch (error) {
        console.error("Failed to fetch form data", error);
      }
    };

    fetchData();
  }, [user, isAdmin]);

  const validateForm = (): boolean => {
    const newErrors: Partial<TaskForm> = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.listid) newErrors.listid = "Please select a task list";
    if (!formData.assignedto) newErrors.assignedto = "Please assign the task to someone";
    if (!formData.duedate) newErrors.duedate = "Due date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "listid" || name === "assignedto" ? (value === "" ? "" : Number(value)) : value
    }));

    // Clear error when user starts typing
    if (errors[name as keyof TaskForm]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setMessage("Please fix the errors below");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const token = user?.token || localStorage.getItem('token');
      const res = await fetch("/api/task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const text = await res.text(); // safe JSON parsing
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) {
        if (data.message && data.message.includes("Foreign Key")) {
          throw new Error("Invalid List ID or User ID provided.");
        }
        throw new Error(data.message || "Failed to create task");
      }

      setMessage("Task created successfully!");
      setFormData({
        listid: "",
        assignedto: isAdmin ? "" : (user?.userid || ""),
        title: "",
        description: "",
        priority: "Medium",
        status: "Pending",
        duedate: ""
      });

      setTimeout(() => router.push("/MyTask"), 1500);

    } catch (error: any) {
      console.error("Frontend Error:", error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className={styles.accessDenied}>
        <div className={styles.accessDeniedCard}>
          <AlertCircle size={48} className={styles.accessDeniedIcon} />
          <h1>Access Denied</h1>
          <p>You do not have permission to create tasks. Only admins can create and assign tasks.</p>
          <button onClick={() => router.push('/MyTask')} className={styles.backButton}>
            <ArrowLeft size={16} />
            Back to My Tasks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <button onClick={() => router.back()} className={styles.backButton}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1>Create New Task</h1>
            <p>Fill in the details below to create a new task</p>
          </div>
        </div>
      </div>

      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Task Details Section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <Type size={20} />
              <h2>Task Details</h2>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <Type size={16} />
                  Task Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
                  placeholder="Enter task title"
                />
                {errors.title && <span className={styles.errorText}>{errors.title}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <List size={16} />
                  Task List *
                </label>
                <select
                  name="listid"
                  value={formData.listid}
                  onChange={handleChange}
                  className={`${styles.select} ${errors.listid ? styles.selectError : ''}`}
                >
                  <option value="">Select a task list</option>
                  {taskLists.map(list => (
                    <option key={list.listid} value={list.listid}>{list.listname}</option>
                  ))}
                </select>
                {errors.listid && <span className={styles.errorText}>{errors.listid}</span>}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <AlignLeft size={16} />
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={`${styles.textarea} ${errors.description ? styles.textareaError : ''}`}
                placeholder="Describe the task in detail"
                rows={4}
              />
              {errors.description && <span className={styles.errorText}>{errors.description}</span>}
            </div>
          </div>

          {/* Assignment & Timeline Section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <User size={20} />
              <h2>Assignment & Timeline</h2>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <User size={16} />
                  Assigned To *
                </label>
                <select
                  name="assignedto"
                  value={formData.assignedto}
                  onChange={handleChange}
                  className={`${styles.select} ${errors.assignedto ? styles.selectError : ''}`}
                  disabled={!isAdmin}
                >
                  <option value="">Select a user</option>
                  {users.map(u => (
                    <option key={u.userid} value={u.userid}>{u.username}</option>
                  ))}
                </select>
                {errors.assignedto && <span className={styles.errorText}>{errors.assignedto}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <Calendar size={16} />
                  Due Date *
                </label>
                <input
                  type="date"
                  name="duedate"
                  value={formData.duedate}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.duedate ? styles.inputError : ''}`}
                />
                {errors.duedate && <span className={styles.errorText}>{errors.duedate}</span>}
              </div>
            </div>
          </div>

          {/* Priority & Status Section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <CheckSquare size={20} />
              <h2>Priority & Status</h2>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <AlertCircle size={16} />
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className={styles.select}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <CheckSquare size={16} />
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={styles.select}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                </select>
              </div>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className={`${styles.message} ${message.includes("Error") || message.includes("fix") ? styles.messageError : styles.messageSuccess}`}>
              {message}
            </div>
          )}

          {/* Actions */}
          <div className={styles.actions}>
            <button type="button" onClick={() => router.back()} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? (
                "Creating..."
              ) : (
                <>
                  <Plus size={16} />
                  Create Task
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
