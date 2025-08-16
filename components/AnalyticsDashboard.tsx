'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  LightBulbIcon,
  StarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface AnalyticsReport {
  summary: {
    overallScore: number;
    atsScore: number;
    qualityScore: number;
    industryAlignment: number;
  };
  atsAnalysis: {
    score: number;
    maxScore: number;
    feedback: string[];
    matchedKeywords: number;
    totalKeywords: number;
    keywordMatchPercentage: number;
  };
  qualityAnalysis: {
    overallScore: number;
    sections: Record<string, { score: number; feedback: string[] }>;
    recommendations: string[];
    strengths: string[];
    weaknesses: string[];
  };
  salaryInsights: {
    role: string;
    experienceLevel: string;
    salaryRange: string;
    averageSalary: string;
    currency: string;
    marketPosition: string;
  };
  recommendations: string[];
  strengths: string[];
  weaknesses: string[];
  generatedAt: string;
}

interface AnalyticsDashboardProps {
  uploadId: string;
  targetRole?: string;
  industry?: string;
}

export default function AnalyticsDashboard({
  uploadId,
  targetRole = 'Software Engineer',
  industry = 'Technology'
}: AnalyticsDashboardProps) {
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (uploadId) {
      generateReport();
    }
  }, [uploadId, targetRole, industry]);

  const generateReport = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:5000/api/v1/analyze/${uploadId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetRole,
          industry
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate analytics report');
      }

      const data = await response.json();
      setReport(data.report);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
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
        <p className="text-red-800">Error: {error}</p>
        <button
          onClick={generateReport}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          CV Analytics Dashboard
        </h2>
        <p className="text-gray-600">
          Comprehensive analysis of your CV performance and improvement opportunities
        </p>
      </div>

      {/* Overall Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-blue-100 rounded-full">
            <StarIcon className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {report.summary.overallScore}
          </h3>
          <p className="text-sm text-gray-600">Overall Score</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-green-100 rounded-full">
            <DocumentTextIcon className="h-6 w-6 text-green-600" />
          </div>
          <h3 className={`text-lg font-semibold ${getScoreColor(report.summary.atsScore)}`}>
            {report.summary.atsScore}
          </h3>
          <p className="text-sm text-gray-600">ATS Score</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-purple-100 rounded-full">
            <ChartBarIcon className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className={`text-lg font-semibold ${getScoreColor(report.summary.qualityScore)}`}>
            {report.summary.qualityScore}
          </h3>
          <p className="text-sm text-gray-600">Quality Score</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-orange-100 rounded-full">
            <CheckCircleIcon className="h-6 w-6 text-orange-600" />
          </div>
          <h3 className={`text-lg font-semibold ${getScoreColor(report.summary.industryAlignment)}`}>
            {report.summary.industryAlignment}%
          </h3>
          <p className="text-sm text-gray-600">Industry Fit</p>
        </div>
      </div>

      {/* ATS Analysis */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-600" />
          ATS Compatibility Analysis
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Keyword Match</span>
                <span className="text-sm font-medium text-gray-900">
                  {report.atsAnalysis.matchedKeywords}/{report.atsAnalysis.totalKeywords}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getScoreBgColor(report.atsAnalysis.keywordMatchPercentage)}`}
                  style={{ width: `${report.atsAnalysis.keywordMatchPercentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {report.atsAnalysis.keywordMatchPercentage}% match rate
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Feedback:</h4>
              {report.atsAnalysis.feedback.map((feedback, index) => (
                <div key={index} className="flex items-start">
                  {feedback.startsWith('Good:') ? (
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  ) : (
                    <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                  )}
                  <span className="text-sm text-gray-700">{feedback}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Target Role: {targetRole}</h4>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Required Keywords:</strong> {report.atsAnalysis.totalKeywords} total
              </p>
              <p className="text-sm text-gray-700">
                <strong>Matched Keywords:</strong> {report.atsAnalysis.matchedKeywords}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Missing Keywords:</strong> {report.atsAnalysis.totalKeywords - report.atsAnalysis.matchedKeywords}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section Analysis */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ChartBarIcon className="h-5 w-5 mr-2 text-purple-600" />
          Section-by-Section Analysis
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(report.qualityAnalysis.sections).map(([section, analysis]) => (
            <div key={section} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2 capitalize">
                {section.replace('-', ' ')}
              </h4>
              
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Score</span>
                  <span className={`text-sm font-medium ${getScoreColor(analysis.score)}`}>
                    {analysis.score}/100
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getScoreBgColor(analysis.score)}`}
                    style={{ width: `${analysis.score}%` }}
                  ></div>
                </div>
              </div>

              {analysis.feedback.length > 0 && (
                <div>
                  <h5 className="text-xs font-medium text-gray-700 mb-1">Feedback:</h5>
                  <ul className="space-y-1">
                    {analysis.feedback.slice(0, 2).map((feedback, index) => (
                      <li key={index} className="text-xs text-gray-600 flex items-start">
                        <ExclamationTriangleIcon className="h-3 w-3 text-yellow-500 mr-1 mt-0.5 flex-shrink-0" />
                        {feedback}
                      </li>
                    ))}
                    {analysis.feedback.length > 2 && (
                      <li className="text-xs text-gray-500">
                        +{analysis.feedback.length - 2} more items
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Salary Insights */}
      {report.salaryInsights && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <StarIcon className="h-5 w-5 mr-2 text-orange-600" />
            Salary & Market Insights
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-gray-900">Role</h4>
              <p className="text-lg font-semibold text-blue-600">{report.salaryInsights.role}</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-gray-900">Salary Range</h4>
              <p className="text-lg font-semibold text-green-600">{report.salaryInsights.salaryRange}</p>
              <p className="text-sm text-gray-600">{report.salaryInsights.currency}</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-gray-900">Market Position</h4>
              <p className="text-lg font-semibold text-purple-600">{report.salaryInsights.marketPosition}</p>
              <p className="text-sm text-gray-600">{report.salaryInsights.experienceLevel}</p>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <LightBulbIcon className="h-5 w-5 mr-2 text-yellow-600" />
          Improvement Recommendations
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
              Strengths
            </h4>
            <ul className="space-y-2">
              {report.strengths.map((strength, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{strength}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 mr-2" />
              Areas for Improvement
            </h4>
            <ul className="space-y-2">
              {report.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start">
                  <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="font-medium text-gray-900 mb-3">Action Items:</h4>
          <ul className="space-y-2">
            {report.recommendations.slice(0, 5).map((recommendation, index) => (
              <li key={index} className="flex items-start">
                <LightBulbIcon className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500">
        <p>Report generated on {new Date(report.generatedAt).toLocaleString()}</p>
        <p>Target: {targetRole} in {industry} industry</p>
      </div>
    </div>
  );
}
