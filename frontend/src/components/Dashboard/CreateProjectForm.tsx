import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { apiRequest } from '../../services/apiService';
import type { CreateProjectFormData } from '../../types/projectType';

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
  const [formData, setFormData] = useState<CreateProjectFormData>({
    project_name: '',
    industry: '',
    environmental_data: JSON.stringify({
      scope1_2_emissions: '',
      water_consumption_initiatives: '',
      carbon_footprint_programs: '',
      water_usage_cubic_meters: '',
      waste_recycling_programs: '',
      biodiversity_conservation: '',
      renewable_energy_programs: '',
      renewable_energy_programs_2: '',
      renewable_energy_percentage: '',
      water_conservation_volume: ''
    }),
    social_data: JSON.stringify({
      community_safety_programs: '',
      employee_development_initiatives: '',
      employee_turnover_rate: '',
      workplace_safety_measures: '',
      community_safety_initiatives: '',
      diversity_inclusion_programs: '',
      social_responsibility_programs: '',
      community_investment_amount: ''
    }),
    governance_data: JSON.stringify({
      board_independence_percentage: '',
      transparency_reporting_practices: '',
      ethics_compliance_policies: '',
      risk_management_frameworks: '',
      transparency_disclosure_practices: ''
    })
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

  // Dropdown options for various fields
  const waterConsumptionOptions = [
    'มีการดำเนินการอย่างเป็นระบบ',
    'มีการดำเนินการบางส่วน',
    'อยู่ระหว่างการศึกษา',
    'ไม่มีการดำเนินการ'
  ];

  const carbonFootprintOptions = [
    'มีโปรแกรมครบถ้วน',
    'มีโปรแกรมบางส่วน',
    'อยู่ระหว่างพัฒนา',
    'ไม่มีโปรแกรม'
  ];

  const wasteRecyclingOptions = [
    'รีไซเคิลมากกว่า 80%',
    'รีไซเคิล 60-80%',
    'รีไซเคิล 40-60%',
    'รีไซเคิลน้อยกว่า 40%',
    'ไม่มีการรีไซเคิล'
  ];

  const biodiversityOptions = [
    'มีโปรแกรมอนุรักษ์เฉพาะ',
    'สนับสนุนโปรแกรมอนุรักษ์',
    'อยู่ระหว่างการศึกษา',
    'ไม่มีโปรแกรมเฉพาะ'
  ];

  const renewableEnergyOptions = [
    'พลังงานแสงอาทิตย์',
    'พลังงานลม',
    'พลังงานน้ำ',
    'พลังงานชีวมวล',
    'ไม่มีการใช้พลังงานทดแทน'
  ];

  const workplaceSafetyOptions = [
    'มีมาตรฐาน ISO 45001',
    'มีระบบความปลอดภัยเฉพาะ',
    'ปฏิบัติตามกฎหมายเท่านั้น',
    'ไม่มีระบบเฉพาะ'
  ];

  const communityProgramsOptions = [
    'มีโปรแกรมสม่ำเสมอ',
    'มีโปรแกรมเป็นครั้งคราว',
    'สนับสนุนองค์กรภายนอก',
    'ไม่มีโปรแกรมเฉพาะ'
  ];

  const diversityInclusionOptions = [
    'มีนโยบายและเป้าหมายชัดเจน',
    'มีนโยบายแต่ไม่มีเป้าหมายเฉพาะ',
    'อยู่ระหว่างการพัฒนา',
    'ไม่มีนโยบายเฉพาะ'
  ];

  const transparencyOptions = [
    'มีการรายงานสม่ำเสมอ',
    'รายงานตามกฎหมาย',
    'รายงานบางส่วน',
    'ไม่มีการรายงานเฉพาะ'
  ];

  const ethicsComplianceOptions = [
    'มีนโยบายและการฝึกอบรม',
    'มีนโยบายแต่ไม่มีการฝึกอบรม',
    'อยู่ระหว่างการพัฒนา',
    'ปฏิบัติตามกฎหมายเท่านั้น'
  ];

  const riskManagementOptions = [
    'มีกรอบการจัดการความเสี่ยงที่ครบถ้วน',
    'มีกรอบการจัดการความเสี่ยงพื้นฐาน',
    'อยู่ระหว่างการพัฒนา',
    'ไม่มีกรอบเฉพาะ'
  ];

  const transparencyDisclosureOptions = [
    'เปิดเผยข้อมูลอย่างโปร่งใส',
    'เปิดเผยตามที่กฎหมายกำหนด',
    'เปิดเผยบางส่วน',
    'ไม่มีการเปิดเผยเฉพาะ'
  ];

  const handleInputChange = (field: keyof CreateProjectFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleEnvironmentalChange = (field: string, value: string) => {
    const currentData = JSON.parse(formData.environmental_data);
    currentData[field] = value;
    setFormData(prev => ({ 
      ...prev, 
      environmental_data: JSON.stringify(currentData) 
    }));
  };

  const handleSocialChange = (field: string, value: string) => {
    const currentData = JSON.parse(formData.social_data);
    currentData[field] = value;
    setFormData(prev => ({ 
      ...prev, 
      social_data: JSON.stringify(currentData) 
    }));
  };

  const handleGovernanceChange = (field: string, value: string) => {
    const currentData = JSON.parse(formData.governance_data);
    currentData[field] = value;
    setFormData(prev => ({ 
      ...prev, 
      governance_data: JSON.stringify(currentData) 
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
    
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
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

  const parseEnvironmentalData = () => JSON.parse(formData.environmental_data);
  const parseSocialData = () => JSON.parse(formData.social_data);
  const parseGovernanceData = () => JSON.parse(formData.governance_data);

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
        </div>

        {/* Environmental Section */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Environmental</h2>
          
          <div style={fieldStyle}>
            <label style={labelStyle}>การปล่อยคาร์บอน (Scope 1+2 tCO2e)</label>
            <input
              type="text"
              style={inputStyle}
              value={parseEnvironmentalData().scope1_2_emissions}
              onChange={(e) => handleEnvironmentalChange('scope1_2_emissions', e.target.value)}
              placeholder="กรอกปริมาณการปล่อยคาร์บอน"
              disabled={isLoading}
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>ความเสี่ยงต่อการเปลี่ยนแปลงสภาพภูมิอากาศ</label>
            <select
              style={selectStyle}
              value={parseEnvironmentalData().water_consumption_initiatives}
              onChange={(e) => handleEnvironmentalChange('water_consumption_initiatives', e.target.value)}
              disabled={isLoading}
            >
              <option value="">เลือกระดับความเสี่ยง</option>
              {waterConsumptionOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>การประเมินรับมือ Carbon Footprint ขององค์กรนั้น</label>
            <select
              style={selectStyle}
              value={parseEnvironmentalData().carbon_footprint_programs}
              onChange={(e) => handleEnvironmentalChange('carbon_footprint_programs', e.target.value)}
              disabled={isLoading}
            >
              <option value="">เลือกระดับการประเมิน</option>
              {carbonFootprintOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>ปริมาณการใช้น้ำ (ลูกบาศก์เมตร/ปี)</label>
            <input
              type="text"
              style={inputStyle}
              value={parseEnvironmentalData().water_usage_cubic_meters}
              onChange={(e) => handleEnvironmentalChange('water_usage_cubic_meters', e.target.value)}
              placeholder="กรอกปริมาณการใช้น้ำ"
              disabled={isLoading}
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>การจัดการขยะและการรีไซเคิล</label>
            <select
              style={selectStyle}
              value={parseEnvironmentalData().waste_recycling_programs}
              onChange={(e) => handleEnvironmentalChange('waste_recycling_programs', e.target.value)}
              disabled={isLoading}
            >
              <option value="">เลือกระดับการจัดการขยะ</option>
              {wasteRecyclingOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>การอนุรักษ์ความหลากหลายทางชีวภาพ</label>
            <select
              style={selectStyle}
              value={parseEnvironmentalData().biodiversity_conservation}
              onChange={(e) => handleEnvironmentalChange('biodiversity_conservation', e.target.value)}
              disabled={isLoading}
            >
              <option value="">เลือกระดับการจัดการ</option>
              {biodiversityOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>โปรแกรมพลังงานทดแทน (ประเภทที่ 1)</label>
            <select
              style={selectStyle}
              value={parseEnvironmentalData().renewable_energy_programs}
              onChange={(e) => handleEnvironmentalChange('renewable_energy_programs', e.target.value)}
              disabled={isLoading}
            >
              <option value="">เลือกประเภทพลังงานทดแทน</option>
              {renewableEnergyOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>โปรแกรมพลังงานทดแทน (ประเภทที่ 2)</label>
            <select
              style={selectStyle}
              value={parseEnvironmentalData().renewable_energy_programs_2}
              onChange={(e) => handleEnvironmentalChange('renewable_energy_programs_2', e.target.value)}
              disabled={isLoading}
            >
              <option value="">เลือกประเภทพลังงานทดแทน</option>
              {renewableEnergyOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>เปอร์เซ็นต์การใช้พลังงานทดแทน (%)</label>
            <input
              type="text"
              style={inputStyle}
              value={parseEnvironmentalData().renewable_energy_percentage}
              onChange={(e) => handleEnvironmentalChange('renewable_energy_percentage', e.target.value)}
              placeholder="กรอกเปอร์เซ็นต์"
              disabled={isLoading}
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>การลงทุนด้านสิ่งแวดล้อม (บาท)</label>
            <input
              type="text"
              style={inputStyle}
              value={parseEnvironmentalData().water_conservation_volume}
              onChange={(e) => handleEnvironmentalChange('water_conservation_volume', e.target.value)}
              placeholder="กรอกจำนวนเงิน"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Social Section */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Social</h2>
          
          <div style={fieldStyle}>
            <label style={labelStyle}>สุขภาพและความปลอดภัย (อัตราการบาดเจ็บ)</label>
            <input
              type="text"
              style={inputStyle}
              value={parseSocialData().community_safety_programs}
              onChange={(e) => handleSocialChange('community_safety_programs', e.target.value)}
              placeholder="กรอกอัตราการบาดเจ็บ"
              disabled={isLoading}
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>ความสามารถในการจัดการความเสี่ยง</label>
            <select
              style={selectStyle}
              value={parseSocialData().employee_development_initiatives}
              onChange={(e) => handleSocialChange('employee_development_initiatives', e.target.value)}
              disabled={isLoading}
            >
              <option value="">เลือกระดับการจัดการ</option>
              {workplaceSafetyOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>การพัฒนาบุคลากร (%)</label>
            <input
              type="text"
              style={inputStyle}
              value={parseSocialData().employee_turnover_rate}
              onChange={(e) => handleSocialChange('employee_turnover_rate', e.target.value)}
              placeholder="กรอกเปอร์เซ็นต์การพัฒนาบุคลากร"
              disabled={isLoading}
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>มาตรฐานความปลอดภัยในการทำงาน</label>
            <select
              style={selectStyle}
              value={parseSocialData().workplace_safety_measures}
              onChange={(e) => handleSocialChange('workplace_safety_measures', e.target.value)}
              disabled={isLoading}
            >
              <option value="">เลือกมาตรฐาน</option>
              {workplaceSafetyOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>ความปลอดภัยและคุณภาพชีวิตชุมชน</label>
            <select
              style={selectStyle}
              value={parseSocialData().community_safety_initiatives}
              onChange={(e) => handleSocialChange('community_safety_initiatives', e.target.value)}
              disabled={isLoading}
            >
              <option value="">เลือกระดับ</option>
              {communityProgramsOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>ความหลากหลายและการรวมเข้า</label>
            <select
              style={selectStyle}
              value={parseSocialData().diversity_inclusion_programs}
              onChange={(e) => handleSocialChange('diversity_inclusion_programs', e.target.value)}
              disabled={isLoading}
            >
              <option value="">เลือกระดับ</option>
              {diversityInclusionOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>การจัดการปลอดภัยสาธารณะ</label>
            <textarea
              style={textareaStyle}
              value={parseSocialData().social_responsibility_programs}
              onChange={(e) => handleSocialChange('social_responsibility_programs', e.target.value)}
              placeholder="กรอกรายละเอียดโปรแกรมความรับผิดชอบต่อสังคม"
              disabled={isLoading}
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>การลงทุนในชุมชนและสังคม (บาท)</label>
            <input
              type="text"
              style={inputStyle}
              value={parseSocialData().community_investment_amount}
              onChange={(e) => handleSocialChange('community_investment_amount', e.target.value)}
              placeholder="กรอกจำนวนเงินลงทุน"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Governance Section */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Governance</h2>
          
          <div style={fieldStyle}>
            <label style={labelStyle}>เปอร์เซ็นต์ของกรรมการอิสระ (%)</label>
            <input
              type="text"
              style={inputStyle}
              value={parseGovernanceData().board_independence_percentage}
              onChange={(e) => handleGovernanceChange('board_independence_percentage', e.target.value)}
              placeholder="กรอกเปอร์เซ็นต์กรรมการอิสระ"
              disabled={isLoading}
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>การปฏิบัติในการรายงานความโปร่งใส</label>
            <select
              style={selectStyle}
              value={parseGovernanceData().transparency_reporting_practices}
              onChange={(e) => handleGovernanceChange('transparency_reporting_practices', e.target.value)}
              disabled={isLoading}
            >
              <option value="">เลือกระดับ</option>
              {transparencyOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>คุณภาพการปกครองและความโปร่งใส</label>
            <select
              style={selectStyle}
              value={parseGovernanceData().ethics_compliance_policies}
              onChange={(e) => handleGovernanceChange('ethics_compliance_policies', e.target.value)}
              disabled={isLoading}
            >
              <option value="">เลือกระดับ</option>
              {ethicsComplianceOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>กรอบการจัดการความเสี่ยง</label>
            <select
              style={selectStyle}
              value={parseGovernanceData().risk_management_frameworks}
              onChange={(e) => handleGovernanceChange('risk_management_frameworks', e.target.value)}
              disabled={isLoading}
            >
              <option value="">เลือกระดับ</option>
              {riskManagementOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>ปฏิบัติการเปิดเผยข้อมูลที่โปร่งใส</label>
            <select
              style={selectStyle}
              value={parseGovernanceData().transparency_disclosure_practices}
              onChange={(e) => handleGovernanceChange('transparency_disclosure_practices', e.target.value)}
              disabled={isLoading}
            >
              <option value="">เลือกระดับ</option>
              {transparencyDisclosureOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>

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