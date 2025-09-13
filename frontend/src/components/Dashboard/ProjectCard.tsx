import React from 'react';
import type { Project } from '../../types/projectType';
import { Clock, CheckCircle, XCircle, RotateCw, Eye, Trash2 } from 'lucide-react';
import { apiRequest } from '../../services/apiService';

interface ProjectCardProps {
  project: Project;
  onUpdate: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onUpdate }) => {
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await apiRequest('DELETE', `/projects/${project.project_id}`);
        onUpdate(); // Refresh the project list
      } catch (error) {
        console.error('Failed to delete project:', error);
        alert('Failed to delete project');
      }
    }
  };

  const handleViewDetails = () => {
    // Navigate to project details page
    window.location.href = `/project/${project.project_id}`;
  };

  const getStatusIcon = () => {
    switch (project.status) {
      case 'PENDING':
        return <Clock size={16} color="#f59e0b" />;
      case 'PROCESSING':
        return <RotateCw size={16} color="#3b82f6" className="animate-spin" />;
      case 'COMPLETED':
        return <CheckCircle size={16} color="#10b981" />;
      case 'FAILED':
        return <XCircle size={16} color="#ef4444" />;
      default:
        return <Clock size={16} color="#6b7280" />;
    }
  };

  const getStatusColor = () => {
    switch (project.status) {
      case 'PENDING':
        return '#f59e0b';
      case 'PROCESSING':
        return '#3b82f6';
      case 'COMPLETED':
        return '#10b981';
      case 'FAILED':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getPassFailBadge = () => {
    if (!project.evaluation) return null;
    
    const isPass = project.evaluation.pass_fail === 'PASS';
    const badgeStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500',
      backgroundColor: isPass ? '#dcfce7' : '#fee2e2',
      color: isPass ? '#166534' : '#991b1b'
    };

    return (
      <span style={badgeStyle}>
        {isPass ? 'PASS' : 'FAIL'}
      </span>
    );
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    transition: 'all 0.2s',
    cursor: 'pointer'
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 4px 0'
  };

  const industryStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0'
  };

  const statusStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
    fontWeight: '500',
    color: getStatusColor()
  };

  const scoresSectionStyle: React.CSSProperties = {
    marginTop: '16px',
    padding: '12px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px'
  };

  const scoresGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '8px',
    marginTop: '8px'
  };

  const scoreItemStyle: React.CSSProperties = {
    textAlign: 'center'
  };

  const scoreLabelStyle: React.CSSProperties = {
    fontSize: '11px',
    color: '#6b7280',
    margin: '0 0 4px 0'
  };

  const scoreValueStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0'
  };

  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    marginTop: '16px',
    borderTop: '1px solid #f3f4f6',
    paddingTop: '16px'
  };

  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  };

  const viewButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#f3f4f6',
    color: '#374151',
    flex: 1
  };

  const deleteButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#fee2e2',
    color: '#991b1b'
  };

  const dateStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#9ca3af',
    marginTop: '8px'
  };

  return (
    <div style={cardStyle} onClick={handleViewDetails}>
      <div style={headerStyle}>
        <div style={{ flex: 1 }}>
          <h3 style={titleStyle}>{project.project_name}</h3>
          <p style={industryStyle}>{project.industry}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          <div style={statusStyle}>
            {getStatusIcon()}
            {project.status}
          </div>
          {getPassFailBadge()}
        </div>
      </div>

      {project.evaluation && (
        <div style={scoresSectionStyle}>
          <p style={{ fontSize: '12px', fontWeight: '500', color: '#374151', margin: '0 0 8px 0' }}>
            ESG Scores
          </p>
          <div style={scoresGridStyle}>
            <div style={scoreItemStyle}>
              <p style={scoreLabelStyle}>ENV</p>
              <p style={scoreValueStyle}>{project.evaluation.environmental_score.toFixed(1)}</p>
            </div>
            <div style={scoreItemStyle}>
              <p style={scoreLabelStyle}>SOC</p>
              <p style={scoreValueStyle}>{project.evaluation.social_score.toFixed(1)}</p>
            </div>
            <div style={scoreItemStyle}>
              <p style={scoreLabelStyle}>GOV</p>
              <p style={scoreValueStyle}>{project.evaluation.governance_score.toFixed(1)}</p>
            </div>
            <div style={scoreItemStyle}>
              <p style={scoreLabelStyle}>TOTAL</p>
              <p style={scoreValueStyle}>{project.evaluation.overall_score.toFixed(1)}</p>
            </div>
          </div>
        </div>
      )}

      <div style={dateStyle}>
        Created: {new Date(project.created_at).toLocaleDateString()}
      </div>

      <div 
        style={actionsStyle} 
        onClick={(e) => e.stopPropagation()} // Prevent card click when clicking buttons
      >
        <button style={viewButtonStyle} onClick={handleViewDetails}>
          <Eye size={14} />
          View Details
        </button>
        <button style={deleteButtonStyle} onClick={handleDelete}>
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;