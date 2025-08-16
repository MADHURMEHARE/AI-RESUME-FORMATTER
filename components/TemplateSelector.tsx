'use client';

import React, { useState, useEffect } from 'react';
import { CheckIcon, EyeIcon } from '@heroicons/react/24/outline';

interface Template {
  id: string;
  name: string;
  description: string;
  sections: string[];
  styling: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    headerStyle: string;
    skillStyle: string;
    projectStyle: string;
  };
  rules: {
    emphasizeSkills: boolean;
    showProjects: boolean;
    includeGitHub: boolean;
    highlightTechnologies: boolean;
  };
}

interface TemplateSelectorProps {
  selectedTemplate: string;
  onTemplateChange: (templateId: string) => void;
  onPreviewTemplate: (template: Template) => void;
}

export default function TemplateSelector({
  selectedTemplate,
  onTemplateChange,
  onPreviewTemplate
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/v1/templates');
      if (!response.ok) throw new Error('Failed to fetch templates');
      
      const data = await response.json();
      setTemplates(data.templates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading templates: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Choose Your CV Template
        </h3>
        <p className="text-sm text-gray-600">
          Select a template that best fits your industry and career goals
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedTemplate === template.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onTemplateChange(template.id)}
          >
            {/* Selected indicator */}
            {selectedTemplate === template.id && (
              <div className="absolute top-2 right-2">
                <CheckIcon className="h-5 w-5 text-blue-600" />
              </div>
            )}

            {/* Template header */}
            <div className="mb-3">
              <h4 className="font-semibold text-gray-900 mb-1">
                {template.name}
              </h4>
              <p className="text-sm text-gray-600">
                {template.description}
              </p>
            </div>

            {/* Template sections */}
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-700 mb-1">
                Includes:
              </p>
              <div className="flex flex-wrap gap-1">
                {template.sections.slice(0, 4).map((section) => (
                  <span
                    key={section}
                    className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                  >
                    {section.replace('-', ' ')}
                  </span>
                ))}
                {template.sections.length > 4 && (
                  <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                    +{template.sections.length - 4} more
                  </span>
                )}
              </div>
            </div>

            {/* Template features */}
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-700 mb-1">
                Features:
              </p>
              <div className="space-y-1">
                {template.rules.emphasizeSkills && (
                  <div className="flex items-center text-xs text-gray-600">
                    <CheckIcon className="h-3 w-3 text-green-500 mr-1" />
                    Skills emphasis
                  </div>
                )}
                {template.rules.showProjects && (
                  <div className="flex items-center text-xs text-gray-600">
                    <CheckIcon className="h-3 w-3 text-green-500 mr-1" />
                    Project showcase
                  </div>
                )}
                {template.rules.highlightTechnologies && (
                  <div className="flex items-center text-xs text-gray-600">
                    <CheckIcon className="h-3 w-3 text-green-500 mr-1" />
                    Tech highlighting
                  </div>
                )}
              </div>
            </div>

            {/* Preview button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPreviewTemplate(template);
              }}
              className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
            >
              <EyeIcon className="h-4 w-4 mr-1" />
              Preview
            </button>
          </div>
        ))}
      </div>

      {/* Template comparison */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">Template Comparison</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3">Template</th>
                <th className="text-left py-2 px-3">Best For</th>
                <th className="text-left py-2 px-3">Style</th>
                <th className="text-left py-2 px-3">Focus</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template) => (
                <tr key={template.id} className="border-b border-gray-100">
                  <td className="py-2 px-3 font-medium">{template.name}</td>
                  <td className="py-2 px-3">
                    {template.id === 'technology' && 'Tech professionals, developers'}
                    {template.id === 'finance' && 'Finance, business, consulting'}
                    {template.id === 'healthcare' && 'Medical, healthcare, nursing'}
                    {template.id === 'creative' && 'Design, marketing, creative roles'}
                    {template.id === 'education' && 'Teaching, research, academia'}
                  </td>
                  <td className="py-2 px-3">
                    {template.styling.headerStyle === 'gradient' && 'Modern'}
                    {template.styling.headerStyle === 'classic' && 'Traditional'}
                    {template.styling.headerStyle === 'medical' && 'Clean'}
                    {template.styling.headerStyle === 'creative' && 'Visual'}
                    {template.styling.headerStyle === 'academic' && 'Scholarly'}
                  </td>
                  <td className="py-2 px-3">
                    {template.rules.emphasizeSkills && 'Skills'}
                    {template.rules.showProjects && 'Projects'}
                    {template.rules.highlightTechnologies && 'Technologies'}
                    {!template.rules.emphasizeSkills && !template.rules.showProjects && 'Experience'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
