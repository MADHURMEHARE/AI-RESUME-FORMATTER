'use client';
import React, { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  DocumentCheckIcon,
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface EHSComplianceReport {
  compliant: boolean;
  issues: string[];
  score: number;
}

interface FormattingAnalysis {
  typography: {
    font: string;
    compliant: boolean;
    recommendation: string;
  };
  dates: {
    format: string;
    compliant: boolean;
    examples: string[];
  };
  capitalization: {
    jobTitles: boolean;
    companyNames: boolean;
    compliant: boolean;
  };
  content: {
    redundantPhrases: string;
    commonMistakes: string;
    professionalTone: string;
    compliant: boolean;
  };
  fileNaming: {
    format: string;
    compliant: boolean;
    recommendation: string;
  };
}

interface EHSValidationResponse {
  success: boolean;
  message: string;
  compliance: EHSComplianceReport;
  formattingAnalysis: FormattingAnalysis;
  recommendations: string[];
  score: number;
  grade: string;
}

interface EHSComplianceCheckerProps {
  uploadId: string;
  onComplianceUpdate?: (compliant: boolean, score: number) => void;
}

export default function EHSComplianceChecker({ uploadId, onComplianceUpdate }: EHSComplianceCheckerProps) {
  const [validationResult, setValidationResult] = useState<EHSValidationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (uploadId) {
      validateEHSCompliance();
    }
  }, [uploadId]);

  const validateEHSCompliance = async () => {
    if (!uploadId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/v1/ehs-validate/${uploadId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: EHSValidationResponse = await response.json();
      setValidationResult(result);
      
      // Notify parent component
      if (onComplianceUpdate) {
        onComplianceUpdate(result.compliance.compliant, result.score);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate EHS compliance');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 80) return 'bg-blue-100';
    if (score >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'C': return 'text-yellow-600 bg-yellow-100';
      case 'D': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center space-x-2">
          <ArrowPathIcon className="h-5 w-5 animate-spin text-blue-600" />
          <span className="text-gray-600">Validating EHS Compliance...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-2 text-red-600">
          <ExclamationTriangleIcon className="h-5 w-5" />
          <span>Error: {error}</span>
        </div>
        <button
          onClick={validateEHSCompliance}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Retry Validation
        </button>
      </div>
    );
  }

  if (!validationResult) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <DocumentCheckIcon className="h-8 w-8 text-blue-600" />
          <div>
            <h3 className="text-xl font-semibold text-gray-900">EHS Compliance Checker</h3>
            <p className="text-sm text-gray-600">Professional CV Formatting Standards</p>
          </div>
        </div>
        
        {/* Score and Grade */}
        <div className="text-right">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(validationResult.score)} ${getScoreColor(validationResult.score)}`}>
            Score: {validationResult.score}/100
          </div>
          <div className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(validationResult.grade)}`}>
            Grade: {validationResult.grade}
          </div>
        </div>
      </div>

      {/* Overall Status */}
      <div className={`mb-6 p-4 rounded-lg ${validationResult.compliance.compliant ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
        <div className="flex items-center space-x-2">
          {validationResult.compliance.compliant ? (
            <CheckCircleIcon className="h-6 w-6 text-green-600" />
          ) : (
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
          )}
          <span className={`font-medium ${validationResult.compliance.compliant ? 'text-green-800' : 'text-yellow-800'}`}>
            {validationResult.compliance.compliant ? 'EHS Compliant' : 'EHS Compliance Issues Found'}
          </span>
        </div>
        <p className={`mt-2 text-sm ${validationResult.compliance.compliant ? 'text-green-700' : 'text-yellow-700'}`}>
          {validationResult.compliance.compliant 
            ? 'Your CV meets all EHS professional formatting standards.'
            : `Found ${validationResult.compliance.issues.length} issue(s) that need attention.`
          }
        </p>
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Typography */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Typography Standards</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Font</span>
              <span className={`text-sm font-medium ${validationResult.formattingAnalysis.typography.compliant ? 'text-green-600' : 'text-red-600'}`}>
                {validationResult.formattingAnalysis.typography.font}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Compliant</span>
              {validationResult.formattingAnalysis.typography.compliant ? (
                <CheckCircleIcon className="h-4 w-4 text-green-600" />
              ) : (
                <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
              )}
            </div>
          </div>
        </div>

        {/* Date Formatting */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Date Formatting</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Format</span>
              <span className="text-sm font-medium text-green-600">Jan 2020</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Examples</span>
              <span className="text-sm text-gray-900">
                {validationResult.formattingAnalysis.dates.examples.slice(0, 2).join(', ')}
              </span>
            </div>
          </div>
        </div>

        {/* Capitalization */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Capitalization</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Job Titles</span>
              {validationResult.formattingAnalysis.capitalization.jobTitles ? (
                <CheckCircleIcon className="h-4 w-4 text-green-600" />
              ) : (
                <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Company Names</span>
              {validationResult.formattingAnalysis.capitalization.companyNames ? (
                <CheckCircleIcon className="h-4 w-4 text-green-600" />
              ) : (
                <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
              )}
            </div>
          </div>
        </div>

        {/* File Naming */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">File Naming</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Format</span>
              <span className={`text-sm font-medium ${validationResult.formattingAnalysis.fileNaming.compliant ? 'text-green-600' : 'text-red-600'}`}>
                {validationResult.formattingAnalysis.fileNaming.format}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Compliant</span>
              {validationResult.formattingAnalysis.fileNaming.compliant ? (
                <CheckCircleIcon className="h-4 w-4 text-green-600" />
              ) : (
                <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {validationResult.recommendations.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-3">Recommendations</h4>
          <ul className="space-y-2">
            {validationResult.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-blue-600 mt-1">•</span>
                <span className="text-sm text-blue-800">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Refresh Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={validateEHSCompliance}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          <ArrowPathIcon className="h-4 w-4" />
          <span>Refresh Validation</span>
        </button>
      </div>
    </div>
  );
}
