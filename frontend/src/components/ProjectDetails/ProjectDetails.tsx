import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, XCircle, Calendar, Building, User, TrendingUp, AlertTriangle, Target, Leaf, Users, Scale } from 'lucide-react';
import { apiRequest } from '../../services/apiService';
import type { Project } from '../../types/projectType';

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (id) {
      fetchProjectDetails(id);
    }
  }, [id]);

  const fetchProjectDetails = async (projectId: string) => {
    try {
      setIsLoading(true);
      const response = await apiRequest<Project>('GET', `/projects/${projectId}`);
      if (response.success && response.data) {
        setProject(response.data);
      } else {
        setError('Project not found');
      }
    } catch (error) {
      console.error('Failed to fetch project details:', error);
      setError('Failed to load project details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock size={20} color="#f59e0b" />;
      case 'PASSED':
        return <CheckCircle size={20} color="#10b981" />;
      case 'FAILED':
        return <XCircle size={20} color="#ef4444" />;
      default:
        return <Clock size={20} color="#6b7280" />;
    }
  };

  const getStatusColor = (status: string) => {
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

  const getStatusBackgroundColor = (status: string) => {
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

  const parseJsonData = (jsonString: string) => {
    try {
      return JSON.parse(jsonString);
    } catch {
      return {};
    }
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ fontSize: '18px', color: '#6b7280', margin: '0' }}>
            Loading project details...
          </p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <XCircle size={48} color="#ef4444" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '24px', color: '#1f2937', margin: '0 0 8px 0' }}>
            {error || 'Project not found'}
          </h2>
          <p style={{ fontSize: '16px', color: '#6b7280', margin: '0 0 24px 0' }}>
            The project you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <button
            onClick={handleBack}
            style={{
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '0 auto'
            }}
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const environmentalData = parseJsonData(project.environmental_data);
  const socialData = parseJsonData(project.social_data);
  const governanceData = parseJsonData(project.governance_data);

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: '#f9fafb'
  };

  const headerStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderBottom: '1px solid #e5e7eb',
    padding: '16px 24px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
  };

  const headerContentStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  };

  const backButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: '#f3f4f6',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151'
  };

  const contentStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px'
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '28px',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 16px 0'
  };

  const statusBadgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '500',
    backgroundColor: getStatusBackgroundColor(project.status),
    color: getStatusColor(project.status),
    marginBottom: '24px'
  };

  const infoGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px',
    marginBottom: '24px'
  };

  const infoItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px'
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 16px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const dataGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '16px'
  };

  const dataItemStyle: React.CSSProperties = {
    padding: '12px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    borderLeft: '4px solid #3b82f6'
  };

  const dataLabelStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: '500',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '4px'
  };

  const dataValueStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#1f2937',
    fontWeight: '500'
  };

  const scoresGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '16px',
    marginTop: '16px'
  };

  const scoreCardStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb'
  };

  const scoreValueStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 4px 0'
  };

  const scoreLabelStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#6b7280',
    margin: '0'
  };

  const insightSectionStyle: React.CSSProperties = {
    marginTop: '16px'
  };

  const insightCardStyle: React.CSSProperties = {
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    marginBottom: '12px'
  };

  const insightTitleStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const insightTextStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#4b5563',
    lineHeight: '1.5'
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={headerContentStyle}>
          <button style={backButtonStyle} onClick={handleBack}>
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', margin: '0' }}>
            Project Details
          </h1>
        </div>
      </div>

      {/* Content */}
      <div style={contentStyle}>
        {/* Project Overview */}
        <div style={cardStyle}>
          <h1 style={titleStyle}>{project.project_name}</h1>
          
          <div style={statusBadgeStyle}>
            {getStatusIcon(project.status)}
            {project.status}
          </div>

          <div style={infoGridStyle}>
            <div style={infoItemStyle}>
              <Building size={16} color="#6b7280" />
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0' }}>Industry</p>
                <p style={{ fontSize: '14px', color: '#1f2937', fontWeight: '500', margin: '0' }}>
                  {project.industry}
                </p>
              </div>
            </div>
            <div style={infoItemStyle}>
              <Calendar size={16} color="#6b7280" />
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0' }}>Created</p>
                <p style={{ fontSize: '14px', color: '#1f2937', fontWeight: '500', margin: '0' }}>
                  {new Date(project.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div style={infoItemStyle}>
              <User size={16} color="#6b7280" />
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0' }}>Project ID</p>
                <p style={{ fontSize: '14px', color: '#1f2937', fontWeight: '500', margin: '0' }}>
                  #{project.project_id}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ESG Evaluation Results */}
        {project.evaluation && (
          <div style={cardStyle}>
            <h2 style={sectionTitleStyle}>
              <TrendingUp size={20} color="#3b82f6" />
              ESG Evaluation Results
            </h2>

            <div style={scoresGridStyle}>
              <div style={scoreCardStyle}>
                <h3 style={scoreValueStyle}>{project.evaluation.environmental_score.toFixed(1)}</h3>
                <p style={scoreLabelStyle}>Environmental</p>
              </div>
              <div style={scoreCardStyle}>
                <h3 style={scoreValueStyle}>{project.evaluation.social_score.toFixed(1)}</h3>
                <p style={scoreLabelStyle}>Social</p>
              </div>
              <div style={scoreCardStyle}>
                <h3 style={scoreValueStyle}>{project.evaluation.governance_score.toFixed(1)}</h3>
                <p style={scoreLabelStyle}>Governance</p>
              </div>
              <div style={{
                ...scoreCardStyle,
                backgroundColor: project.evaluation.pass_fail === 'PASS' ? '#dcfce7' : '#fee2e2',
                border: `1px solid ${project.evaluation.pass_fail === 'PASS' ? '#10b981' : '#ef4444'}`
              }}>
                <h3 style={{
                  ...scoreValueStyle,
                  color: project.evaluation.pass_fail === 'PASS' ? '#166534' : '#991b1b'
                }}>
                  {project.evaluation.overall_score.toFixed(1)}
                </h3>
                <p style={{
                  ...scoreLabelStyle,
                  color: project.evaluation.pass_fail === 'PASS' ? '#166534' : '#991b1b',
                  fontWeight: '600'
                }}>
                  Overall Score
                </p>
              </div>
            </div>

            <div style={insightSectionStyle}>
              {project.evaluation.recommendations && (
                <div style={insightCardStyle}>
                  <h4 style={insightTitleStyle}>
                    <Target size={16} color="#3b82f6" />
                    Recommendations
                  </h4>
                  <p style={insightTextStyle}>{project.evaluation.recommendations}</p>
                </div>
              )}

              {project.evaluation.strengths && (
                <div style={insightCardStyle}>
                  <h4 style={insightTitleStyle}>
                    <CheckCircle size={16} color="#10b981" />
                    Strengths
                  </h4>
                  <p style={insightTextStyle}>{project.evaluation.strengths}</p>
                </div>
              )}

              {project.evaluation.risks && (
                <div style={insightCardStyle}>
                  <h4 style={insightTitleStyle}>
                    <AlertTriangle size={16} color="#f59e0b" />
                    Risks
                  </h4>
                  <p style={insightTextStyle}>{project.evaluation.risks}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Environmental Data */}
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>
            <Leaf size={20} color="#10b981" />
            Environmental Data
          </h2>
          <div style={dataGridStyle}>
            {Object.entries(environmentalData).map(([key, value]) => (
              <div key={key} style={dataItemStyle}>
                <p style={dataLabelStyle}>{key.replace(/_/g, ' ')}</p>
                <p style={dataValueStyle}>{String(value) || 'N/A'}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Social Data */}
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>
            <Users size={20} color="#3b82f6" />
            Social Data
          </h2>
          <div style={dataGridStyle}>
            {Object.entries(socialData).map(([key, value]) => (
              <div key={key} style={dataItemStyle}>
                <p style={dataLabelStyle}>{key.replace(/_/g, ' ')}</p>
                <p style={dataValueStyle}>{String(value) || 'N/A'}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Governance Data */}
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>
            <Scale size={20} color="#f59e0b" />
            Governance Data
          </h2>
          <div style={dataGridStyle}>
            {Object.entries(governanceData).map(([key, value]) => (
              <div key={key} style={dataItemStyle}>
                <p style={dataLabelStyle}>{key.replace(/_/g, ' ')}</p>
                <p style={dataValueStyle}>{String(value) || 'N/A'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;