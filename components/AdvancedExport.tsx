'use client';

import React, { useState, useEffect } from 'react';
import { 
  DocumentArrowDownIcon, 
  DocumentTextIcon,
  DocumentIcon,
  CodeBracketIcon,
  EyeIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

interface Template {
  id: string;
  name: string;
  description: string;
  styling: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };
}

interface ExportOptions {
  formats: string[];
  template: string;
  options: {
    includePhoto: boolean;
    highQuality: boolean;
    watermark: boolean;
  };
}

interface AdvancedExportProps {
  uploadId: string;
  cvData: any;
  onExportComplete: (results: any) => void;
}

const EXPORT_FORMATS = [
  { id: 'pdf', name: 'PDF', icon: DocumentIcon, description: 'Professional PDF format, perfect for printing and sharing' },
  { id: 'docx', name: 'DOCX', icon: DocumentTextIcon, description: 'Microsoft Word format, easily editable' },
  { id: 'html', name: 'HTML', icon: CodeBracketIcon, description: 'Web-friendly format, great for online portfolios' },
  { id: 'latex', name: 'LaTeX', icon: DocumentTextIcon, description: 'Academic format, perfect for research positions' }
];

export default function AdvancedExport({
  uploadId,
  cvData,
  onExportComplete
}: AdvancedExportProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('technology');
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['pdf']);
  const [exportOptions, setExportOptions] = useState({
    includePhoto: true,
    highQuality: true,
    watermark: false
  });
  const [exporting, setExporting] = useState(false);
  const [exportResults, setExportResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/templates');
      if (!response.ok) throw new Error('Failed to fetch templates');
      
      const data = await response.json();
      setTemplates(data.templates);
    } catch (err) {
      console.error('Error fetching templates:', err);
    }
  };

  const handleFormatToggle = (formatId: string) => {
    setSelectedFormats(prev => 
      prev.includes(formatId)
        ? prev.filter(f => f !== formatId)
        : [...prev, formatId]
    );
  };

  const handleExport = async () => {
    if (selectedFormats.length === 0) {
      setError('Please select at least one export format');
      return;
    }

    try {
      setExporting(true);
      setError(null);

      const response = await fetch(`http://localhost:5000/api/v1/export/${uploadId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formats: selectedFormats,
          template: selectedTemplate,
          options: exportOptions
        }),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const data = await response.json();
      setExportResults(data);
      onExportComplete(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const downloadFile = async (format: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/v1/download/${uploadId}/${format}?template=${selectedTemplate}`,
        {
          method: 'GET',
        }
      );

      if (!response.ok) throw new Error(`Failed to download ${format} file`);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cvData.personalDetails.firstName}_${cvData.personalDetails.lastName}_CV.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(`Failed to download ${format} file: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const getTemplatePreview = () => {
    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) return null;

    return (
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
        <h4 className="font-medium text-gray-900 mb-2">{template.name}</h4>
        <p className="text-sm text-gray-600 mb-3">{template.description}</p>
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center">
            <div 
              className="w-4 h-4 rounded mr-2" 
              style={{ backgroundColor: template.styling.primaryColor }}
            ></div>
            <span className="text-gray-600">Primary</span>
          </div>
          <div className="flex items-center">
            <div 
              className="w-4 h-4 rounded mr-2" 
              style={{ backgroundColor: template.styling.secondaryColor }}
            ></div>
            <span className="text-gray-600">Secondary</span>
          </div>
          <span className="text-gray-600">Font: {template.styling.fontFamily}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Export Your CV
        </h2>
        <p className="text-gray-600">
          Choose formats and templates to create professional CV documents
        </p>
      </div>

      {/* Template Selection */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Select Template
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                selectedTemplate === template.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{template.name}</h4>
                  <p className="text-sm text-gray-600">{template.description}</p>
                </div>
                {selectedTemplate === template.id && (
                  <CheckIcon className="h-5 w-5 text-blue-600" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Template Preview */}
        {getTemplatePreview()}
      </div>

      {/* Format Selection */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Select Export Formats
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {EXPORT_FORMATS.map((format) => {
            const Icon = format.icon;
            const isSelected = selectedFormats.includes(format.id);
            
            return (
              <div
                key={format.id}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleFormatToggle(format.id)}
              >
                <div className="text-center">
                  <Icon className={`h-8 w-8 mx-auto mb-2 ${
                    isSelected ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <h4 className={`font-medium ${
                    isSelected ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {format.name}
                  </h4>
                  <p className="text-xs text-gray-600 mt-1">
                    {format.description}
                  </p>
                  {isSelected && (
                    <CheckIcon className="h-5 w-5 text-blue-600 mx-auto mt-2" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Export Options
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Include Photo</h4>
              <p className="text-sm text-gray-600">Add profile photo to exported documents</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={exportOptions.includePhoto}
                onChange={(e) => setExportOptions(prev => ({ ...prev, includePhoto: e.target.checked }))}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">High Quality</h4>
              <p className="text-sm text-gray-600">Generate high-resolution documents</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={exportOptions.highQuality}
                onChange={(e) => setExportOptions(prev => ({ ...prev, highQuality: e.target.checked }))}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Watermark</h4>
              <p className="text-sm text-gray-600">Add AI CV Transformer watermark</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={exportOptions.watermark}
                onChange={(e) => setExportOptions(prev => ({ ...prev, watermark: e.target.checked }))}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Export Button */}
      <div className="text-center">
        <button
          onClick={handleExport}
          disabled={exporting || selectedFormats.length === 0}
          className={`px-8 py-3 rounded-lg font-medium text-white transition-colors ${
            exporting || selectedFormats.length === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {exporting ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Exporting...
            </div>
          ) : (
            <div className="flex items-center">
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              Export CV ({selectedFormats.length} format{selectedFormats.length !== 1 ? 's' : ''})
            </div>
          )}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Export Results */}
      {exportResults && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-4">
            Export Complete! 🎉
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {exportResults.formats.map((format: string) => (
              <div key={format} className="bg-white p-4 rounded-lg border border-green-200">
                <div className="text-center">
                  {format === 'pdf' && <DocumentIcon className="h-8 w-8 text-red-600 mx-auto mb-2" />}
                  {format === 'docx' && <DocumentTextIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />}
                  {format === 'html' && <CodeBracketIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />}
                  {format === 'latex' && <DocumentTextIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />}
                  
                  <h4 className="font-medium text-gray-900 mb-2">{format.toUpperCase()}</h4>
                  
                  <button
                    onClick={() => downloadFile(format)}
                    className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                  >
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <p className="text-green-800 mb-2">
              Your CV has been successfully exported in {exportResults.formats.length} format{exportResults.formats.length !== 1 ? 's' : ''}!
            </p>
            <p className="text-sm text-green-700">
              Template: {templates.find(t => t.id === selectedTemplate)?.name}
            </p>
          </div>
        </div>
      )}

      {/* Export Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Export Summary</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• Selected Template: {templates.find(t => t.id === selectedTemplate)?.name}</p>
          <p>• Export Formats: {selectedFormats.map(f => f.toUpperCase()).join(', ')}</p>
          <p>• Options: {exportOptions.includePhoto ? 'Photo' : 'No Photo'}, {exportOptions.highQuality ? 'High Quality' : 'Standard'}, {exportOptions.watermark ? 'Watermark' : 'No Watermark'}</p>
        </div>
      </div>
    </div>
  );
}
