import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, Copy, ThumbsUp, Plus } from 'lucide-react';
import { fetchSolutions } from '../services/supabaseService';
import { Solution } from '../types';

const KnowledgeBase: React.FC = () => {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSolutions().then(setSolutions);
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredSolutions = solutions.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.symptoms.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Knowledge Base</h1>
          <p className="text-gray-500 dark:text-gray-400">Common solutions and troubleshooting guides</p>
        </div>
        <button className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-colors">
          <Plus size={18} />
          Add Solution
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Search for solutions by title or symptoms..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white dark:bg-dark-card border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-lg"
        />
      </div>

      <div className="grid gap-4">
        {filteredSolutions.map((solution) => (
          <div key={solution.id} className="bg-white dark:bg-dark-card border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div 
              onClick={() => toggleExpand(solution.id)}
              className="p-6 cursor-pointer flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{solution.title}</h3>
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                    {solution.issue_type}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{solution.symptoms}</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="hidden md:block text-right">
                  <div className="text-sm font-bold text-gray-900 dark:text-white">{solution.success_rate}%</div>
                  <div className="text-xs text-gray-500">Success Rate</div>
                </div>
                <div className={`p-2 rounded-full bg-gray-50 dark:bg-gray-800 transition-transform duration-300 ${expandedId === solution.id ? 'rotate-180' : ''}`}>
                  <ChevronDown size={20} className="text-gray-500" />
                </div>
              </div>
            </div>
            
            {expandedId === solution.id && (
              <div className="px-6 pb-6 pt-0 border-t border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                <div className="mt-4 space-y-3">
                  <h4 className="text-sm font-bold uppercase text-gray-400 tracking-wider">Resolution Steps</h4>
                  <ol className="list-decimal list-inside space-y-2">
                    {solution.steps.map((step, idx) => (
                      <li key={idx} className="text-gray-700 dark:text-gray-300 pl-2">{step}</li>
                    ))}
                  </ol>
                  <div className="mt-6 flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600">
                      <Copy size={16} /> Copy Solution
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20">
                      <ThumbsUp size={16} /> It Worked
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default KnowledgeBase;
