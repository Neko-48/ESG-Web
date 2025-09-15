import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Project } from '../../types/projectType';
import { Clock, CheckCircle, XCircle, Eye } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    // Navigate to project details page using React Router
    navigate(`/project/${project.project_id}`);
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
        return <Clock size={16} color="#f59e0b" />;
      case 'PASSED':
        return <CheckCircle size={16} color="#10b981" />;
      case 'FAILED':
        return <XCircle size={16} color="#ef4444" />;
      default:
        return <Clock size={16} color="#6b7280" />;
    }
  };

  const getStatusColor = () => {
    const status = getDisplayStatus();
    switch (status) {
      case 'PENDING':
        return '#f59e0b';
      case 'PASSED':
        return '#10b981';
      case 'FAILED':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusBackgroundColor = () => {
    const status = getDisplayStatus();
    switch (status) {
      case 'PENDING':
        return '#fef3c7';
      case 'PASSED':
        return '#dcfce7';
      case 'FAILED':
        return '#fee2e2';
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
      color: isPass ? '#166534' : '#991b1b',
      marginTop: '4px'
    };

    return (
      <span style={badgeStyle}>
        {isPass ? 'PASS' : 'FAIL'}
      </span>
    );
  };

  // Main card container with relative positioning
  const cardStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    transition: 'all 0.2s',
    cursor: 'pointer',
    position: 'relative',
    width: '100%',
    minHeight: '150px'
  };

  // Status section in top right
  const statusSectionStyle: React.CSSProperties = {
    position: 'absolute',
    top: '16px',
    right: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '4px'
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
    borderRadius: '16px',
    whiteSpace: 'nowrap'
  };

  // Project information section
  const projectInfoStyle: React.CSSProperties = {
    paddingRight: '180px', // Space for status section
    paddingBottom: '60px' // Space for bottom elements
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
    margin: '0 0 8px 0'
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: '1.4',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    margin: '0'
  };

  // ESG Scores section (if available)
  const scoresSectionStyle: React.CSSProperties = {
    display: 'flex',
    gap: '16px',
    marginTop: '12px',
    padding: '12px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    marginRight: '180px' // Account for status section
  };

  const scoreItemStyle: React.CSSProperties = {
    textAlign: 'center'
  };

  const scoreLabelStyle: React.CSSProperties = {
    fontSize: '11px',
    color: '#6b7280',
    margin: '0 0 2px 0'
  };

  const scoreValueStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0'
  };

  // Bottom section with date and view button
  const bottomSectionStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '16px',
    left: '24px',
    right: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const dateStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#9ca3af'
  };

  const viewButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backgroundColor: '#A9DEF9',
    color: 'white#3b82f6'
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
      {/* Status Section - Top Right */}
      <div style={statusSectionStyle}>
        <div style={statusBadgeStyle}>
          {getStatusIcon()}
          {getDisplayStatus()}
        </div>
        {getPassFailBadge()}
      </div>

      {/* Project Information */}
      <div style={projectInfoStyle}>
        <h3 style={titleStyle}>{project.project_name}</h3>
        <p style={industryStyle}>{project.industry}</p>
        {project.description && (
          <p style={descriptionStyle}>
            {project.description}
          </p>
        )}

        {/* ESG Scores Section */}
        {project.evaluation && pillarScores && (project.evaluation.status === 'PASSED' || project.evaluation.status === 'FAILED') && (
          <div style={scoresSectionStyle}>
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
        )}
      </div>

      {/* Bottom Section - Date (left) and View Button (right) */}
      <div style={bottomSectionStyle}>
        <div style={dateStyle}>
          Created: {new Date(project.submitted_at).toLocaleDateString()}
        </div>
        <button 
          style={viewButtonStyle} 
          onClick={(e) => {
            e.stopPropagation();
            handleViewDetails();
          }}
        >
          <Eye size={16} />
          View Details
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;