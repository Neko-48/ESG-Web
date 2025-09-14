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

  // Updated dropdown options with more comprehensive matching
  const getDropdownOptions = (issueName: string): string[] | null => {
    const issueOptions: { [key: string]: string[] } = {
      // Climate Risk Management
      'การจัดการความเสี่ยงด้านสภาพภูมิอากาศ': [
        'มีแผนจัดการครบถ้วน และมีการติดตามประเมินผลสม่ำเสมอ',
        'มีแผนจัดการแต่การติดตามไม่สม่ำเสมอ',
        'มีการระบุความเสี่ยงแต่ไม่มีแผนจัดการที่ชัดเจน',
        'ไม่มีการประเมินหรือจัดการความเสี่ยง'
      ],
      // // Carbon Footprint Assessment
      'การประเมินรับมือ Carbon Footprint': [
        'มีระบบติดตาม ตั้งเป้าหมาย และมีแผนลดที่ชัดเจน',
        'มีระบบติดตามและเป้าหมายแต่แผนลดไม่ชัดเจน',
        'มีการติดตามเบื้องต้นแต่ไม่มีเป้าหมาย',
        'ไม่มีระบบติดตามหรือแผนจัดการ'
      ],
      'Carbon Footprint': [
        'มีระบบติดตาม ตั้งเป้าหมาย และมีแผนลดที่ชัดเจน',
        'มีระบบติดตามและเป้าหมายแต่แผนลดไม่ชัดเจน',
        'มีการติดตามเบื้องต้นแต่ไม่มีเป้าหมาย',
        'ไม่มีระบบติดตามหรือแผนจัดการ'
      ],
      // Waste Management and Recycling
      'การจัดการขยะและการรีไซเคิล': [
        'อัตราการรีไซเคิลมากกว่า 80%',
        'อัตราการรีไซเคิล 60-80%',
        'อัตราการรีไซเคิล 40-60%',
        'อัตราการรีไซเคิลน้อยกว่า 40%'
      ],
      // Biodiversity Conservation
      'การอนุรักษ์ความหลากหลายทางชีวภาพ': [
        'มีโปรแกรมอนุรักษ์ที่ครบถ้วนและมีผลกระทบเชิงบวก',
        'มีโปรแกรมอนุรักษ์แต่ผลกระทบจำกัด',
        'มีกิจกรรมอนุรักษ์เป็นครั้งคราว',
        'ไม่มีโปรแกรมอนุรักษ์'
      ],
      // Safety Standards - multiple possible names  
      'มาตรการความปลอดภัยในการทำงาน': [
        'ได้รับการรับรองมาตรการสากล (ISO 45001)',
        'มีระบบจัดการความปลอดภัยที่ครบถ้วน',
        'มีมาตรการความปลอดภัยขั้นพื้นฐาน',
        'ไม่มีมาตรการความปลอดภัยที่ชัดเจน'
      ],
      // Employee Safety and Quality of Life
      'ความปลอดภัยและคุณภาพชีวิตชุมชน': [
        'มีโปรแกรมพัฒนาชุมชนที่ครอบคลุมและยั่งยืน',
        'มีโปรแกรมพัฒนาชุมชนเป็นระยะ',
        'มีกิจกรรมพัฒนาชุมชนเป็นครั้งคราว',
        'ไม่มีโปรแกรมพัฒนาชุมชน'
      ],
      // Diversity and Inclusion
      'ความหลากหลายและการรวมเข้า': [
        'มีนโยบาย D&I ที่ครบถ้วนและมีการติดตามผล',
        'มีนโยบาย D&I และมีการปฏิบัติบางส่วน',
        'มีนโยบาย D&I เบื้องต้น',
        'ไม่มีนโยบาย D&I ที่ชัดเจน'
      ],
      // Labor Relations Management
      'ความสัมพันธ์ในการจัดการแรงงาน': [
        'ไม่มีข้อพิพาทแรงงานและมีระบบจัดการที่ดี',
        'มีข้อพิพาทน้อยและจัดการได้อย่างมีประสิทธิภาพ',
        'มีข้อพิพาทบางส่วนแต่สามารถจัดการได้',
        'มีข้อพิพาทแรงงานที่รุนแรงหรือยาวนาน'
      ],
      // Transparency in Reporting
      'การปฏิบัติในการรายงานความโปร่งใส': [
        'รายงานครบถ้วน ตรงเวลา และมีคุณภาพสูง',
        'รายงานครบถ้วนและตรงเวลา',
        'รายงานครบถ้วนแต่ล่าช้าบางครั้ง',
        'รายงานไม่ครบถ้วนหรือล่าช้าเป็นประจำ'
      ],
      // Data Protection and Governance - multiple possible names
      'คุณภาพการปกครองและการกำกับดูแล': [
        'ระบบกำกับดูแลที่เป็นเลิศตามมาตรการสากล',
        'ระบบกำกับดูแลที่ดีตามมาตรการทั่วไป',
        'ระบบกำกับดูแลขั้นพื้นฐาน',
        'ระบบกำกับดูแลไม่เพียงพอ'
      ],
      // Transparent Information Disclosure
      'ปฏิบัติการเปิดเผยข้อมูลที่โปร่งใส': [
        'เปิดเผยข้อมูลครบถ้วน โปร่งใส และเข้าใจง่าย',
        'เปิดเผยข้อมูลครบถ้วนและโปร่งใส',
        'เปิดเผยข้อมูลตามกฎหมายกำหนด',
        'การเปิดเผยข้อมูลไม่เพียงพอ'
      ],
      // Business Ethics Framework
      'กรอบจริยธรรมทางธุรกิจ': [
        'มีกรอบจริยธรรมที่ครอบคลุมและมีการปฏิบัติที่เป็นเลิศ',
        'มีกรอบจริยธรรมและมีการปฏิบัติที่ดี',
        'มีกรอบจริยธรรมขั้นพื้นฐาน',
        'ไม่มีกรอบจริยธรรมที่ชัดเจน'
      ]
    };

    // Try exact match first
    if (issueOptions[issueName]) {
      return issueOptions[issueName];
    }

    // Try partial matching for key terms
    const keyTermMatches = [
      { terms: ['ความเสี่ยง', 'สภาพภูมิอากาศ'], options: issueOptions['การจัดการความเสี่ยงด้านสภาพภูมิอากาศ'] },
      { terms: ['Carbon', 'Footprint'], options: issueOptions['การประเมินรับมือ Carbon Footprint'] },
      { terms: ['ความปลอดภัย', 'การทำงาน'], options: issueOptions['มาตรการความปลอดภัยในการทำงาน'] },
      { terms: ['การปกครอง', 'กำกับดูแล'], options: issueOptions['คุณภาพการปกครองและการกำกับดูแล'] }
    ];

    for (const match of keyTermMatches) {
      if (match.terms.every(term => issueName.includes(term))) {
        return match.options;
      }
    }

    return null;
  };

  // Determine if field should be numeric based on name patterns
  const isNumericField = (issueName: string): boolean => {
    const numericPatterns = [
      'การปล่อยคาร์บอน',
      'ปริมาณการใช้น้ำ',
      'เปอร์เซ็นต์การใช้พลังงานทดแทน',
      'การลงทุนด้านสิ่งแวดล้อม',
      'อัตราการบาดเจ็บในการทำงาน',
      'เปอร์เซ็นต์พนักงานที่ได้รับการพัฒนา',
      'การลงทุนในด้านการดูแลสุขภาพ',
      'การลงทุนในชุมชนและสังคม',
      'เปอร์เซ็นต์ของกรรมการอิสระ'
    ];

    return numericPatterns.some(pattern => issueName.includes(pattern));
  };

  // Load key issues from API
  useEffect(() => {
    const loadKeyIssues = async () => {
      try {
        const response = await apiRequest('GET', '/projects/key-issues');
        const issues = response.data.map((issue: KeyIssue) => {
          // Override input_type and dropdown_options based on issue name
          const dropdownOptions = getDropdownOptions(issue.name);
          const isNumeric = isNumericField(issue.name);
          
          console.log(`Issue: "${issue.name}", Dropdown Options:`, dropdownOptions); // Debug log
          
          return {
            ...issue,
            input_type: dropdownOptions ? 'dropdown' : (isNumeric ? 'numeric' : 'text'),
            dropdown_options: dropdownOptions || []
          };
        });
        
        setKeyIssues(issues);
        
        // Initialize project_data with empty values for all key issues
        const initialProjectData = issues.map((issue: KeyIssue) => ({
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

    // Clear error for this specific ESG field if it exists
    const errorKey = `esg_${issueId}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    
    // Validate basic information
    if (!formData.project_name.trim()) {
      newErrors.project_name = 'กรุณากรอกชื่อโครงการ';
    }
    
    if (!formData.industry) {
      newErrors.industry = 'กรุณาเลือกอุตสาหกรรม';
    }

    if (!formData.annual_revenue || formData.annual_revenue <= 0) {
      newErrors.annual_revenue = 'กรุณากรอกรายได้ต่อปี';
    }

    // Validate ESG data - ALL fields are required
    keyIssues.forEach(issue => {
      const projectData = formData.project_data.find(data => data.issue_id === issue.issue_id);
      const value = projectData?.value?.trim();
      
      if (!value) {
        newErrors[`esg_${issue.issue_id}`] = `กรุณากรอกข้อมูล: ${issue.name}`;
      }
    });
    
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        // All project data should be included (no filtering for empty values since all are required)
        await apiRequest('POST', '/projects', formData);
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
    const hasError = !!errors[`esg_${issue.issue_id}`];
    
    const fieldStyle = {
      ...inputStyle,
      borderColor: hasError ? '#dc2626' : '#d1d5db'
    };

    if (issue.input_type === 'dropdown' && issue.dropdown_options && issue.dropdown_options.length > 0) {
      return (
        <div>
          <select
            style={{
              ...selectStyle,
              borderColor: hasError ? '#dc2626' : '#d1d5db'
            }}
            value={currentValue}
            onChange={(e) => handleProjectDataChange(issue.issue_id, e.target.value)}
            disabled={isLoading}
          >
            <option value="">เลือกตัวเลือก</option>
            {issue.dropdown_options.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {hasError && <p style={errorStyle}>{errors[`esg_${issue.issue_id}`]}</p>}
        </div>
      );
    } else if (issue.input_type === 'numeric') {
      return (
        <div>
          <input
            type="number"
            style={fieldStyle}
            value={currentValue}
            onChange={(e) => handleProjectDataChange(issue.issue_id, e.target.value)}
            placeholder={`กรอก${issue.name}`}
            disabled={isLoading}
            min="0"
            step="0.01"
          />
          {hasError && <p style={errorStyle}>{errors[`esg_${issue.issue_id}`]}</p>}
        </div>
      );
    } else {
      return (
        <div>
          <input
            type="text"
            style={fieldStyle}
            value={currentValue}
            onChange={(e) => handleProjectDataChange(issue.issue_id, e.target.value)}
            placeholder={`กรอก${issue.name}`}
            disabled={isLoading}
          />
          {hasError && <p style={errorStyle}>{errors[`esg_${issue.issue_id}`]}</p>}
        </div>
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

  // Count errors for each pillar
  const getPillarErrorCount = (pillar: string): number => {
    if (!groupedIssues[pillar]) return 0;
    
    return groupedIssues[pillar].reduce((count, issue) => {
      return count + (errors[`esg_${issue.issue_id}`] ? 1 : 0);
    }, 0);
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

  const requiredLabelStyle: React.CSSProperties = {
    ...labelStyle,
    color: '#1f2937'
  };

  // Style for the red asterisk
  const asteriskStyle: React.CSSProperties = {
    color: '#dc2626',
    marginLeft: '2px'
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

  const pillarErrorStyle: React.CSSProperties = {
    color: '#dc2626',
    fontSize: '12px',
    marginLeft: '8px',
    fontWeight: '500'
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
            <label style={labelStyle}>
              ชื่อโครงการ<span style={asteriskStyle}>*</span>
            </label>
            <input
              type="text"
              style={{
                ...inputStyle,
                borderColor: errors.project_name ? '#dc2626' : '#d1d5db'
              }}
              value={formData.project_name}
              onChange={(e) => handleInputChange('project_name', e.target.value)}
              placeholder="กรอกชื่อโครงการ"
              disabled={isLoading}
            />
            {errors.project_name && <p style={errorStyle}>{errors.project_name}</p>}
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>
              อุตสาหกรรม<span style={asteriskStyle}>*</span>
            </label>
            <select
              style={{
                ...selectStyle,
                borderColor: errors.industry ? '#dc2626' : '#d1d5db'
              }}
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
            <label style={labelStyle}>
              รายได้ต่อปี (บาท)<span style={asteriskStyle}>*</span>
            </label>
            <input
              type="number"
              style={{
                ...inputStyle,
                borderColor: errors.annual_revenue ? '#dc2626' : '#d1d5db'
              }}
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
              <h2 style={sectionTitleStyle}>
                {title}
                {getPillarErrorCount(pillar) > 0 && (
                  <span style={pillarErrorStyle}>
                    ({getPillarErrorCount(pillar)} ข้อมูลที่ต้องกรอก)
                  </span>
                )}
              </h2>
              
              {groupedIssues[pillar].map((issue) => (
                <div key={issue.issue_id} style={fieldStyle}>
                  <label style={requiredLabelStyle}>
                    {issue.name}<span style={asteriskStyle}>*</span>
                    {issue.description && (
                      <span style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginTop: '2px', fontWeight: '400' }}>
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

        {/* Summary of missing fields */}
        {Object.keys(errors).filter(key => key.startsWith('esg_')).length > 0 && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <h3 style={{ color: '#dc2626', margin: '0 0 8px 0', fontSize: '16px' }}>
              กรุณากรอกข้อมูลให้ครบถ้วน
            </h3>
            <p style={{ color: '#7f1d1d', margin: '0', fontSize: '14px' }}>
              ยังมีข้อมูล ESG จำนวน {Object.keys(errors).filter(key => key.startsWith('esg_')).length} รายการที่ยังไม่ได้กรอก กรุณากรอกข้อมูลให้ครบถ้วนก่อนส่งโครงการ
            </p>
          </div>
        )}

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