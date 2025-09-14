import React from 'react';
import type { Project } from '../../types/projectType';
import { Clock, CheckCircle, XCircle, Eye, Trash2 } from 'lucide-react';
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

  // Map project status to display status
  const getDisplayStatus = () => {
    if (!project.evaluation) {
      return project.status; // PENDING, PROCESSING, or COMPLETED without evaluation
    }
    return project.evaluation.status; // PASSED or FAILED from evaluation
  };

  const getStatusIcon = () => {
    const status = getDisplayStatus();
    switch (status) {
      case 'PENDING':
      case 'PROCESSING':
        return <Clock size={16} color="#f59e0b" />;
      case 'PASSED':
        return <CheckCircle size={16} color="#10b981" />;
      case 'FAILED':
        return <XCircle size={16} color="#ef4444" />;
      case 'COMPLETED':
        return <CheckCircle size={16} color="#6b7280" />;
      default:
        return <Clock size={16} color="#6b7280" />;
    }
  };

  const getStatusColor = () => {
    const status = getDisplayStatus();
    switch (status) {
      case 'PENDING':
      case 'PROCESSING':
        return '#f59e0b';
      case 'PASSED':
        return '#10b981';
      case 'FAILED':
        return '#ef4444';
      case 'COMPLETED':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getStatusBackgroundColor = () => {
    const status = getDisplayStatus();
    switch (status) {
      case 'PENDING':
      case 'PROCESSING':
        return '#fef3c7';
      case 'PASSED':
        return '#dcfce7';
      case 'FAILED':
        return '#fee2e2';
      case 'COMPLETED':
        return '#f3f4f6';
      default:
        return '#f3f4f6';
    }
  };

  const getPassFailBadge = () => {
    if (!project.evaluation || project.evaluation.status === 'PENDING') return null;
    
    const isPass = project.evaluation.status === 'PASSED';
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
    cursor: 'pointer',
    position: 'relative'
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

  const statusBadgeStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    fontWeight: '500',
    color: getStatusColor(),
    backgroundColor: getStatusBackgroundColor(),
    padding: '6px 12px',
    borderRadius: '16px'
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

  const pendingOverlayStyle: React.CSSProperties = {
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    backgroundColor: 'rgba(249, 250, 251, 0.8)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: project.status === 'PENDING' || project.status === 'PROCESSING' ? 1 : 0,
    visibility: project.status === 'PENDING' || project.status === 'PROCESSING' ? 'visible' : 'hidden',
    transition: 'all 0.2s'
  };

  const pendingMessageStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '20px'
  };

  const spinnerStyle: React.CSSProperties = {
    width: '24px',
    height: '24px',
    border: '3px solid #f3f4f6',
    borderTop: '3px solid #f59e0b',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 12px'
  };

  // Get pillar scores from evaluation
  const getPillarScores = () => {
    if (!project.evaluation?.pillar_scores) return null;
    
    const scores = project.evaluation.pillar_scores;
    const envScore = scores.find(s => s.pillar_type === 'E')?.score || 0;
    const socScore = scores.find(s => s.pillar_type === 'S')?.score || 0;
    const govScore = scores.find(s => s.pillar_type === 'G')?.score || 0;
    
    return { envScore, socScore, govScore };
  };

  const pillarScores = getPillarScores();

  return (
    <div style={cardStyle} onClick={handleViewDetails}>
      <div style={headerStyle}>
        <div style={{ flex: 1 }}>
          <h3 style={titleStyle}>{project.project_name}</h3>
          <p style={industryStyle}>{project.industry}</p>
          {project.description && (
            <p style={{...industryStyle, marginTop: '4px', fontSize: '12px'}}>
              {project.description.length > 100 ? 
                `${project.description.substring(0, 100)}...` : 
                project.description}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          <div style={statusBadgeStyle}>
            {getStatusIcon()}
            {getDisplayStatus()}
          </div>
          {getPassFailBadge()}
        </div>
      </div>

      {/* Show evaluation scores only if evaluation exists and has pillar scores */}
      {project.evaluation && pillarScores && (project.evaluation.status === 'PASSED' || project.evaluation.status === 'FAILED') && (
        <div style={scoresSectionStyle}>
          <p style={{ fontSize: '12px', fontWeight: '500', color: '#374151', margin: '0 0 8px 0' }}>
            ESG Scores
          </p>
          <div style={scoresGridStyle}>
            <div style={scoreItemStyle}>
              <p style={scoreLabelStyle}>ENV</p>
              <p style={scoreValueStyle}>{pillarScores.envScore.toFixed(1)}</p>
            </div>
            <div style={scoreItemStyle}>
              <p style={scoreLabelStyle}>SOC</p>
              <p style={scoreValueStyle}>{pillarScores.socScore.toFixed(1)}</p>
            </div>
            <div style={scoreItemStyle}>
              <p style={scoreLabelStyle}>GOV</p>
              <p style={scoreValueStyle}>{pillarScores.govScore.toFixed(1)}</p>
            </div>
            <div style={scoreItemStyle}>
              <p style={scoreLabelStyle}>TOTAL</p>
              <p style={scoreValueStyle}>{project.evaluation.overall_score.toFixed(1)}</p>
            </div>
          </div>
        </div>
      )}

      <div style={dateStyle}>
        Created: {new Date(project.submitted_at).toLocaleDateString()}
      </div>

      <div 
        style={actionsStyle} 
        onClick={(e) => e.stopPropagation()} // Prevent card click when clicking buttons
      >
        <button 
          style={viewButtonStyle} 
          onClick={handleViewDetails}
          disabled={project.status === 'PENDING' || project.status === 'PROCESSING'}
        >
          <Eye size={14} />
          View Details
        </button>
        <button style={deleteButtonStyle} onClick={handleDelete}>
          <Trash2 size={14} />
        </button>
      </div>

      {/* Pending/Processing Overlay */}
      <div style={pendingOverlayStyle}>
        <div style={pendingMessageStyle}>
          <div style={spinnerStyle} />
          <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: '0 0 8px 0' }}>
            {project.status === 'PROCESSING' ? 'Processing...' : 'Pending...'}
          </h4>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
            Your project is being evaluated
          </p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;