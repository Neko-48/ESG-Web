import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, XCircle, Calendar, Building, User, TrendingUp, Leaf, Users, Scale, DollarSign } from 'lucide-react';
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

  const getDisplayStatus = () => {
    if (!project?.evaluation) {
      return project?.status || 'PENDING';
    }
    return project.evaluation.status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
      case 'PROCESSING':
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
      case 'PROCESSING':
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
      case 'PROCESSING':
        return '#fef3c7';
      case 'PASSED':
        return '#dcfce7';
      case 'FAILED':
        return '#fee2e2';
      default:
        return '#f3f4f6';
    }
  };

  const formatRevenue = (amount?: number): string => {
    if (!amount || amount === 0) return 'ไม่ระบุ';
    
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}B THB`;
    } else {
      return `${amount.toLocaleString()} M THB`;
    }
  };

  const getPillarData = (pillar: 'E' | 'S' | 'G') => {
    if (!project?.project_data) return [];
    return project.project_data.filter(data => data.pillar === pillar);
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

  const displayStatus = getDisplayStatus();
  const environmentalData = getPillarData('E');
  const socialData = getPillarData('S');
  const governanceData = getPillarData('G');

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
    margin: '0 0 8px 0'
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: '16px',
    color: '#6b7280',
    lineHeight: '1.6',
    margin: '0 0 20px 0'
  };

  const statusBadgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '500',
    backgroundColor: getStatusBackgroundColor(displayStatus),
    color: getStatusColor(displayStatus),
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
    color: '#6b7280',
    margin: '0 0 4px 0'
  };

  const scoreLabelStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#6b7280',
    margin: '0'
  };

  const pendingMessageStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '40px 20px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb'
  };

  const pendingTextStyle: React.CSSProperties = {
    fontSize: '16px',
    color: '#6b7280',
    margin: '8px 0 0 0'
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
          
          {/* Project Description */}
          {project.description && (
            <p style={descriptionStyle}>
              {project.description}
            </p>
          )}
          
          <div style={statusBadgeStyle}>
            {getStatusIcon(displayStatus)}
            {displayStatus}
          </div>

          <div style={infoGridStyle}>
            <div style={infoItemStyle}>
              <Building size={16} color="#6b7280" />
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0' }}>อุตสาหกรรม</p>
                <p style={{ fontSize: '14px', color: '#1f2937', fontWeight: '500', margin: '0' }}>
                  {project.industry}
                </p>
              </div>
            </div>
            <div style={infoItemStyle}>
              <Calendar size={16} color="#6b7280" />
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0' }}>วันที่สร้าง</p>
                <p style={{ fontSize: '14px', color: '#1f2937', fontWeight: '500', margin: '0' }}>
                  {new Date(project.submitted_at).toLocaleDateString('th-TH')}
                </p>
              </div>
            </div>
            <div style={infoItemStyle}>
              <User size={16} color="#6b7280" />
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0' }}>รหัสโครงการ</p>
                <p style={{ fontSize: '14px', color: '#1f2937', fontWeight: '500', margin: '0' }}>
                  #{project.project_id}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ESG Evaluation Results */}
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>
            <TrendingUp size={20} color="#3b82f6" />
            ผลการประเมิน ESG
          </h2>

          {project.evaluation && project.evaluation.status !== 'PENDING' ? (
            <>
              <div style={scoresGridStyle}>
                {project.evaluation.pillar_scores?.map((pillar) => (
                  <div key={pillar.pillar_type} style={scoreCardStyle}>
                    <h3 style={scoreValueStyle}>{pillar.score.toFixed(1)}</h3>
                    <p style={scoreLabelStyle}>
                      {pillar.pillar_type === 'E' ? 'Environmental' : 
                       pillar.pillar_type === 'S' ? 'Social' : 'Governance'}
                    </p>
                  </div>
                ))}
                <div style={{
                  ...scoreCardStyle,
                  backgroundColor: project.evaluation.status === 'PASSED' ? '#dcfce7' : '#fee2e2',
                  border: `1px solid ${project.evaluation.status === 'PASSED' ? '#10b981' : '#ef4444'}`
                }}>
                  <h3 style={{
                    ...scoreValueStyle,
                    color: project.evaluation.status === 'PASSED' ? '#166534' : '#991b1b'
                  }}>
                    {project.evaluation.overall_score.toFixed(1)}
                  </h3>
                  <p style={{
                    ...scoreLabelStyle,
                    color: project.evaluation.status === 'PASSED' ? '#166534' : '#991b1b',
                    fontWeight: '600'
                  }}>
                    คะแนนรวม
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div style={pendingMessageStyle}>
              <Clock size={32} color="#6b7280" style={{ margin: '0 auto' }} />
              <p style={pendingTextStyle}>
                โครงการนี้ยังไม่ได้รับการประเมิน
              </p>
              <p style={{ fontSize: '14px', color: '#9ca3af', margin: '4px 0 0 0' }}>
                กรุณารอระบบประมวลผลการประเมิน ESG
              </p>
            </div>
          )}
        </div>

        {/* Environmental Data */}
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>
            <Leaf size={20} color="#10b981" />
            ข้อมูลด้านสิ่งแวดล้อม (Environmental)
          </h2>
          {environmentalData.length > 0 ? (
            <div style={dataGridStyle}>
              {environmentalData.map((data) => (
                <div key={data.data_id} style={dataItemStyle}>
                  <p style={dataLabelStyle}>{data.issue_name || `Issue ${data.issue_id}`}</p>
                  <p style={dataValueStyle}>{data.value || 'N/A'}</p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#6b7280', fontStyle: 'italic' }}>ไม่มีข้อมูลด้านสิ่งแวดล้อม</p>
          )}
        </div>

        {/* Social Data */}
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>
            <Users size={20} color="#3b82f6" />
            ข้อมูลด้านสังคม (Social)
          </h2>
          {socialData.length > 0 ? (
            <div style={dataGridStyle}>
              {socialData.map((data) => (
                <div key={data.data_id} style={dataItemStyle}>
                  <p style={dataLabelStyle}>{data.issue_name || `Issue ${data.issue_id}`}</p>
                  <p style={dataValueStyle}>{data.value || 'N/A'}</p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#6b7280', fontStyle: 'italic' }}>ไม่มีข้อมูลด้านสังคม</p>
          )}
        </div>

        {/* Governance Data */}
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>
            <Scale size={20} color="#f59e0b" />
            ข้อมูลด้านการกำกับดูแล (Governance)
          </h2>
          {governanceData.length > 0 ? (
            <div style={dataGridStyle}>
              {governanceData.map((data) => (
                <div key={data.data_id} style={dataItemStyle}>
                  <p style={dataLabelStyle}>{data.issue_name || `Issue ${data.issue_id}`}</p>
                  <p style={dataValueStyle}>{data.value || 'N/A'}</p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#6b7280', fontStyle: 'italic' }}>ไม่มีข้อมูลด้านการกำกับดูแล</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;