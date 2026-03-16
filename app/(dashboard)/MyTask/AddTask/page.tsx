"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Type, AlignLeft, Save, CheckSquare, AlertCircle, List, User } from "lucide-react";
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "listid" || name === "assignedto" ? (value === "" ? "" : Number(value)) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      setMessage("✅ Task created successfully!");
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
      <div className={styles.container} style={{ textAlign: 'center', padding: '4rem' }}>
        <h1 style={{ color: '#ef4444' }}>Access Denied</h1>
        <p>You do not have permission to create tasks. Only admins can create and assign tasks.</p>
        <button onClick={() => router.push('/MyTask')} style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer', background: '#e5e7eb', border: 'none', borderRadius: '4px' }}>Back to My Tasks</button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1>Create New Task</h1>
      <form onSubmit={handleSubmit} className={styles.formCard}>

        {/* IDs */}
        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label><List size={16} /> Select List</label>
            <select
              name="listid"
              value={formData.listid}
              onChange={handleChange}
              required
            >
              <option value="">Select a list</option>
              {taskLists.map(list => (
                <option key={list.listid} value={list.listid}>{list.listname}</option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label><User size={16} /> Assigned To</label>
            <select
              name="assignedto"
              value={formData.assignedto}
              onChange={handleChange}
              required
              disabled={!isAdmin}
            >
              <option value="">Select a user</option>
              {users.map(u => (
                <option key={u.userid} value={u.userid}>{u.username}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Title */}
        <div className={styles.formGroup}>
          <label><Type size={16} /> Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        {/* Description */}
        <div className={styles.formGroup}>
          <label><AlignLeft size={16} /> Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            required
          />
        </div>

        {/* Due date & Priority */}
        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label><Calendar size={16} /> Due Date</label>
            <input
              type="date"
              name="duedate"
              value={formData.duedate}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label><AlertCircle size={16} /> Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>

        {/* Status */}
        <div className={styles.formGroup}>
          <label><CheckSquare size={16} /> Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
          </select>
        </div>

        {/* Message */}
        {message && (
          <div style={{ margin: "1rem 0", padding: "0.5rem", background: message.startsWith("Error") ? "#f87171" : "#34d399", color: "white", borderRadius: "4px" }}>
            {message}
          </div>
        )}

        {/* Actions */}
        <div className={styles.actions}>
          <button type="button" onClick={() => router.back()}>Cancel</button>
          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : <><Save size={16} /> Create Task</>}
          </button>
        </div>

      </form>
    </div>
  );
}
