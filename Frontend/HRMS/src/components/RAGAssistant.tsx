import React, { useState } from 'react';
import { useAuth } from '../state/useAuth';

interface RAGResponse {
  question: string;
  answer: string;
  confidence: number;
  category: string;
  suggestions: string[];
}

const RAGAssistant: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<RAGResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { token } = useAuth();

  const askQuestion = async () => {
    if (!question.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/v1/employee/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ question })
      });
      
      const data = await res.json();
      if (data.status === 'success') {
        setResponse(data.data);
      }
    } catch (error) {
      console.error('Error asking question:', error);
    }
    setLoading(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuestion(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">
        🤖 HR Assistant
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ask a question about HRMS:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., How do I request leave?"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && askQuestion()}
            />
            <button
              onClick={askQuestion}
              disabled={loading || !question.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Asking...' : 'Ask'}
            </button>
          </div>
        </div>

        {response && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-600">
                Confidence: {Math.round(response.confidence * 100)}%
              </span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {response.category}
              </span>
            </div>
            <p className="text-gray-800 mb-3">{response.answer}</p>
            
            {response.suggestions.length > 0 && (
              <div>
                <button
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {showSuggestions ? 'Hide' : 'Show'} related questions
                </button>
                {showSuggestions && (
                  <div className="mt-2 space-y-1">
                    {response.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="block text-sm text-blue-600 hover:text-blue-800 text-left"
                      >
                        • {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RAGAssistant;
