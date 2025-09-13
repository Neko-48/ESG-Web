import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import type { Project } from '../../types/projectType';
import { apiRequest } from '../../services/apiService';
import ProjectCard from './ProjectCard';
import { Plus, LogOut, User } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest<Project[]>('GET', '/projects');
      if (response.success && response.data) {
        setProjects(response.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = () => {
    setShowCreateForm(true);
  };

  const handleProjectCreated = () => {
    setShowCreateForm(false);
    fetchProjects(); // Refresh project list
  };

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    padding: '0'
  };

  const headerStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderBottom: '1px solid #e5e7eb',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
  };

  const contentStyle: React.CSSProperties = {
    padding: '24px',
    maxWidth: '1200px',
    margin: '0 auto'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0'
  };

  const userInfoStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  };

  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s'
  };

  const createButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#3b82f6',
    color: 'white'
  };

  const logoutButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#ef4444',
    color: 'white'
  };

  const projectsGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px',
    marginTop: '24px'
  };

  const emptyStateStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
  };

  if (showCreateForm) {
    return <CreateProjectForm onProjectCreated={handleProjectCreated} onCancel={() => setShowCreateForm(false)} />;
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>ESG Project Management</h1>
        <div style={userInfoStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={16} />
            <span style={{ fontSize: '14px', color: '#6b7280' }}>
              {user?.first_name} {user?.last_name}
            </span>
          </div>
          <button style={createButtonStyle} onClick={handleCreateProject}>
            <Plus size={16} />
            New Project
          </button>
          <button style={logoutButtonStyle} onClick={logout}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={contentStyle}>
        {isLoading ? (
          <div style={emptyStateStyle}>
            <p style={{ fontSize: '18px', color: '#6b7280', margin: '0' }}>Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div style={emptyStateStyle}>
            <h3 style={{ fontSize: '20px', color: '#1f2937', marginBottom: '8px', margin: '0 0 8px 0' }}>
              No projects yet
            </h3>
            <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '20px', margin: '0 0 20px 0' }}>
              Get started by creating your first ESG project
            </p>
            <button style={createButtonStyle} onClick={handleCreateProject}>
              <Plus size={16} />
              Create First Project
            </button>
          </div>
        ) : (
          <div style={projectsGridStyle}>
            {projects.map((project) => (
              <ProjectCard key={project.project_id} project={project} onUpdate={fetchProjects} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Import CreateProjectForm component
import CreateProjectForm from './CreateProjectForm';

export default Dashboard;