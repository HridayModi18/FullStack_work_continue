import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Layers, History, Users, HelpCircle, User, LogOut, FileText } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ adminData, isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Create Post', path: '/create-post', icon: <PlusCircle size={20} /> },
    { name: 'Manage Posts', path: '/manage-posts', icon: <Layers size={20} /> },
    { name: 'Audit History', path: '/audit-history', icon: <History size={20} /> },
    { name: 'Submissions', path: '/submissions', icon: <FileText size={20} /> },
    { name: 'Students', path: '/students', icon: <Users size={20} /> },
    { name: 'Solve Doubts', path: '/doubts', icon: <HelpCircle size={20} /> },
    { name: 'Profile', path: '/profile', icon: <User size={20} /> },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h2 className="sidebar-logo">M E N T O X</h2>
        <p className="sidebar-subtitle">Admin Panel</p>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `sidebar-link ${isActive && item.path === window.location.pathname ? 'active' : ''}`}
            // React router's exact matching is a bit weird with index routes, so we manually check pathname for the index route to avoid it always being active
            end={item.path === '/'}
            onClick={onClose}
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="admin-info">
          <img 
            src={(adminData?.avatar && adminData.avatar !== "null") ? adminData.avatar : `https://ui-avatars.com/api/?name=${adminData?.name || 'Admin'}`} 
            alt="Admin" 
            className="admin-avatar"
          />
          <div className="admin-details">
            <span className="admin-name">{(adminData?.name || 'Admin').split(' ')[0]}</span>
            <span className="admin-role">Super Admin</span>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
