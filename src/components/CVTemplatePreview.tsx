// src/components/CVTemplatePreview.tsx
import { premiumService } from '@/services/paymentService';
import { Award, Mail, Phone, MapPin } from 'lucide-react';

interface CVData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    professionalSummary?: string;
  } | null;
  education: Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
    description?: string;
  }>;
  experience: Array<{
    jobTitle: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  skills: Array<{
    skillName: string;
    proficiency: string;
  }>;
}

interface CVTemplatePreviewProps {
  data: CVData;
  template?: 'modern' | 'classic' | 'minimal';
}

// Template 1: Modern (Premium)
export function ModernTemplate({ data }: { data: CVData }) {
  return (
    <div className="w-full bg-white text-gray-900 font-sans leading-relaxed print:p-0 p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b-4 border-blue-600 pb-6 mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{data.personalInfo?.fullName}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          {data.personalInfo?.email && (
            <div className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              {data.personalInfo.email}
            </div>
          )}
          {data.personalInfo?.phone && (
            <div className="flex items-center gap-1">
              <Phone className="w-4 h-4" />
              {data.personalInfo.phone}
            </div>
          )}
          {data.personalInfo?.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {data.personalInfo.location}
            </div>
          )}
        </div>
      </div>

      {/* Professional Summary */}
      {data.personalInfo?.professionalSummary && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-blue-600 mb-3 border-b-2 border-blue-600 pb-2">
            Professional Summary
          </h2>
          <p className="text-gray-700 leading-relaxed">{data.personalInfo.professionalSummary}</p>
        </section>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-blue-600 mb-4 border-b-2 border-blue-600 pb-2">
            Work Experience
          </h2>
          <div className="space-y-5">
            {data.experience.map((exp, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{exp.jobTitle}</h3>
                    <p className="text-blue-600 font-semibold">{exp.company}</p>
                  </div>
                  <span className="text-sm text-gray-600 font-semibold">
                    {exp.startDate} - {exp.endDate}
                  </span>
                </div>
                <p className="text-gray-700 mt-2 whitespace-pre-wrap">{exp.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-blue-600 mb-4 border-b-2 border-blue-600 pb-2">
            Education
          </h2>
          <div className="space-y-4">
            {data.education.map((edu, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {edu.degree} in {edu.fieldOfStudy}
                    </h3>
                    <p className="text-gray-700">{edu.institution}</p>
                  </div>
                  <span className="text-sm text-gray-600 font-semibold">
                    {edu.startDate} - {edu.endDate}
                  </span>
                </div>
                {edu.description && <p className="text-gray-600 mt-2">{edu.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-blue-600 mb-4 border-b-2 border-blue-600 pb-2">
            Skills
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {data.skills.map((skill, idx) => (
              <div key={idx} className="flex items-center justify-between bg-blue-50 p-3 rounded">
                <span className="font-semibold text-gray-900">{skill.skillName}</span>
                <span className="text-xs font-bold px-2 py-1 bg-blue-600 text-white rounded">
                  {skill.proficiency}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// Template 2: Classic (Free)
export function ClassicTemplate({ data }: { data: CVData }) {
  return (
    <div className="w-full bg-white text-gray-900 font-serif print:p-0 p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center border-b border-gray-400 pb-4 mb-6">
        <h1 className="text-3xl font-bold mb-1">{data.personalInfo?.fullName}</h1>
        <div className="text-xs text-gray-700 space-y-1">
          {data.personalInfo?.email && <p>{data.personalInfo.email}</p>}
          {data.personalInfo?.phone && <p>{data.personalInfo.phone}</p>}
          {data.personalInfo?.location && <p>{data.personalInfo.location}</p>}
        </div>
      </div>

      {/* Professional Summary */}
      {data.personalInfo?.professionalSummary && (
        <section className="mb-5">
          <h2 className="text-sm font-bold uppercase border-b border-gray-400 mb-2">
            Professional Summary
          </h2>
          <p className="text-xs text-gray-700">{data.personalInfo.professionalSummary}</p>
        </section>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <section className="mb-5">
          <h2 className="text-sm font-bold uppercase border-b border-gray-400 mb-3">
            Experience
          </h2>
          <div className="space-y-3">
            {data.experience.map((exp, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-baseline">
                  <p className="text-xs font-bold">{exp.jobTitle}</p>
                  <p className="text-xs text-gray-700">
                    {exp.startDate} - {exp.endDate}
                  </p>
                </div>
                <p className="text-xs text-gray-600 font-semibold">{exp.company}</p>
                <p className="text-xs text-gray-700 mt-1">{exp.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <section className="mb-5">
          <h2 className="text-sm font-bold uppercase border-b border-gray-400 mb-3">
            Education
          </h2>
          <div className="space-y-2">
            {data.education.map((edu, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-baseline">
                  <p className="text-xs font-bold">
                    {edu.degree} in {edu.fieldOfStudy}
                  </p>
                  <p className="text-xs text-gray-700">
                    {edu.startDate} - {edu.endDate}
                  </p>
                </div>
                <p className="text-xs text-gray-600">{edu.institution}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <section>
          <h2 className="text-sm font-bold uppercase border-b border-gray-400 mb-2">
            Skills
          </h2>
          <p className="text-xs text-gray-700">
            {data.skills.map(s => `${s.skillName} (${s.proficiency})`).join(' • ')}
          </p>
        </section>
      )}
    </div>
  );
}

// Template 3: Minimal (Free)
export function MinimalTemplate({ data }: { data: CVData }) {
  return (
    <div className="w-full bg-white text-gray-900 print:p-0 p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{data.personalInfo?.fullName}</h1>
        <div className="text-sm text-gray-600 mt-2 space-x-3">
          {data.personalInfo?.email && <span>{data.personalInfo.email}</span>}
          {data.personalInfo?.phone && <span>•</span>}
          {data.personalInfo?.phone && <span>{data.personalInfo.phone}</span>}
          {data.personalInfo?.location && <span>•</span>}
          {data.personalInfo?.location && <span>{data.personalInfo.location}</span>}
        </div>
      </div>

      {/* Professional Summary */}
      {data.personalInfo?.professionalSummary && (
        <section className="mb-5">
          <p className="text-sm text-gray-700">{data.personalInfo.professionalSummary}</p>
        </section>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <section className="mb-5">
          <h2 className="text-sm font-bold mb-3 uppercase tracking-wide">Experience</h2>
          <div className="space-y-4">
            {data.experience.map((exp, idx) => (
              <div key={idx}>
                <div className="flex justify-between">
                  <h3 className="text-sm font-semibold">{exp.jobTitle}</h3>
                  <span className="text-xs text-gray-600">
                    {exp.startDate} – {exp.endDate}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{exp.company}</p>
                <p className="text-sm text-gray-700 mt-1">{exp.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <section className="mb-5">
          <h2 className="text-sm font-bold mb-3 uppercase tracking-wide">Education</h2>
          <div className="space-y-3">
            {data.education.map((edu, idx) => (
              <div key={idx}>
                <div className="flex justify-between">
                  <h3 className="text-sm font-semibold">
                    {edu.degree} in {edu.fieldOfStudy}
                  </h3>
                  <span className="text-xs text-gray-600">
                    {edu.startDate} – {edu.endDate}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{edu.institution}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <section>
          <h2 className="text-sm font-bold mb-2 uppercase tracking-wide">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, idx) => (
              <span key={idx} className="text-xs px-2 py-1 bg-gray-100 rounded">
                {skill.skillName}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// Main Component - Choose Template
interface MainCVPreviewProps {
  data: CVData;
  onUpgradeClick: () => void;
}

export function CVTemplatePreview({ data, onUpgradeClick }: MainCVPreviewProps) {
  const isPremium = premiumService.hasActivePremium();
  const [selectedTemplate, setSelectedTemplate] = React.useState<'modern' | 'classic' | 'minimal'>(
    'classic'
  );

  return (
    <div className="space-y-4">
      {/* Template Selector */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedTemplate('modern')}
          disabled={!isPremium}
          className={`px-4 py-2 rounded text-sm font-medium transition-all ${
            selectedTemplate === 'modern'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          } ${!isPremium ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isPremium ? '✨ Modern' : 'Modern (Premium)'}
        </button>
        
        <button
          onClick={() => setSelectedTemplate('classic')}
          className={`px-4 py-2 rounded text-sm font-medium transition-all ${
            selectedTemplate === 'classic'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          📄 Classic
        </button>
        
        <button
          onClick={() => setSelectedTemplate('minimal')}
          className={`px-4 py-2 rounded text-sm font-medium transition-all ${
            selectedTemplate === 'minimal'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          ⚡ Minimal
        </button>
      </div>

      {/* Template Preview */}
      <div className="border-2 border-gray-300 rounded-lg overflow-hidden shadow-lg">
        {selectedTemplate === 'modern' && isPremium ? (
          <ModernTemplate data={data} />
        ) : selectedTemplate === 'classic' ? (
          <ClassicTemplate data={data} />
        ) : (
          <MinimalTemplate data={data} />
        )}
      </div>

      {selectedTemplate === 'modern' && !isPremium && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-center">
          <p className="text-sm text-yellow-800 mb-2">Unlock Modern Template dengan Premium!</p>
          <button
            onClick={onUpgradeClick}
            className="px-4 py-2 bg-yellow-600 text-white rounded text-sm font-medium hover:bg-yellow-700"
          >
            Upgrade Sekarang - Rp 19.000
          </button>
        </div>
      )}
    </div>
  );
}

import React from 'react';