import React, { useState, useEffect } from 'react';
import { 
  Boxes,
  Lock,
  Menu,
  X,
  Plus,
  RotateCcw,
  Trash2,
  AlertTriangle,
  CheckCircle,
  FileText,
  User,
  LogOut,
  Folder,
  Layers,
  CheckSquare,
  Globe
} from 'lucide-react';

const API_BASE = 'http://localhost:8000';

function App() {
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  // Selected Project/Task details for viewing or editing
  const [selectedProject, setSelectedProject] = useState(null);

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
      setError('Veriler çekilirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all registered users for member assignations
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
      setLoginError('Bağlantı hatası.');
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
    setIsMobileMenuOpen(false);
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
      setError('İşlem sırasında bir hata oluştu.');
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
      } else {
        const data = await res.json();
        setError(data.detail || 'Durum güncellenemedi.');
      }
    } catch (err) {
      setError('Bağlantı hatası.');
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
        fetchData();
      } else {
        setError('Proje silinemedi.');
      }
    } catch (err) {
      setError('Hata oluştu.');
    }
  };

  // Get project members list to populate task assignee dropdown
  const getSelectedProjectMembers = () => {
    const proj = projects.find(p => p.id === parseInt(newTaskProject));
    if (!proj) return [];
    
    // Find detailed project model or use users list
    // In our payload, owner and members have details
    // Since we need users, we look them up
    // Filter usersList to only include owner + members of project
    // Fetch project detail first
    return usersList; // Return all for now, validated in backend anyway
  };

  if (!token || !user) {
    return (
      <div 
        onMouseMove={handleMouseMove}
        className="min-h-screen flex items-center justify-center bg-[#0b0f17] relative overflow-hidden px-4 grid-bg"
      >
        {/* Interactive glow follower */}
        <div 
          className="pointer-events-none fixed w-[280px] h-[280px] rounded-full bg-cyan-500/5 blur-[80px] transition-transform duration-75 z-0"
          style={{
            left: `${mousePos.x - 140}px`,
            top: `${mousePos.y - 140}px`
          }}
        />

        <div className="w-full max-w-md glass-card rounded-2xl p-8 space-y-6 relative z-10">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-navy-900 border border-white/10 rounded-2xl text-cyan-400 mb-2">
              <CheckSquare className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-wider uppercase">TaskFlow Portal</h2>
            <p className="text-[10px] text-cyan-400 font-extrabold tracking-widest">KURUMSAL GÖREV YÖNETİM SİSTEMİ</p>
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
                className="w-full glass-input rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-all text-sm"
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
                className="w-full glass-input rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-all text-sm"
              />
            </div>

            <button 
              type="submit" 
              disabled={loginLoading}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-[#0b0f17] font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50 text-sm flex items-center justify-center gap-2"
            >
              <Lock className="h-4 w-4" />
              {loginLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-[#0b0f17] text-gray-200 flex flex-col relative overflow-hidden grid-bg"
    >
      <div 
        className="pointer-events-none fixed w-[300px] h-[300px] rounded-full bg-cyan-500/5 blur-[90px] transition-transform duration-75 z-0"
        style={{
          left: `${mousePos.x - 150}px`,
          top: `${mousePos.y - 150}px`
        }}
      />

      {/* Header */}
      <header className="bg-[#111827] border-b border-white/10 sticky top-0 z-50 px-6 py-4 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-900 border border-white/10 rounded-xl text-cyan-400">
              <CheckSquare className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-widest uppercase">TASKFLOW YÖNETİMİ</h1>
              <p className="text-[8px] text-cyan-400 font-extrabold tracking-widest">PORTALI</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`pb-1 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'dashboard' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-white'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('projects')}
              className={`pb-1 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'projects' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-white'}`}
            >
              Projeler
            </button>
            <button 
              onClick={() => setActiveTab('kanban')}
              className={`pb-1 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'kanban' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-white'}`}
            >
              Görev Tahtası
            </button>
          </nav>

          {/* Profile & Logout */}
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs font-bold text-white">{user.email}</div>
              <div className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-widest">Çalışan Hesabı</div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 bg-gray-900 hover:bg-red-500/10 hover:text-red-400 border border-white/10 hover:border-red-500/20 rounded-xl transition-all"
              title="Çıkış Yap"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          <div className="flex md:hidden items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 bg-gray-900 border border-white/10 rounded-xl text-gray-300"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {isMobileMenuOpen && (
          <nav className="md:hidden mt-4 pt-4 border-t border-white/5 flex flex-col gap-3">
            <button 
              onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-left transition-all ${activeTab === 'dashboard' ? 'bg-cyan-500 text-navy-950 font-black' : 'text-gray-400 hover:bg-white/5'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => { setActiveTab('projects'); setIsMobileMenuOpen(false); }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-left transition-all ${activeTab === 'projects' ? 'bg-cyan-500 text-navy-950 font-black' : 'text-gray-400 hover:bg-white/5'}`}
            >
              Projeler
            </button>
            <button 
              onClick={() => { setActiveTab('kanban'); setIsMobileMenuOpen(false); }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-left transition-all ${activeTab === 'kanban' ? 'bg-cyan-500 text-navy-950 font-black' : 'text-gray-400 hover:bg-white/5'}`}
            >
              Görev Tahtası
            </button>
            <div className="border-t border-white/5 pt-3 flex items-center justify-between px-4">
              <div>
                <div className="text-xs font-bold text-white">{user.email}</div>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 bg-gray-900 hover:bg-red-500/10 hover:text-red-400 border border-white/10 rounded-xl transition-all"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </nav>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full relative z-10">

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs font-semibold flex items-start gap-3 backdrop-blur-md">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold uppercase tracking-wider">İşlem Başarısız</div>
              <div className="mt-0.5 opacity-90">{error}</div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-2xl text-xs font-semibold flex items-start gap-3 backdrop-blur-md">
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
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white uppercase tracking-wider">Hoş Geldiniz</h2>
                <p className="text-xs text-gray-400">Genel durum ve proje metrikleri paneli</p>
              </div>
              <button 
                onClick={fetchData}
                className="px-4 py-2 bg-gray-900 hover:bg-white/5 border border-white/10 rounded-xl text-xs font-extrabold uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Yenile
              </button>
            </div>

            {/* Metric counters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="glass-card rounded-2xl p-6 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Kayıtlı Projeler</div>
                  <div className="text-3xl font-black text-white mt-1">{projects.length}</div>
                </div>
                <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-2xl border border-cyan-500/20">
                  <Folder className="h-6 w-6" />
                </div>
              </div>

              <div className="glass-card rounded-2xl p-6 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Bekleyen Görevler</div>
                  <div className="text-3xl font-black text-amber-400 mt-1">
                    {tasks.filter(t => t.status !== 'DONE').length}
                  </div>
                </div>
                <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
                  <Layers className="h-6 w-6" />
                </div>
              </div>

              <div className="glass-card rounded-2xl p-6 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Tamamlanan Görevler</div>
                  <div className="text-3xl font-black text-green-400 mt-1">
                    {tasks.filter(t => t.status === 'DONE').length}
                  </div>
                </div>
                <div className="p-3 bg-green-500/10 text-green-400 rounded-2xl border border-green-500/20">
                  <CheckCircle className="h-6 w-6" />
                </div>
              </div>
            </div>

            {/* Projects Overview list */}
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Projelerin Özet Listesi</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map(proj => (
                  <div key={proj.id} className="bg-gray-900/40 border border-white/5 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white">{proj.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">{proj.description || 'Açıklama belirtilmemiş.'}</div>
                      <div className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider mt-2">{proj.owner_email}</div>
                    </div>
                    <button 
                      onClick={() => { setSelectedProject(proj); setActiveTab('projects'); }}
                      className="text-xs text-cyan-400 hover:text-white transition-colors"
                    >
                      Detaylar &rarr;
                    </button>
                  </div>
                ))}
                {projects.length === 0 && (
                  <div className="col-span-2 text-center text-gray-500 py-6">Kayıtlı projeniz bulunmamaktadır.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: PROJECTS */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              
              {/* Projects List */}
              <div className="flex-1 space-y-4">
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">Proje Havuzu</h2>
                
                <div className="grid grid-cols-1 gap-4">
                  {projects.map(proj => (
                    <div key={proj.id} className="glass-card rounded-2xl p-5 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-base font-bold text-white">{proj.name}</h3>
                          <p className="text-xs text-gray-400 mt-1">{proj.description || 'Açıklama belirtilmemiş.'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleDeleteProject(proj.id)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-all"
                            title="Projeyi Sil"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-white/5 pt-3 text-[10px] text-gray-400">
                        <div>Sahibi: <span className="text-cyan-400 font-bold">{proj.owner_email}</span></div>
                        <div>Ekip Üyeleri: <span className="text-white font-bold">{proj.members_count || 0} Kişi</span></div>
                      </div>
                    </div>
                  ))}
                  {projects.length === 0 && (
                    <div className="text-center text-gray-500 py-8">Proje kaydı bulunamadı.</div>
                  )}
                </div>
              </div>

              {/* Create Project Form (Right Panel) */}
              <div className="w-full md:w-80 glass-card rounded-2xl p-6 space-y-4 self-start">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Folder className="h-4 w-4 text-cyan-400" />
                  Yeni Proje Oluştur
                </h3>

                <form onSubmit={handleCreateProject} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Proje Adı</label>
                    <input 
                      type="text" 
                      required
                      placeholder="örn: İHA Aviyonik Ar-Ge"
                      value={newProjName}
                      onChange={(e) => setNewProjName(e.target.value)}
                      className="w-full glass-input rounded-xl px-3 py-2 text-white placeholder-gray-600 focus:outline-none transition-all text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Açıklama</label>
                    <textarea 
                      placeholder="Proje hedefleri ve kapsamı..."
                      value={newProjDesc}
                      onChange={(e) => setNewProjDesc(e.target.value)}
                      className="w-full glass-input rounded-xl px-3 py-2 text-white placeholder-gray-600 focus:outline-none transition-all text-xs h-20 resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Proje Üyeleri Seçimi</label>
                    <select 
                      multiple
                      value={newProjMembers}
                      onChange={(e) => {
                        const opts = Array.from(e.target.selectedOptions, option => option.value);
                        setNewProjMembers(opts);
                      }}
                      className="w-full bg-[#0b0f17]/60 border border-white/10 rounded-xl p-2 text-white text-xs focus:outline-none focus:border-cyan-400 h-24"
                    >
                      {usersList.filter(u => u.email !== user.email).map(u => (
                        <option key={u.id} value={u.id}>{u.email}</option>
                      ))}
                    </select>
                    <div className="text-[8px] text-gray-500">Çoklu seçim için CTRL'ye basılı tutun.</div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-cyan-500 hover:bg-cyan-600 text-navy-950 font-bold py-2 rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Plus className="h-3.5 w-3.5" /> Proje Kaydet
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* TAB: KANBAN BOARD */}
        {activeTab === 'kanban' && (
          <div className="space-y-6">
            
            {/* Task Creation Bar */}
            <div className="glass-card rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-cyan-400" />
                Hızlı Görev Oluşturma İstasyonu
              </h3>

              <form onSubmit={handleCreateTask} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Görev Başlığı</label>
                  <input 
                    type="text" 
                    required
                    placeholder="örn: CFD Analizleri"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-white placeholder-gray-600 focus:outline-none transition-all text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Ait Olduğu Proje</label>
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
                    {getSelectedProjectMembers().map(u => (
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
                    className="bg-cyan-500 hover:bg-cyan-600 text-navy-950 font-bold py-2 rounded-xl transition-all text-xs flex items-center justify-center gap-1 active:scale-95 self-end"
                  >
                    <Plus className="h-3.5 w-3.5" /> Ekle
                  </button>
                </div>
              </form>
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              {/* Column: TODO */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-700 pb-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                    Yapılacaklar
                  </h4>
                  <span className="bg-gray-800 text-gray-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {tasks.filter(t => t.status === 'TODO').length}
                  </span>
                </div>
                <div className="space-y-3">
                  {tasks.filter(t => t.status === 'TODO').map(task => (
                    <div key={task.id} className="glass-card rounded-xl p-4 space-y-3">
                      <div>
                        <div className="text-xs font-bold text-white">{task.title}</div>
                        <div className="text-[9px] text-cyan-400 uppercase tracking-widest mt-1">{task.project_name}</div>
                      </div>
                      <div className="flex items-center justify-between border-t border-white/5 pt-2 text-[10px] text-gray-400">
                        <div>{task.assigned_to_name || 'Atanmamış'}</div>
                        <div className="flex items-center gap-1.5">
                          <button 
                            onClick={() => handleUpdateTaskStatus(task.id, 'IN_PROGRESS')}
                            className="text-cyan-400 hover:underline"
                          >
                            Başlat
                          </button>
                          <button 
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            Sil
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column: IN_PROGRESS */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-700 pb-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
                    Devam Edenler
                  </h4>
                  <span className="bg-gray-800 text-gray-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {tasks.filter(t => t.status === 'IN_PROGRESS').length}
                  </span>
                </div>
                <div className="space-y-3">
                  {tasks.filter(t => t.status === 'IN_PROGRESS').map(task => (
                    <div key={task.id} className="glass-card rounded-xl p-4 space-y-3">
                      <div>
                        <div className="text-xs font-bold text-white">{task.title}</div>
                        <div className="text-[9px] text-cyan-400 uppercase tracking-widest mt-1">{task.project_name}</div>
                      </div>
                      <div className="flex items-center justify-between border-t border-white/5 pt-2 text-[10px] text-gray-400">
                        <div>{task.assigned_to_name}</div>
                        <div className="flex items-center gap-1.5">
                          <button 
                            onClick={() => handleUpdateTaskStatus(task.id, 'IN_REVIEW')}
                            className="text-cyan-400 hover:underline"
                          >
                            İncele
                          </button>
                          <button 
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            Sil
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column: IN_REVIEW */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-700 pb-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-blue-400" />
                    İncelemede
                  </h4>
                  <span className="bg-gray-800 text-gray-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {tasks.filter(t => t.status === 'IN_REVIEW').length}
                  </span>
                </div>
                <div className="space-y-3">
                  {tasks.filter(t => t.status === 'IN_REVIEW').map(task => (
                    <div key={task.id} className="glass-card rounded-xl p-4 space-y-3">
                      <div>
                        <div className="text-xs font-bold text-white">{task.title}</div>
                        <div className="text-[9px] text-cyan-400 uppercase tracking-widest mt-1">{task.project_name}</div>
                      </div>
                      <div className="flex items-center justify-between border-t border-white/5 pt-2 text-[10px] text-gray-400">
                        <div>{task.assigned_to_name}</div>
                        <div className="flex items-center gap-1.5">
                          <button 
                            onClick={() => handleUpdateTaskStatus(task.id, 'DONE')}
                            className="text-cyan-400 hover:underline"
                          >
                            Tamamla
                          </button>
                          <button 
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            Sil
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column: DONE */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-700 pb-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                    Tamamlananlar
                  </h4>
                  <span className="bg-gray-800 text-gray-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {tasks.filter(t => t.status === 'DONE').length}
                  </span>
                </div>
                <div className="space-y-3">
                  {tasks.filter(t => t.status === 'DONE').map(task => (
                    <div key={task.id} className="glass-card rounded-xl p-4 space-y-3">
                      <div>
                        <div className="text-xs font-bold text-white line-through opacity-60">{task.title}</div>
                        <div className="text-[9px] text-cyan-400 uppercase tracking-widest mt-1 opacity-60">{task.project_name}</div>
                      </div>
                      <div className="flex items-center justify-between border-t border-white/5 pt-2 text-[10px] text-gray-400">
                        <div className="opacity-60">{task.assigned_to_name}</div>
                        <button 
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Sil
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-[#111827] border-t border-white/10 mt-auto py-8 px-6 text-gray-400 text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-cyan-400" />
              TaskFlow Görev Yönetim Sistemi
            </h4>
            <p className="leading-relaxed opacity-80 text-justify">
              Bu sistem; kurumsal projelerin, görevlerin ve takımların iş süreçlerini kolaylaştırmak,
              rol bazlı yetkilendirmeyle güvenli şekilde yönetmek amacıyla geliştirilmiş modern bir iş yönetim portalıdır.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">Geliştirici Hakkında</h4>
            <p className="leading-relaxed opacity-80 text-justify">
              <strong>Hüseyin Taşkın</strong> — Arka Uç Yazılım Uzmanı. Marmara Üniversitesi Bilgisayar Mühendisliği mezunudur.
              Python, Django, REST API ve mikroservis mimarileri alanında uzmanlaşmıştır.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a href="https://github.com/huseyintaskinn" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
              <a href="https://linkedin.com/in/huseyintaskin023" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
              <a href="https://huseyintaskin.com.tr" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                <Globe className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">Hızlı Erişim</h4>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              <li><button onClick={() => setActiveTab('dashboard')} className="hover:text-white transition-colors text-left">Dashboard</button></li>
              <li><button onClick={() => setActiveTab('projects')} className="hover:text-white transition-colors text-left">Projeler</button></li>
              <li><button onClick={() => setActiveTab('kanban')} className="hover:text-white transition-colors text-left">Görev Tahtası</button></li>
              <li><a href={`${API_BASE}/swagger/`} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Swagger API</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-white/5 mt-8 pt-4 text-center text-[10px] text-gray-500">
          &copy; {new Date().getFullYear()} TaskFlow Portal. Hüseyin Taşkın tarafından geliştirilmiştir. Tüm Hakları Saklıdır.
        </div>
      </footer>
    </div>
  );
}

export default App;
