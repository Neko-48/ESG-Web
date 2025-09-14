import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { apiRequest } from '../../services/apiService';
import type { CreateProjectFormData, KeyIssue } from '../../types/projectType';

interface CreateProjectFormProps {
  onProjectCreated: () => void;
  onCancel: () => void;
}

interface FormErrors {
  [key: string]: string;
}

const CreateProjectForm: React.FC<CreateProjectFormProps> = ({ onProjectCreated, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [keyIssues, setKeyIssues] = useState<KeyIssue[]>([]);
  const [formData, setFormData] = useState<CreateProjectFormData>({
    project_name: '',
    industry: '',
    description: '',
    annual_revenue: 0,
    project_data: []
  });

  // Industry options
  const industryOptions = [
    'เทคโนโลยี',
    'การเงินและธนาคาร',
    'พลังงาน',
    'อุตสาหกรรม',
    'สาธารณสุข',
    'อสังหาริมทรัพย์',
    'การขนส่ง',
    'เกษตรกรรม',
    'การศึกษา',
    'การท่องเที่ยว'
  ];

  // Load key issues from API
  useEffect(() => {
    const loadKeyIssues = async () => {
      try {
        const response = await apiRequest('GET', '/projects/key-issues');
        setKeyIssues(response.data);
        
        // Initialize project_data with empty values for all key issues
        const initialProjectData = response.data.map((issue: KeyIssue) => ({
          issue_id: issue.issue_id,
          value: ''
        }));
        
        setFormData(prev => ({
          ...prev,
          project_data: initialProjectData
        }));
      } catch (error) {
        console.error('Failed to load key issues:', error);
      }
    };

    loadKeyIssues();
  }, []);

  const handleInputChange = (field: keyof CreateProjectFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleProjectDataChange = (issueId: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      project_data: prev.project_data.map(data => 
        data.issue_id === issueId ? { ...data, value } : data
      )
    }));
  };

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    
    if (!formData.project_name.trim()) {
      newErrors.project_name = 'กรุณากรอกชื่อโครงการ';
    }
    
    if (!formData.industry) {
      newErrors.industry = 'กรุณาเลือกอุตสาหกรรม';
    }

    if (!formData.annual_revenue || formData.annual_revenue <= 0) {
      newErrors.annual_revenue = 'กรุณากรอกรายได้ต่อปี';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        // Filter out empty project data
        const filteredProjectData = formData.project_data.filter(data => data.value.trim() !== '');
        
        const submitData = {
          ...formData,
          project_data: filteredProjectData
        };
        
        await apiRequest('POST', '/projects', submitData);
        onProjectCreated();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการสร้างโครงการ';
        setErrors({ general: errorMessage });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const renderInputField = (issue: KeyIssue) => {
    const currentValue = formData.project_data.find(data => data.issue_id === issue.issue_id)?.value || '';

    if (issue.input_type === 'dropdown' && issue.dropdown_options) {
      return (
        <select
          style={selectStyle}
          value={currentValue}
          onChange={(e) => handleProjectDataChange(issue.issue_id, e.target.value)}
          disabled={isLoading}
        >
          <option value="">เลือกตัวเลือก</option>
          {issue.dropdown_options.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      );
    } else if (issue.input_type === 'numeric') {
      return (
        <input
          type="number"
          style={inputStyle}
          value={currentValue}
          onChange={(e) => handleProjectDataChange(issue.issue_id, e.target.value)}
          placeholder={`กรอก${issue.name}`}
          disabled={isLoading}
          min="0"
          step="0.01"
        />
      );
    } else {
      return (
        <input
          type="text"
          style={inputStyle}
          value={currentValue}
          onChange={(e) => handleProjectDataChange(issue.issue_id, e.target.value)}
          placeholder={`กรอก${issue.name}`}
          disabled={isLoading}
        />
      );
    }
  };

  // Group key issues by pillar
  const groupedIssues = keyIssues.reduce((acc, issue) => {
    if (!acc[issue.pillar]) {
      acc[issue.pillar] = [];
    }
    acc[issue.pillar].push(issue);
    return acc;
  }, {} as Record<string, KeyIssue[]>);

  const pillarTitles = {
    'E': 'Environmental (สิ่งแวดล้อม)',
    'S': 'Social (สังคม)',
    'G': 'Governance (ธรรมาภิบาล)'
  };

  // Styles
  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    padding: '24px'
  };

  const formStyle: React.CSSProperties = {
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '32px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '32px',
    paddingBottom: '16px',
    borderBottom: '2px solid #e5e7eb'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 0 12px'
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: '32px'
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '16px',
    padding: '8px 0',
    borderBottom: '1px solid #e5e7eb'
  };

  const fieldStyle: React.CSSProperties = {
    marginBottom: '20px'
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '8px'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    backgroundColor: 'white',
    color: '#111827',
    boxSizing: 'border-box'
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: 'right 8px center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '16px',
    paddingRight: '40px'
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: '100px',
    resize: 'vertical'
  };

  const buttonGroupStyle: React.CSSProperties = {
    display: 'flex',
    gap: '12px',
    marginTop: '32px',
    paddingTop: '24px',
    borderTop: '1px solid #e5e7eb'
  };

  const submitButtonStyle: React.CSSProperties = {
    flex: 1,
    padding: '12px 24px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: isLoading ? 'not-allowed' : 'pointer',
    opacity: isLoading ? 0.6 : 1
  };

  const cancelButtonStyle: React.CSSProperties = {
    flex: 1,
    padding: '12px 24px',
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer'
  };

  const errorStyle: React.CSSProperties = {
    color: '#dc2626',
    fontSize: '14px',
    marginTop: '4px'
  };

  return (
    <div style={containerStyle}>
      <form style={formStyle} onSubmit={handleSubmit}>
        <div style={headerStyle}>
          <button type="button" onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
            <ArrowLeft size={24} color="#6b7280" />
          </button>
          <h1 style={titleStyle}>Submit New ESG Project</h1>
        </div>

        {errors.general && (
          <div style={{ ...errorStyle, marginBottom: '20px', padding: '12px', backgroundColor: '#fee2e2', borderRadius: '8px' }}>
            {errors.general}
          </div>
        )}

        {/* Basic Information */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>ข้อมูลพื้นฐาน</h2>
          
          <div style={fieldStyle}>
            <label style={labelStyle}>ชื่อโครงการ</label>
            <input
              type="text"
              style={inputStyle}
              value={formData.project_name}
              onChange={(e) => handleInputChange('project_name', e.target.value)}
              placeholder="กรอกชื่อโครงการ"
              disabled={isLoading}
            />
            {errors.project_name && <p style={errorStyle}>{errors.project_name}</p>}
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>อุตสาหกรรม</label>
            <select
              style={selectStyle}
              value={formData.industry}
              onChange={(e) => handleInputChange('industry', e.target.value)}
              disabled={isLoading}
            >
              <option value="">เลือกอุตสาหกรรม</option>
              {industryOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            {errors.industry && <p style={errorStyle}>{errors.industry}</p>}
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>รายได้ต่อปี (บาท)</label>
            <input
              type="number"
              style={inputStyle}
              value={formData.annual_revenue || ''}
              onChange={(e) => handleInputChange('annual_revenue', parseFloat(e.target.value) || 0)}
              placeholder="กรอกรายได้ต่อปีเป็นบาท"
              disabled={isLoading}
              min="0"
              step="1000"
            />
            {errors.annual_revenue && <p style={errorStyle}>{errors.annual_revenue}</p>}
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>คำอธิบายโครงการ</label>
            <textarea
              style={textareaStyle}
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="กรอกคำอธิบายโครงการ (ไม่บังคับ)"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* ESG Data Sections */}
        {Object.entries(pillarTitles).map(([pillar, title]) => (
          groupedIssues[pillar] && groupedIssues[pillar].length > 0 && (
            <div key={pillar} style={sectionStyle}>
              <h2 style={sectionTitleStyle}>{title}</h2>
              
              {groupedIssues[pillar].map((issue) => (
                <div key={issue.issue_id} style={fieldStyle}>
                  <label style={labelStyle}>
                    {issue.name}
                    {issue.description && (
                      <span style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginTop: '2px' }}>
                        {issue.description}
                      </span>
                    )}
                  </label>
                  {renderInputField(issue)}
                </div>
              ))}
            </div>
          )
        ))}

        {/* Submit Buttons */}
        <div style={buttonGroupStyle}>
          <button
            type="submit"
            style={submitButtonStyle}
            disabled={isLoading}
          >
            {isLoading ? 'กำลังส่งข้อมูล...' : 'ส่งเพื่อตรวจสอบ'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={cancelButtonStyle}
            disabled={isLoading}
          >
            ยกเลิก
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProjectForm;