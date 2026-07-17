import React, { useState, useEffect } from 'react';
import { 
  CheckSquare,
  Lock,
  Menu,
  X,
  Plus,
  RotateCcw,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Folder,
  Layers,
  Calendar,
  ChevronRight,
  ShieldAlert,
  Clock,
  ExternalLink,
  Info,
  LayoutDashboard,
  KanbanSquare,
  User,
  LogOut,
  FolderKanban,
  CheckCircle2,
  Users,
  ArrowLeft,
  Briefcase,
  MessageSquare,
  Send,
  UserPlus
} from 'lucide-react';

const API_BASE = 'http://localhost:8000';

function App() {
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeProject, setActiveProject] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null); // Active task for details view modal
  const [newCommentText, setNewCommentText] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mousePos, setMousePos] = useState({ x: -500, y: -500 });

  // Login Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // App Data
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form States - Project Creation
  const [newProjName, setNewProjName] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjMembers, setNewProjMembers] = useState([]);

  // Form States - Task Creation
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskProject, setNewTaskProject] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskStatus, setNewTaskStatus] = useState('TODO');
  const [newTaskPriority, setNewTaskPriority] = useState('MEDIUM');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  // Form States - Edit Members inline
  const [editingMembers, setEditingMembers] = useState([]);

  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  // Fetch current user info
  const fetchUserProfile = async (authToken) => {
    try {
      const res = await fetch(`${API_BASE}/api/users/me/`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        handleLogout();
      }
    } catch (err) {
      console.error(err);
      handleLogout();
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserProfile(token);
    }
  }, [token]);

  useEffect(() => {
    if (token && user) {
      fetchData();
      fetchUsersList();
    }
  }, [token, user, activeTab]);

  useEffect(() => {
    if (activeProject && activeProject.members) {
      setEditingMembers(activeProject.members.map(m => m.id.toString()));
    }
  }, [activeProject]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      // Projects
      const projRes = await fetch(`${API_BASE}/api/projects/`, { headers });
      if (projRes.ok) {
        const projData = await projRes.json();
        setProjects(projData.results || projData);
      }

      // Tasks
      const tasksRes = await fetch(`${API_BASE}/api/tasks/`, { headers });
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData.results || tasksData);
      }
    } catch (err) {
      setError('Veriler yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersList = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/users/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsersList(data.results || data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProjectDetails = async (projId) => {
    try {
      const res = await fetch(`${API_BASE}/api/projects/${projId}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setActiveProject(data);
        setActiveTab('project-detail');
      }
    } catch (err) {
      console.error("Proje detay hatası:", err);
    }
  };

  const fetchTaskDetails = async (taskId) => {
    try {
      const res = await fetch(`${API_BASE}/api/tasks/${taskId}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedTask(data);
      }
    } catch (err) {
      console.error("Görev detay hatası:", err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        setToken(data.access);
        setEmail('');
        setPassword('');
      } else {
        setLoginError(data.detail || 'E-posta veya şifre hatalı.');
      }
    } catch (err) {
      setLoginError('Sunucu bağlantı hatası.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    if (token) {
      try {
        await fetch(`${API_BASE}/api/auth/logout/`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (err) {
        console.error("Logout blacklist error:", err);
      }
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setToken(null);
    setUser(null);
    setProjects([]);
    setTasks([]);
    setActiveTab('dashboard');
    setActiveProject(null);
    setSelectedTask(null);
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!newProjName) {
      setError('Lütfen proje adı girin.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/projects/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newProjName,
          description: newProjDesc,
          members: newProjMembers
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(`"${newProjName}" projesi başarıyla oluşturuldu.`);
        setNewProjName('');
        setNewProjDesc('');
        setNewProjMembers([]);
        fetchData();
      } else {
        setError(data.detail || Object.values(data).flat().join(' '));
      }
    } catch (err) {
      setError('Proje oluşturma sırasında bir hata oluştu.');
    }
  };

  const handleUpdateProjectMembers = async () => {
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_BASE}/api/projects/${activeProject.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ members: editingMembers })
      });
      if (res.ok) {
        setSuccess('Proje üyeleri güncellendi.');
        fetchProjectDetails(activeProject.id);
      } else {
        setError('Üyeler güncellenemedi.');
      }
    } catch (err) {
      setError('İşlem sırasında hata oluştu.');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!newTaskTitle || !newTaskProject) {
      setError('Lütfen görev başlığı ve projesini seçin.');
      return;
    }
    try {
      const payload = {
        title: newTaskTitle,
        description: newTaskDesc,
        project: newTaskProject,
        status: newTaskStatus,
        priority: newTaskPriority,
      };
      if (newTaskAssignee) payload.assigned_to = newTaskAssignee;
      if (newTaskDueDate) payload.due_date = newTaskDueDate;

      const res = await fetch(`${API_BASE}/api/tasks/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(`"${newTaskTitle}" görevi başarıyla oluşturuldu.`);
        setNewTaskTitle('');
        setNewTaskDesc('');
        setNewTaskProject('');
        setNewTaskAssignee('');
        setNewTaskDueDate('');
        fetchData();
      } else {
        setError(data.detail || Object.values(data).flat().join(' '));
      }
    } catch (err) {
      setError('Görev oluşturulamadı.');
    }
  };

  const handleUpdateTaskStatus = async (taskId, nextStatus) => {
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_BASE}/api/tasks/${taskId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        setSuccess('Görev durumu güncellendi.');
        fetchData();
        if (selectedTask && selectedTask.id === taskId) {
          fetchTaskDetails(taskId);
        }
      } else {
        const data = await res.json();
        setError(data.detail || 'Durum güncellenemedi.');
      }
    } catch (err) {
      setError('Bağlantı hatası.');
    }
  };

  // Self-complete task with comment option
  const handleCompleteTask = async (taskId) => {
    const commentText = prompt("Görevi tamamlamak için kapatma notu / yorum yazın (isteğe bağlı):");
    if (commentText === null) return; // Cancelled
    
    await handleUpdateTaskStatus(taskId, 'DONE');
    
    if (commentText.trim()) {
      try {
        await fetch(`${API_BASE}/api/tasks/${taskId}/comments/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ content: commentText })
        });
      } catch (e) {
        console.error(e);
      }
    }
    
    fetchData();
    if (selectedTask && selectedTask.id === taskId) {
      fetchTaskDetails(taskId);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || !selectedTask) return;
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/tasks/${selectedTask.id}/comments/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newCommentText })
      });
      if (res.ok) {
        setNewCommentText('');
        fetchTaskDetails(selectedTask.id);
      } else {
        setError('Yorum gönderilemedi.');
      }
    } catch (err) {
      setError('Hata oluştu.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Bu görevi silmek istediğinize emin misiniz?')) return;
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_BASE}/api/tasks/${taskId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setSuccess('Görev başarıyla silindi.');
        setSelectedTask(null);
        fetchData();
      } else {
        setError('Görev silinemedi.');
      }
    } catch (err) {
      setError('Hata oluştu.');
    }
  };

  const handleDeleteProject = async (projId) => {
    if (!window.confirm('Bu projeyi sildiğinizde projeye ait TÜM GÖREVLER de silinecektir. Devam etmek istiyor musunuz?')) return;
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_BASE}/api/projects/${projId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setSuccess('Proje başarıyla silindi.');
        if (activeProject && activeProject.id === projId) {
          setActiveProject(null);
          setActiveTab('projects');
        }
        fetchData();
      } else {
        setError('Proje silinemedi.');
      }
    } catch (err) {
      setError('Hata oluştu.');
    }
  };

  // Helper validation queries
  const getUserRoles = () => {
    if (!user || !user.roles) return [];
    return user.roles.map(r => typeof r === 'string' ? r : r.name);
  };
  const isManagerOrAdmin = user && (getUserRoles().includes("ADMIN") || getUserRoles().includes("MANAGER"));

  const getPriorityLabel = (priority) => {
    return {
      'HIGH': 'Yüksek',
      'MEDIUM': 'Orta',
      'LOW': 'Düşük',
    }[priority] || priority;
  };

  const getPriorityBadgeClass = (priority) => {
    return {
      'HIGH': 'bg-red-500/10 text-red-400 border border-red-500/20',
      'MEDIUM': 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      'LOW': 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    }[priority] || 'bg-gray-500/10 text-gray-400';
  };

  const getStatusLabel = (status) => {
    return {
      'TODO': 'Yapılacak',
      'IN_PROGRESS': 'Devam Ediyor',
      'IN_REVIEW': 'İncelemede',
      'DONE': 'Tamamlandı',
    }[status] || status;
  };

  const getStatusBadgeClass = (status) => {
    return {
      'TODO': 'bg-red-500/10 text-red-400 border border-red-500/20',
      'IN_PROGRESS': 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      'IN_REVIEW': 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      'DONE': 'bg-green-500/10 text-green-400 border border-green-500/20',
    }[status] || 'bg-gray-500/10 text-gray-400';
  };

  // Filter tasks based on role: normal users only see their own tasks on the general Kanban board
  const getFilteredTasks = () => {
    if (isManagerOrAdmin) {
      return tasks;
    }
    // Regular user sees only tasks assigned directly to them on the general board
    return tasks.filter(t => t.assigned_to === user.id);
  };

  // Login View
  if (!token || !user) {
    return (
      <div 
        onMouseMove={handleMouseMove}
        className="min-h-screen flex items-center justify-center bg-[#0d0e15] relative overflow-hidden px-4 grid-bg"
      >
        <div 
          className="pointer-events-none fixed w-[280px] h-[280px] rounded-full bg-purple-500/5 blur-[80px] transition-transform duration-75 z-0"
          style={{
            left: `${mousePos.x - 140}px`,
            top: `${mousePos.y - 140}px`
          }}
        />

        <div className="w-full max-w-md glass-card rounded-2xl p-8 space-y-6 relative z-10">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-purple-950/20 border border-purple-500/20 rounded-2xl text-purple-400 mb-2">
              <CheckSquare className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-wider uppercase">TaskFlow</h2>
            <p className="text-[10px] text-purple-400 font-extrabold tracking-widest">İŞ VE GÖREV YÖNETİM SİSTEMİ</p>
          </div>

          {loginError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs flex items-center gap-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">E-Posta Adresi</label>
              <input 
                type="email" 
                required
                placeholder="örn: manager@baykar.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full glass-input rounded-xl px-4 py-3 text-white placeholder-gray-700 focus:outline-none transition-all text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Şifre</label>
              <input 
                type="password" 
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full glass-input rounded-xl px-4 py-3 text-white placeholder-gray-700 focus:outline-none transition-all text-sm"
              />
            </div>

            <button 
              type="submit" 
              disabled={loginLoading}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50 text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="h-4 w-4" />
              {loginLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Jira/Linear Layout (Left Sidebar + Right Content Area)
  return (
    <div 
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-[#0d0e15] text-gray-200 flex relative overflow-hidden grid-bg"
    >
      <div 
        className="pointer-events-none fixed w-[300px] h-[300px] rounded-full bg-purple-500/5 blur-[100px] transition-transform duration-75 z-0"
        style={{
          left: `${mousePos.x - 150}px`,
          top: `${mousePos.y - 150}px`
        }}
      />

      {/* JIRA SIDEBAR (Left Navigation) */}
      <aside className={`fixed md:relative top-0 bottom-0 left-0 z-40 w-64 bg-[#11121d] border-r border-purple-500/10 flex flex-col justify-between transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 space-y-6">
          {/* Workspace Title */}
          <div className="flex items-center justify-between border-b border-purple-500/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-950/20 border border-purple-500/20 rounded-xl text-purple-400">
                <CheckSquare className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">TaskFlow Workspace</h2>
                <p className="text-[9px] text-gray-400 uppercase tracking-widest">PROJELER & GÖREVLER</p>
              </div>
            </div>
            {/* Mobile close sidebar */}
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 md:hidden bg-[#1b1c2b] border border-purple-500/10 rounded-lg text-gray-400 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1.5">
            <button 
              onClick={() => { setActiveTab('dashboard'); setActiveProject(null); setSelectedTask(null); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'dashboard' ? 'bg-[#1b1c2b] text-purple-400 border-l-2 border-purple-500 font-extrabold' : 'text-gray-400 hover:bg-white/5 hover:text-white border-l-2 border-transparent'}`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </button>

            <button 
              onClick={() => { setActiveTab('projects'); setActiveProject(null); setSelectedTask(null); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'projects' || activeTab === 'project-detail' ? 'bg-[#1b1c2b] text-purple-400 border-l-2 border-purple-500 font-extrabold' : 'text-gray-400 hover:bg-white/5 hover:text-white border-l-2 border-transparent'}`}
            >
              <FolderKanban className="h-4 w-4" />
              Projeler
            </button>

            <button 
              onClick={() => { setActiveTab('kanban'); setActiveProject(null); setSelectedTask(null); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'kanban' ? 'bg-[#1b1c2b] text-purple-400 border-l-2 border-purple-500 font-extrabold' : 'text-gray-400 hover:bg-white/5 hover:text-white border-l-2 border-transparent'}`}
            >
              <KanbanSquare className="h-4 w-4" />
              Görev Tahtası
            </button>
          </div>
        </div>

        {/* User profile & Logout */}
        <div className="p-4 border-t border-purple-500/10 bg-[#12131e]/50 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-8 w-8 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-extrabold shrink-0">
              <User className="h-4 w-4" />
            </div>
            <div className="text-left overflow-hidden">
              <div className="text-xs font-bold text-white truncate">{user.email}</div>
              <div className="text-[8px] text-purple-400 font-bold uppercase tracking-wider truncate">{getUserRoles().join(', ')}</div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 bg-[#1b1c2b] hover:bg-red-500/15 hover:text-red-400 border border-purple-500/10 rounded-xl transition-all cursor-pointer shrink-0"
            title="Çıkış Yap"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </aside>

      {/* WORKSPACE CONTENT AREA (Right Panel) */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Control Bar */}
        <header className="bg-[#11121d] border-b border-purple-500/10 px-6 py-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 bg-[#1b1c2b] border border-purple-500/10 rounded-xl text-gray-300 md:hidden cursor-pointer"
            >
              <Menu className="h-4 w-4" />
            </button>

            {/* Breadcrumb path */}
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
              <span>TaskFlow</span>
              <ChevronRight className="h-3 w-3" />
              {activeProject ? (
                <>
                  <span className="cursor-pointer hover:text-white" onClick={() => { setActiveProject(null); setActiveTab('projects'); }}>PROJELER</span>
                  <ChevronRight className="h-3 w-3" />
                  <span className="text-white font-extrabold">{activeProject.name.toUpperCase()}</span>
                </>
              ) : (
                <span className="text-white font-extrabold">
                  {activeTab === 'dashboard' ? 'DASHBOARD' : activeTab === 'projects' ? 'PROJELER' : 'GÖREV TAHTASI'}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={fetchData}
              className="p-2 bg-[#1b1c2b] hover:bg-white/5 border border-purple-500/10 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
              title="Yenile"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </header>

        {/* Content Pane */}
        <main className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl w-full mx-auto relative z-10">

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs font-semibold flex items-start gap-3 backdrop-blur-md">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold uppercase tracking-wider">İşlem Başarısız</div>
                <div className="mt-0.5 opacity-90">{error}</div>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl text-xs font-semibold flex items-start gap-3 backdrop-blur-md">
              <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold uppercase tracking-wider">İşlem Başarılı</div>
                <div className="mt-0.5 opacity-90">{success}</div>
              </div>
            </div>
          )}

          {/* TAB: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Metric Counters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="glass-card rounded-xl p-5 flex items-center justify-between border-l-4 border-l-purple-500">
                  <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Toplam Proje</div>
                    <div className="text-3xl font-black text-white mt-1">{projects.length}</div>
                  </div>
                  <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/10">
                    <Folder className="h-5 w-5" />
                  </div>
                </div>

                <div className="glass-card rounded-xl p-5 flex items-center justify-between border-l-4 border-l-amber-500">
                  <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Aktif Görevler</div>
                    <div className="text-3xl font-black text-amber-400 mt-1">
                      {tasks.filter(t => t.status !== 'DONE').length}
                    </div>
                  </div>
                  <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/10">
                    <Clock className="h-5 w-5" />
                  </div>
                </div>

                <div className="glass-card rounded-xl p-5 flex items-center justify-between border-l-4 border-l-green-500">
                  <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Tamamlanan Görevler</div>
                    <div className="text-3xl font-black text-green-400 mt-1">
                      {tasks.filter(t => t.status === 'DONE').length}
                    </div>
                  </div>
                  <div className="p-3 bg-green-500/10 text-green-400 rounded-xl border border-green-500/10">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                </div>
              </div>

              {/* Projects Overview Grid */}
              <div className="glass-card rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Folder className="h-4 w-4 text-purple-400" /> Aktif Projeler
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects.map(proj => (
                    <div key={proj.id} className="bg-[#12131e]/50 border border-purple-500/10 p-4 rounded-xl flex items-center justify-between hover:border-purple-500/30 transition-all">
                      <div>
                        <div className="text-sm font-bold text-white">{proj.name}</div>
                        <div className="text-xs text-gray-400 mt-1 line-clamp-1">{proj.description || 'Açıklama belirtilmemiş.'}</div>
                        <div className="text-[9px] text-purple-400 font-bold uppercase tracking-wider mt-2">{proj.owner_email}</div>
                      </div>
                      <button 
                        onClick={() => fetchProjectDetails(proj.id)}
                        className="px-3 py-1.5 bg-[#1b1c2b] border border-purple-500/10 rounded-lg text-xs text-purple-400 hover:text-white transition-colors cursor-pointer"
                      >
                        Yönet &rarr;
                      </button>
                    </div>
                  ))}
                  {projects.length === 0 && (
                    <div className="col-span-2 text-center text-gray-500 py-6">Kayıtlı proje bulunmadı.</div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB: PROJECTS LIST */}
          {activeTab === 'projects' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                
                {/* List Pane */}
                <div className="flex-1 space-y-4">
                  <h2 className="text-lg font-bold text-white uppercase tracking-wider">Proje Listesi</h2>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {projects.map(proj => (
                      <div key={proj.id} className="glass-card rounded-2xl p-5 space-y-4 hover:border-purple-500/30 transition-all">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-base font-bold text-white">{proj.name}</h3>
                            <p className="text-xs text-gray-400 mt-1">{proj.description || 'Açıklama belirtilmemiş.'}</p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => fetchProjectDetails(proj.id)}
                              className="px-3 py-1.5 bg-[#1b1c2b] border border-purple-500/10 rounded-lg text-xs text-purple-400 hover:text-white transition-all cursor-pointer"
                            >
                              Detayları Gör
                            </button>
                            {isManagerOrAdmin && (
                              <button 
                                onClick={() => handleDeleteProject(proj.id)}
                                className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-all cursor-pointer"
                                title="Projeyi Sil"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-purple-500/10 pt-3 text-[10px] text-gray-400">
                          <div>Oluşturan: <span className="text-purple-400 font-bold">{proj.owner_email}</span></div>
                          <div>Ekip Üyeleri: <span className="text-white font-bold">{proj.members_count || 0} Kişi</span></div>
                        </div>
                      </div>
                    ))}
                    {projects.length === 0 && (
                      <div className="text-center text-gray-500 py-8">Kayıtlı proje bulunmamaktadır.</div>
                    )}
                  </div>
                </div>

                {/* Create Project Form */}
                <div className="w-full md:w-80 glass-card rounded-2xl p-6 space-y-4 self-start">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Folder className="h-4 w-4 text-purple-400" />
                    Yeni Proje Tanımla
                  </h3>

                  {isManagerOrAdmin ? (
                    <form onSubmit={handleCreateProject} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Proje Adı</label>
                        <input 
                          type="text" 
                          required
                          placeholder="örn: İHA Geliştirme Çalışması"
                          value={newProjName}
                          onChange={(e) => setNewProjName(e.target.value)}
                          className="w-full glass-input rounded-xl px-3 py-2 text-white placeholder-gray-700 focus:outline-none transition-all text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Açıklama</label>
                        <textarea 
                          placeholder="Projenin hedefleri ve amacı..."
                          value={newProjDesc}
                          onChange={(e) => setNewProjDesc(e.target.value)}
                          className="w-full glass-input rounded-xl px-3 py-2 text-white placeholder-gray-700 focus:outline-none transition-all text-xs h-20 resize-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Ekip Üyeleri</label>
                        <select 
                          multiple
                          value={newProjMembers}
                          onChange={(e) => {
                            const opts = Array.from(e.target.selectedOptions, option => option.value);
                            setNewProjMembers(opts);
                          }}
                          className="w-full bg-[#0d0e15]/60 border border-purple-500/15 rounded-xl p-2 text-white text-xs focus:outline-none focus:border-purple-500 h-24"
                        >
                          {usersList.filter(u => u.email !== user.email).map(u => (
                            <option key={u.id} value={u.id}>{u.email}</option>
                          ))}
                        </select>
                        <div className="text-[8px] text-gray-500">Çoklu üye seçimi için CTRL tuşuna basın.</div>
                      </div>

                      <button 
                        type="submit"
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" /> Projeyi Kaydet
                      </button>
                    </form>
                  ) : (
                    <div className="bg-purple-950/20 border border-purple-500/10 rounded-xl p-4 text-xs text-purple-300 text-center leading-relaxed">
                      Yeni bir proje oluşturmak için yetkiniz bulunmamaktadır. Sadece <strong>Admin</strong> ve <strong>Manager</strong> rollerindeki hesaplar proje oluşturabilir.
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB: PROJECT DETAIL PAGE */}
          {activeTab === 'project-detail' && activeProject && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Back & Title Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-500/10 pb-4">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => { setActiveProject(null); setActiveTab('projects'); }}
                    className="p-2 bg-[#1b1c2b] border border-purple-500/10 rounded-xl text-gray-400 hover:text-white transition-colors cursor-pointer"
                    title="Geri Dön"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <div>
                    <h2 className="text-xl font-bold text-white uppercase tracking-wider">{activeProject.name}</h2>
                    <p className="text-xs text-gray-400 mt-1">{activeProject.description || 'Açıklama belirtilmemiş.'}</p>
                  </div>
                </div>
                
                {isManagerOrAdmin && (
                  <button 
                    onClick={() => handleDeleteProject(activeProject.id)}
                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Projeyi Sil
                  </button>
                )}
              </div>

              {/* Owner & Members Info Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Owner Card */}
                <div className="glass-card rounded-xl p-5 space-y-3 col-span-1">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <User className="h-4 w-4 text-purple-400" /> Proje Yöneticisi
                  </h3>
                  <div className="bg-[#12131e]/50 border border-purple-500/10 p-3 rounded-lg text-xs">
                    <div className="font-semibold text-white truncate">{activeProject.owner_email}</div>
                    <div className="text-[9px] text-purple-400 uppercase font-black tracking-widest mt-1">PROJE SAHİBİ</div>
                  </div>
                </div>

                {/* Team Members List (Visible to all project members) */}
                <div className="glass-card rounded-xl p-5 space-y-3 col-span-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-400" /> Projedeki Ekip Üyeleri ({activeProject.members ? activeProject.members.length : 0})
                  </h3>
                  <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-1">
                    {activeProject.members && activeProject.members.map(m => (
                      <span key={m.id} className="bg-purple-950/30 border border-purple-500/10 px-2.5 py-1 rounded-lg text-xs text-purple-300">
                        {m.email}
                      </span>
                    ))}
                    {(!activeProject.members || activeProject.members.length === 0) && (
                      <div className="text-xs text-gray-500 italic">Bu projeye atanmış başka bir ekip üyesi bulunmamaktadır.</div>
                    )}
                  </div>

                  {/* Manager update members widget */}
                  {(isManagerOrAdmin || activeProject.owner_email === user.email) && (
                    <div className="border-t border-purple-500/10 pt-3 flex gap-2 items-center">
                      <select 
                        multiple
                        value={editingMembers}
                        onChange={(e) => {
                          const opts = Array.from(e.target.selectedOptions, option => option.value);
                          setEditingMembers(opts);
                        }}
                        className="bg-[#0d0e15]/60 border border-purple-500/15 rounded-lg p-1 text-white text-[10px] focus:outline-none h-14 flex-1"
                      >
                        {usersList.filter(u => u.email !== user.email).map(u => (
                          <option key={u.id} value={u.id}>{u.email}</option>
                        ))}
                      </select>
                      <button 
                        onClick={handleUpdateProjectMembers}
                        className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-[10px] transition-all cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        <UserPlus className="h-3 w-3" /> Ekibi Güncelle
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Tasks Breakdown Table */}
              <div className="glass-card rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Layers className="h-4 w-4 text-purple-400" /> Görev Havuzu Tablosu
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-purple-500/10 text-gray-400 font-bold uppercase tracking-wider">
                        <th className="pb-3 pr-4">Görev</th>
                        <th className="pb-3 px-4">Atanan</th>
                        <th className="pb-3 px-4">Durum</th>
                        <th className="pb-3 px-4">Öncelik</th>
                        <th className="pb-3 px-4 text-center">Atanma Tarihi</th>
                        <th className="pb-3 px-4 text-center">Teslim Tarihi</th>
                        <th className="pb-3 pl-4 text-right">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-500/5">
                      {tasks.filter(t => t.project === activeProject.id).map(task => (
                        <tr key={task.id} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => fetchTaskDetails(task.id)}>
                          <td className="py-3 pr-4 font-semibold text-white">
                            <span className="hover:text-purple-400 transition-colors">{task.title}</span>
                            {task.description && <div className="text-[10px] text-gray-500 font-normal mt-0.5 line-clamp-1">{task.description}</div>}
                          </td>
                          <td className="py-3 px-4 text-gray-300 font-medium">
                            {task.assigned_to_name || 'Atanmamış'}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${getStatusBadgeClass(task.status)}`}>
                              {getStatusLabel(task.status)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${getPriorityBadgeClass(task.priority)}`}>
                              {getPriorityLabel(task.priority)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center text-gray-400">
                            {task.created_at ? new Date(task.created_at).toLocaleDateString("tr-TR") : 'Belirtilmemiş'}
                          </td>
                          <td className="py-3 px-4 text-center text-gray-400">
                            {task.due_date ? new Date(task.due_date).toLocaleDateString("tr-TR") : 'Belirtilmemiş'}
                          </td>
                          <td className="py-3 pl-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                            {/* Inline quick transitions */}
                            {task.status === 'TODO' && (
                              <button 
                                onClick={() => handleUpdateTaskStatus(task.id, 'IN_PROGRESS')}
                                className="text-purple-400 hover:text-white font-bold transition-all cursor-pointer"
                              >
                                Başlat
                              </button>
                            )}
                            {task.status === 'IN_PROGRESS' && (
                              <button 
                                onClick={() => handleUpdateTaskStatus(task.id, 'IN_REVIEW')}
                                className="text-purple-400 hover:text-white font-bold transition-all cursor-pointer"
                              >
                                İncelemeye Gönder
                              </button>
                            )}
                            {task.status === 'IN_REVIEW' && (
                              (isManagerOrAdmin || activeProject.owner_email === user.email || task.assigned_to === user.id) ? (
                                <button 
                                  onClick={() => handleCompleteTask(task.id)}
                                  className="text-green-400 hover:text-white font-bold transition-all cursor-pointer"
                                >
                                  Tamamla
                                </button>
                              ) : (
                                <span className="text-gray-500 italic">Onay Bekliyor</span>
                              )
                            )}
                            {isManagerOrAdmin && (
                              <button 
                                onClick={() => handleDeleteTask(task.id)}
                                className="text-red-400 hover:text-red-300 transition-all cursor-pointer pl-2"
                                title="Görevi Sil"
                              >
                                Sil
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {tasks.filter(t => t.project === activeProject.id).length === 0 && (
                        <tr>
                          <td colSpan="7" className="py-6 text-center text-gray-500 italic">Bu projeye ait henüz görev eklenmemiş.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB: KANBAN BOARD */}
          {activeTab === 'kanban' && (
            <div className="space-y-6">
              
              {/* Quick Task Creation Panel */}
              <div className="glass-card rounded-2xl p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-purple-400" />
                  Hızlı Görev Ekle
                </h3>

                <form onSubmit={handleCreateTask} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Görev Başlığı</label>
                    <input 
                      type="text" 
                      required
                      placeholder="örn: Kanat CFD Analizi"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="w-full glass-input rounded-xl px-3 py-2 text-white placeholder-gray-700 focus:outline-none transition-all text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Proje</label>
                    <select 
                      required
                      value={newTaskProject}
                      onChange={(e) => setNewTaskProject(e.target.value)}
                      className="w-full glass-input rounded-xl px-3 py-2 text-white focus:outline-none transition-all text-xs font-semibold"
                    >
                      <option value="">-- Seçiniz --</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Atanan Personel</label>
                    <select 
                      value={newTaskAssignee}
                      onChange={(e) => setNewTaskAssignee(e.target.value)}
                      className="w-full glass-input rounded-xl px-3 py-2 text-white focus:outline-none transition-all text-xs font-semibold"
                    >
                      <option value="">-- Seçilmedi --</option>
                      {usersList.map(u => (
                        <option key={u.id} value={u.id}>{u.email}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Öncelik</label>
                      <select 
                        value={newTaskPriority}
                        onChange={(e) => setNewTaskPriority(e.target.value)}
                        className="w-full glass-input rounded-xl px-3 py-2 text-white focus:outline-none transition-all text-xs font-semibold"
                      >
                        <option value="LOW">Düşük</option>
                        <option value="MEDIUM">Orta</option>
                        <option value="HIGH">Yüksek</option>
                      </select>
                    </div>
                    <button 
                      type="submit"
                      className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded-xl transition-all text-xs flex items-center justify-center gap-1 active:scale-95 self-end cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Görevi Kaydet
                    </button>
                  </div>
                </form>
              </div>

              {/* Kanban Columns */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* Column: TODO */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b-2 border-red-500/40 pb-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                      YAPILACAKLAR
                    </h4>
                    <span className="bg-[#1b1c2b] text-gray-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {getFilteredTasks().filter(t => t.status === 'TODO').length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {getFilteredTasks().filter(t => t.status === 'TODO').map(task => (
                      <div key={task.id} onClick={() => fetchTaskDetails(task.id)} className={`glass-card rounded-xl p-4 space-y-3 cursor-pointer hover:-translate-y-0.5 transition-all ${task.priority === 'HIGH' ? 'priority-high' : task.priority === 'MEDIUM' ? 'priority-medium' : 'priority-low'}`}>
                        <div>
                          <div className="text-xs font-bold text-white hover:text-purple-400 transition-colors">{task.title}</div>
                          <div className="text-[9px] text-purple-400 uppercase tracking-widest mt-1">{task.project_name}</div>
                        </div>
                        <div className="flex items-center justify-between border-t border-purple-500/10 pt-2 text-[10px] text-gray-400" onClick={(e) => e.stopPropagation()}>
                          <div>{task.assigned_to_name || 'Atanmamış'}</div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleUpdateTaskStatus(task.id, 'IN_PROGRESS')}
                              className="text-purple-400 hover:text-white transition-colors cursor-pointer"
                            >
                              Başlat
                            </button>
                            {isManagerOrAdmin && (
                              <button 
                                onClick={() => handleDeleteTask(task.id)}
                                className="text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                              >
                                Sil
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column: IN_PROGRESS */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b-2 border-amber-500/40 pb-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                      DEVAM EDENLER
                    </h4>
                    <span className="bg-[#1b1c2b] text-gray-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {getFilteredTasks().filter(t => t.status === 'IN_PROGRESS').length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {getFilteredTasks().filter(t => t.status === 'IN_PROGRESS').map(task => (
                      <div key={task.id} onClick={() => fetchTaskDetails(task.id)} className={`glass-card rounded-xl p-4 space-y-3 cursor-pointer hover:-translate-y-0.5 transition-all ${task.priority === 'HIGH' ? 'priority-high' : task.priority === 'MEDIUM' ? 'priority-medium' : 'priority-low'}`}>
                        <div>
                          <div className="text-xs font-bold text-white hover:text-purple-400 transition-colors">{task.title}</div>
                          <div className="text-[9px] text-purple-400 uppercase tracking-widest mt-1">{task.project_name}</div>
                        </div>
                        <div className="flex items-center justify-between border-t border-purple-500/10 pt-2 text-[10px] text-gray-400" onClick={(e) => e.stopPropagation()}>
                          <div>{task.assigned_to_name}</div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleUpdateTaskStatus(task.id, 'IN_REVIEW')}
                              className="text-purple-400 hover:text-white transition-colors cursor-pointer"
                            >
                              İncele
                            </button>
                            {isManagerOrAdmin && (
                              <button 
                                onClick={() => handleDeleteTask(task.id)}
                                className="text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                              >
                                Sil
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column: IN_REVIEW */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b-2 border-blue-500/40 pb-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      İNCELEMEDE
                    </h4>
                    <span className="bg-[#1b1c2b] text-gray-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {getFilteredTasks().filter(t => t.status === 'IN_REVIEW').length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {getFilteredTasks().filter(t => t.status === 'IN_REVIEW').map(task => (
                      <div key={task.id} onClick={() => fetchTaskDetails(task.id)} className={`glass-card rounded-xl p-4 space-y-3 cursor-pointer hover:-translate-y-0.5 transition-all ${task.priority === 'HIGH' ? 'priority-high' : task.priority === 'MEDIUM' ? 'priority-medium' : 'priority-low'}`}>
                        <div>
                          <div className="text-xs font-bold text-white hover:text-purple-400 transition-colors">{task.title}</div>
                          <div className="text-[9px] text-purple-400 uppercase tracking-widest mt-1">{task.project_name}</div>
                        </div>
                        <div className="flex items-center justify-between border-t border-purple-500/10 pt-2 text-[10px] text-gray-400" onClick={(e) => e.stopPropagation()}>
                          <div>{task.assigned_to_name}</div>
                          <div className="flex items-center gap-2">
                            {/* Done transition (Allowed for assignee, owner, manager) */}
                            {isManagerOrAdmin || task.project_owner_email === user.email || task.assigned_to === user.id ? (
                              <button 
                                onClick={() => handleCompleteTask(task.id)}
                                className="text-green-400 hover:text-white transition-colors cursor-pointer"
                              >
                                Tamamla
                              </button>
                            ) : (
                              <span className="text-gray-500 italic">Onay Bekliyor</span>
                            )}
                            {isManagerOrAdmin && (
                              <button 
                                onClick={() => handleDeleteTask(task.id)}
                                className="text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                              >
                                Sil
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column: DONE */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b-2 border-green-500/40 pb-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      TAMAMLANANLAR
                    </h4>
                    <span className="bg-[#1b1c2b] text-gray-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {getFilteredTasks().filter(t => t.status === 'DONE').length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {getFilteredTasks().filter(t => t.status === 'DONE').map(task => (
                      <div key={task.id} onClick={() => fetchTaskDetails(task.id)} className="glass-card rounded-xl p-4 space-y-3 border-l-4 border-l-green-500 cursor-pointer hover:-translate-y-0.5 transition-all">
                        <div>
                          <div className="text-xs font-bold text-white line-through opacity-60 hover:text-purple-400 transition-colors">{task.title}</div>
                          <div className="text-[9px] text-purple-400 uppercase tracking-widest mt-1 opacity-60">{task.project_name}</div>
                        </div>
                        <div className="flex items-center justify-between border-t border-purple-500/10 pt-2 text-[10px] text-gray-400" onClick={(e) => e.stopPropagation()}>
                          <div className="opacity-60">{task.assigned_to_name}</div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleUpdateTaskStatus(task.id, 'IN_REVIEW')}
                              className="text-purple-400 hover:text-white transition-colors cursor-pointer text-[10px]"
                              title="Görevi İncelemeye Geri Al"
                            >
                              Geri Al
                            </button>
                            {isManagerOrAdmin && (
                              <button 
                                onClick={() => handleDeleteTask(task.id)}
                                className="text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                              >
                                Sil
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

        </main>
      </div>

      {/* DETAILED TASK SIDE-PANEL MODAL (Jira-style Side Drawer) */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
          {/* Dismiss trigger */}
          <div className="absolute inset-0" onClick={() => setSelectedTask(null)} />

          <div className="relative w-full max-w-2xl h-full bg-[#11121d] border-l border-purple-500/10 shadow-2xl flex flex-col justify-between z-10 animate-slideLeft">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-purple-500/10 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] font-bold text-purple-400 uppercase tracking-widest">
                <Briefcase className="h-3.5 w-3.5" />
                <span>{selectedTask.project.name}</span>
                <ChevronRight className="h-3 w-3 text-gray-600" />
                <span className="text-gray-400">GÖREV DETAYI</span>
              </div>
              <button 
                onClick={() => setSelectedTask(null)}
                className="p-1.5 bg-[#1b1c2b] border border-purple-500/10 hover:border-purple-500/30 rounded-lg text-gray-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col md:flex-row gap-6">
              
              {/* Left Column (Content & Comments) */}
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white leading-tight">{selectedTask.title}</h3>
                  <div className="text-xs text-gray-400 mt-2 font-medium leading-relaxed bg-[#1b1c2b]/30 p-3 rounded-lg border border-purple-500/5">
                    {selectedTask.description || 'Bu görev için detaylı açıklama girilmemiş.'}
                  </div>
                </div>

                {/* Status Rollback Dropdown / Action Row */}
                {(isManagerOrAdmin || selectedTask.assigned_to === user.id) && (
                  <div className="bg-[#1b1c2b]/30 border border-purple-500/10 p-4 rounded-xl space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Görev Aşamasını Güncelle / Geri Al</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedTask.status !== 'TODO' && (
                        <button 
                          onClick={() => handleUpdateTaskStatus(selectedTask.id, 'TODO')}
                          className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-md text-[10px] font-bold transition-all cursor-pointer"
                        >
                          Yapılacaklar'a Çek
                        </button>
                      )}
                      {selectedTask.status !== 'IN_PROGRESS' && (
                        <button 
                          onClick={() => handleUpdateTaskStatus(selectedTask.id, 'IN_PROGRESS')}
                          className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-md text-[10px] font-bold transition-all cursor-pointer"
                        >
                          Devam Edenler'e Çek
                        </button>
                      )}
                      {selectedTask.status !== 'IN_REVIEW' && (
                        <button 
                          onClick={() => handleUpdateTaskStatus(selectedTask.id, 'IN_REVIEW')}
                          className="px-2.5 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-md text-[10px] font-bold transition-all cursor-pointer"
                        >
                          İnceleme'ye Çek
                        </button>
                      )}
                      {selectedTask.status !== 'DONE' && (
                        (isManagerOrAdmin || selectedTask.project_owner_email === user.email || selectedTask.assigned_to === user.id) ? (
                          <button 
                            onClick={() => handleCompleteTask(selectedTask.id)}
                            className="px-2.5 py-1 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-md text-[10px] font-bold transition-all cursor-pointer"
                          >
                            Tamamlandı Yap
                          </button>
                        ) : (
                          <span className="text-[10px] text-gray-500 italic self-center">Tamamlama için Yetki veya Yönetici Onayı Gerekli</span>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Task Comments Section */}
                <div className="space-y-4 border-t border-purple-500/10 pt-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-purple-400" />
                    Görev Yorumları ({selectedTask.comments ? selectedTask.comments.length : 0})
                  </h4>

                  {/* Comments List */}
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                    {selectedTask.comments && selectedTask.comments.map(comment => (
                      <div key={comment.id} className="bg-[#12131e]/50 border border-purple-500/5 p-3 rounded-lg text-xs space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold">
                          <span className="text-purple-400">{comment.author_email}</span>
                          <span>{new Date(comment.created_at).toLocaleString("tr-TR")}</span>
                        </div>
                        <p className="text-gray-300 font-medium leading-relaxed">{comment.content}</p>
                      </div>
                    ))}
                    {(!selectedTask.comments || selectedTask.comments.length === 0) && (
                      <div className="text-xs text-gray-500 italic text-center py-2">Henüz yorum yapılmamış. Görevin ilk yorumunu yazın.</div>
                    )}
                  </div>

                  {/* Comment input form */}
                  <form onSubmit={handlePostComment} className="flex gap-2 items-end pt-2">
                    <textarea 
                      required
                      placeholder="Geri bildirim veya güncelleme notu yazın..."
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      className="flex-1 glass-input rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none h-14 resize-none"
                    />
                    <button 
                      type="submit"
                      className="p-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-all cursor-pointer active:scale-95"
                    >
                      <Send className="h-4.5 w-4.5" />
                    </button>
                  </form>
                </div>
              </div>

              {/* Right Column (Sidebar details) */}
              <div className="w-full md:w-56 space-y-4 shrink-0 border-t md:border-t-0 md:border-l border-purple-500/10 pt-4 md:pt-0 md:pl-6 text-xs">
                
                <div className="space-y-1">
                  <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Durum</div>
                  <div>
                    <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${getStatusBadgeClass(selectedTask.status)}`}>
                      {getStatusLabel(selectedTask.status)}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Öncelik</div>
                  <div>
                    <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${getPriorityBadgeClass(selectedTask.priority)}`}>
                      {getPriorityLabel(selectedTask.priority)}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Atanan Çalışan</div>
                  <div className="font-semibold text-white">{selectedTask.assigned_to ? selectedTask.assigned_to.email : 'Atanmamış'}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Proje Yöneticisi</div>
                  <div className="font-semibold text-white truncate">{selectedTask.project_owner_email}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Atanma Tarihi</div>
                  <div className="font-semibold text-gray-300">{new Date(selectedTask.created_at).toLocaleDateString("tr-TR")}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Teslim Tarihi</div>
                  <div className="font-semibold text-gray-300">
                    {selectedTask.due_date ? new Date(selectedTask.due_date).toLocaleDateString("tr-TR") : 'Belirtilmemiş'}
                  </div>
                </div>

                {isManagerOrAdmin && (
                  <div className="pt-4 border-t border-purple-500/10">
                    <button 
                      onClick={() => handleDeleteTask(selectedTask.id)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg font-bold transition-all cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Görevi Sil
                    </button>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default App;
