import React, { useState, useEffect } from 'react';
import { projectService, skillService, contactService, authService, uploadService } from './services/api';
import { Code2, ExternalLink, Plus, Trash2, FolderGit2, Cpu, Mail, Send, Lock, LogOut, Image } from 'lucide-react';

function App() {
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  // Authentication State
  const [token, setToken] = useState(localStorage.getItem('portfolio_token') || null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginCreds, setLoginCreds] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // Modals & Form States
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [messageSent, setMessageSent] = useState(false);

  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    category: 'Full Stack',
    tags: '',
    githubUrl: '',
    liveUrl: '',
    imageUrl: '',
    featured: false,
  });

  const [newSkill, setNewSkill] = useState({
    name: '',
    category: 'Backend',
    proficiency: 80,
  });

  const loadData = async () => {
    try {
      const [projRes, skillRes] = await Promise.all([
        projectService.getAll(),
        skillService.getAll(),
      ]);
      setProjects(projRes.data);
      setSkills(skillRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Auth Handlers
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await authService.login(loginCreds);
      localStorage.setItem('portfolio_token', res.data.token);
      setToken(res.data.token);
      setShowLoginModal(false);
      setLoginCreds({ username: '', password: '' });
    } catch (err) {
      setLoginError('Invalid credentials. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('portfolio_token');
    setToken(null);
  };

  // Image Upload Handler
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await uploadService.uploadImage(formData);
      setNewProject((prev) => ({ ...prev, imageUrl: res.data.url }));
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Image upload failed. Ensure the STS backend is running and you are logged in.');
    } finally {
      setUploading(false);
    }
  };

  // Project Handlers
  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await projectService.create(newProject);
      setShowAddProject(false);
      setNewProject({
        title: '',
        description: '',
        category: 'Full Stack',
        tags: '',
        githubUrl: '',
        liveUrl: '',
        imageUrl: '',
        featured: false,
      });
      loadData();
    } catch (err) {
      alert('Unauthorized! Please log in as Admin.');
    }
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm('Delete project?')) {
      try {
        await projectService.delete(id);
        loadData();
      } catch (err) {
        alert('Unauthorized! Please log in as Admin.');
      }
    }
  };

  // Skill Handlers
  const handleCreateSkill = async (e) => {
    e.preventDefault();
    try {
      await skillService.create(newSkill);
      setShowAddSkill(false);
      setNewSkill({ name: '', category: 'Backend', proficiency: 80 });
      loadData();
    } catch (err) {
      alert('Unauthorized! Please log in as Admin.');
    }
  };

  const handleDeleteSkill = async (id) => {
    try {
      await skillService.delete(id);
      loadData();
    } catch (err) {
      alert('Unauthorized! Please log in as Admin.');
    }
  };

  // Contact Handler
  const handleSendMessage = async (e) => {
    e.preventDefault();
    try {
      await contactService.submit(contactForm);
      setMessageSent(true);
      setContactForm({ name: '', email: '', message: '' });
      setTimeout(() => setMessageSent(false), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 sticky top-0 bg-slate-950/80 backdrop-blur z-20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderGit2 className="text-emerald-400 w-6 h-6" />
            <span className="font-bold text-lg tracking-wide">Developer Showcase</span>
          </div>

          <div className="flex items-center gap-3">
            {token ? (
              <>
                <button
                  onClick={() => setShowAddSkill(true)}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-sm transition border border-slate-700"
                >
                  <Cpu className="w-4 h-4 text-emerald-400" /> Add Skill
                </button>
                <button
                  onClick={() => setShowAddProject(true)}
                  className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-3 py-1.5 rounded-lg text-sm transition font-semibold"
                >
                  <Plus className="w-4 h-4" /> Add Project
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 px-2 py-1.5 text-sm transition"
                  title="Logout Admin"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="flex items-center gap-1.5 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-sm transition"
              >
                <Lock className="w-3.5 h-3.5" /> Admin Login
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12 space-y-16">
        {/* Hero */}
        <section className="text-center space-y-3">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Dynamic Full-Stack Portfolio
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
            Secured with Spring Security & JWT. Relational MySQL storage with reactive React components.
          </p>
        </section>

        {/* Skills Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-200 flex items-center gap-2">
              <Cpu className="text-emerald-400 w-5 h-5" /> Technical Expertise
            </h2>
            <span className="text-xs text-slate-500 uppercase tracking-widest font-mono">
              Total Skills: {skills.length}
            </span>
          </div>

          {skills.length === 0 ? (
            <div className="border border-dashed border-slate-800 rounded-xl p-8 text-center text-slate-500 text-sm">
              No skills added yet. {token ? 'Click "Add Skill" above.' : 'Admin login required to add skills.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {skills.map((skill) => (
                <div key={skill.id} className="bg-slate-900 border border-slate-800 rounded-lg p-4 relative group">
                  {token && (
                    <button
                      onClick={() => handleDeleteSkill(skill.id)}
                      className="absolute top-3 right-3 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-sm text-slate-200">{skill.name}</span>
                    <span className="text-xs font-mono text-emerald-400">{skill.proficiency}%</span>
                  </div>
                  <div className="text-xs text-slate-500 mb-2">{skill.category}</div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${skill.proficiency}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Projects Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-200 flex items-center gap-2">
              <FolderGit2 className="text-emerald-400 w-5 h-5" /> Featured Projects
            </h2>
            <span className="text-xs text-slate-500 uppercase tracking-widest font-mono">
              Live DB Count: {projects.length}
            </span>
          </div>

          {loading ? (
            <div className="text-center py-16 text-slate-400">Loading data from backend...</div>
          ) : projects.length === 0 ? (
            <div className="border border-dashed border-slate-800 rounded-xl p-12 text-center text-slate-500">
              No projects in database.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between hover:border-slate-700 transition relative group overflow-hidden"
                >
                  {/* Uploaded Screenshot Banner */}
                  {item.imageUrl && (
                    <div className="w-[calc(100%+3rem)] h-44 -mx-6 -mt-6 mb-4 overflow-hidden border-b border-slate-800 bg-slate-950">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                  )}

                  {token && (
                    <button
                      onClick={() => handleDeleteProject(item.id)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-red-400 bg-slate-950/80 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition shadow"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <div className="flex-1">
                    <span className="text-xs font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20 inline-block mb-3">
                      {item.category || 'Full Stack'}
                    </span>
                    <h3 className="text-xl font-bold mb-2 text-white">{item.title}</h3>
                    <p className="text-slate-400 text-sm mb-4 leading-relaxed line-clamp-3">
                      {item.description}
                    </p>
                    {item.tags && (
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {item.tags.split(',').map((tag, i) => (
                          <span key={i} className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t border-slate-800 text-sm mt-auto">
                    {item.githubUrl && (
                      <a
                        href={item.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-slate-300 hover:text-white transition"
                      >
                        <Code2 className="w-4 h-4" /> Code
                      </a>
                    )}
                    {item.liveUrl && (
                      <a
                        href={item.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-slate-300 hover:text-emerald-400 transition ml-auto"
                      >
                        <ExternalLink className="w-4 h-4" /> Live Demo
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Contact Inquiry Section */}
        <section className="border-t border-slate-800 pt-12 pb-8 max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-slate-200 mb-2 flex items-center justify-center gap-2">
            <Mail className="text-emerald-400 w-5 h-5" /> Get In Touch
          </h2>
          <p className="text-center text-slate-400 text-sm mb-6">
            Inquiries are stored directly into the Spring Boot backend.
          </p>

          {messageSent && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm p-3 rounded-lg text-center mb-4">
              Your message was sent successfully!
            </div>
          )}

          <form onSubmit={handleSendMessage} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Your Name</label>
              <input
                type="text"
                required
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                placeholder="jane@example.com"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Message</label>
              <textarea
                rows={4}
                required
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                placeholder="Write your inquiry..."
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold py-2.5 rounded-lg text-sm transition"
            >
              <Send className="w-4 h-4" /> Send Message
            </button>
          </form>
        </section>
      </main>

      {/* Admin Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" /> Admin Access
            </h3>
            {loginError && (
              <div className="text-red-400 text-xs bg-red-950/40 border border-red-900 p-2 rounded mb-3">
                {loginError}
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={loginCreds.username}
                  onChange={(e) => setLoginCreds({ ...loginCreds, username: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                  placeholder="admin"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={loginCreds.password}
                  onChange={(e) => setLoginCreds({ ...loginCreds, password: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="px-3 py-1.5 text-sm text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-4 py-1.5 rounded-lg font-medium text-sm transition"
                >
                  Log In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Skill Modal */}
      {showAddSkill && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold mb-4">Add Technical Skill</h3>
            <form onSubmit={handleCreateSkill} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Skill Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Java, Docker"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Category</label>
                <select
                  value={newSkill.category}
                  onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value="Backend">Backend</option>
                  <option value="Frontend">Frontend</option>
                  <option value="Database">Database</option>
                  <option value="DevOps & Tools">DevOps & Tools</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Proficiency: {newSkill.proficiency}%
                </label>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={newSkill.proficiency}
                  onChange={(e) => setNewSkill({ ...newSkill, proficiency: Number(e.target.value) })}
                  className="w-full accent-emerald-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddSkill(false)}
                  className="px-3 py-1.5 text-sm text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-4 py-1.5 rounded-lg font-medium text-sm transition"
                >
                  Save Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {showAddProject && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">Add New Project</h3>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Image Upload Input */}
              <div>
                <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1.5">
                  <Image className="w-3.5 h-3.5" /> Project Screenshot (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-500 file:text-slate-950 hover:file:bg-emerald-600 cursor-pointer"
                />
                {uploading && <p className="text-xs text-emerald-400 mt-1">Uploading image...</p>}
                {newProject.imageUrl && (
                  <img
                    src={newProject.imageUrl}
                    alt="Preview"
                    className="mt-2 h-24 w-full object-cover rounded-lg border border-slate-700"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newProject.tags}
                  onChange={(e) => setNewProject({ ...newProject, tags: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                  placeholder="Java, Spring Boot, React, MySQL"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">GitHub URL</label>
                  <input
                    type="url"
                    value={newProject.githubUrl}
                    onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Live URL</label>
                  <input
                    type="url"
                    value={newProject.liveUrl}
                    onChange={(e) => setNewProject({ ...newProject, liveUrl: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddProject(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-4 py-2 rounded-lg font-medium text-sm transition"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;