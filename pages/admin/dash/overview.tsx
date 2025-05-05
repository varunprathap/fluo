import React, { useState, useEffect, useRef } from "react";
import AdminLayout from '../layout';
import { Activity, Users, FileText, Clock, Search, Plus, HelpCircle, List, FolderKanban, File, Info } from 'lucide-react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';

// Icon mapping for dynamic rendering
const ICON_MAP: Record<string, string> = {
  'Google Sheets': '/icons/google_sheet.svg',
  'Google Slides': '/icons/google-drive.svg',
  'Confluence': '/icons/microsoft-365.svg',
  'Recent Search': '/icons/google_sheet.svg', // You can use a clock icon if you have one
};

const RECENT_QUERIES = [
  'Fulltime employees'
];

// At the top level of the file, add this interface with other imports
interface SourceItem {
  file_name?: string;
  name?: string;
  similarity_score?: number;
  metadata?: {
    mime_type: string;
  };
  relevance?: number;
  supporting_text?: string;
  contribution?: string;
  additional_context?: string;
}

// Add this helper function before the Overview component
const cleanSourceText = (text: string): string => {
  if (!text) return '';
  
  return text
    // Remove markdown bold/italic markers
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/\_\_/g, '')
    .replace(/\_/g, '')
    // Remove markdown blockquote markers
    .replace(/^\s*>\s*/gm, '')
    // Remove extra spaces
    .replace(/\s+/g, ' ')
    // Replace multiple line breaks with a single space
    .replace(/(\n|\r)+/g, ' ')
    // Remove other markdown formatting
    .replace(/`/g, '')
    .replace(/\[|\]/g, '')
    // Trim whitespace
    .trim();
};

const Overview = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showFullAIAnswer, setShowFullAIAnswer] = useState(false);
  const [activeTab, setActiveTab] = useState<'files' | 'ask'>('files');
  const [askResponse, setAskResponse] = useState<{
    answer: string;
    details?: any;
    answer_status?: string;
    sources: Array<{
      file_name: string;
      similarity_score: number;
      metadata: { mime_type: string };
      relevance: number;
    }>;
    confidence: number;
  } | null>(null);
  const [synapseResponse, setSynapseResponse] = useState<{ synapse: string; sources: string[] } | null>(null);
  const [showFullSynapse, setShowFullSynapse] = useState(false);
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const [askSuggestions, setAskSuggestions] = useState<{question: string}[]>([
    { question: 'What are the highlights of the spring campaign?' },
    { question: 'Show me the latest Q1 report.' },
    { question: 'Who edited the hero product brief?' },
  ]);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const [inputValue, setInputValue] = useState("");

  const connectedApps = [
    {
      name: 'Google Drive',
      icon: '/google-drive-icon.svg',
      isConnected: true
    }
  ];

  useEffect(() => {
    if (searchQuery.length < 1) {
      setSearchResults([]);
      setAskResponse(null);
      setSynapseResponse(null);
      setFollowUpQuestions([]);
      return;
    }

    setIsLoading(true);
    setShowDropdown(true);

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(async () => {
      try {
        if (activeTab === 'ask') {
          const res = await fetch(`/api/ask?query=${encodeURIComponent(searchQuery)}`);
          const data = await res.json();
          setAskResponse(data);
          
          // Extract follow-up questions from the answer
          try {
            // Check if data has a structured format with follow_up_questions
            let parsedData = data;
            // Extract follow-up questions from structured data
            if (parsedData.follow_up_questions) {
              let questions: string[] = [];
              if (typeof parsedData.follow_up_questions === 'string') {
                try {
                  // Try to parse as JSON array
                  questions = JSON.parse(parsedData.follow_up_questions);
                } catch {
                  // Fallback: split by comma and clean up
                  questions = parsedData.follow_up_questions.split(',').map((q: string) => q.trim().replace(/^"|"$/g, ''));
                }
              } else if (Array.isArray(parsedData.follow_up_questions)) {
                questions = parsedData.follow_up_questions.map((q: string) => typeof q === 'string' ? q.trim() : q);
              }
              questions = questions.map(q => q.replace(/^"|"$/g, '').replace(/^\[|\]$/g, '').trim());
              if (questions.length > 0) {
                setFollowUpQuestions(questions);
                setAskSuggestions(questions.map((q: string) => ({ question: q })));
              } else {
                setFollowUpQuestions([]);
              }
            } else {
              setFollowUpQuestions([]);
            }
          } catch (e) {
            console.error('Error processing ask response:', e);
            setFollowUpQuestions([]);
          }
          
          setSearchResults([]);
          setSynapseResponse(null);
        } else {
          // Find mode: call both search and synapse in parallel
          setAskResponse(null);
          const searchPromise = fetch(`/api/search/search?query=${encodeURIComponent(searchQuery)}`).then(res => res.json());
          const synapsePromise = fetch(`/api/ask_synapse?query=${encodeURIComponent(searchQuery)}`).then(res => res.json()).catch(() => null);
          const [searchData, synapseData] = await Promise.all([searchPromise, synapsePromise]);
          setSearchResults(Array.isArray(searchData) ? searchData : []);
          setSynapseResponse(synapseData);
          
          // Extract follow-up questions from new structured synapse response
          if (synapseData) {
            try {
              // Check if synapseData has a synapse property with JSON content
              let parsedData = synapseData;
  
              // Extract follow-up questions from structured data
              if (parsedData.follow_up_questions) {
                let questions: string[] = [];
                if (typeof parsedData.follow_up_questions === 'string') {
                  try {
                    // Try to parse as JSON array
                    questions = JSON.parse(parsedData.follow_up_questions);
                  } catch {
                    // Fallback: split by comma and clean up
                    questions = parsedData.follow_up_questions.split(',').map((q: string) => q.trim().replace(/^"|"$/g, ''));
                  }
                } else if (Array.isArray(parsedData.follow_up_questions)) {
                  questions = parsedData.follow_up_questions.map((q: string) => typeof q === 'string' ? q.trim() : q);
                }
                questions = questions.map(q => q.replace(/^"|"$/g, '').replace(/^\[|\]$/g, '').trim());
                if (questions.length > 0) {
                  setFollowUpQuestions(questions);
                  setAskSuggestions(questions.map((q: string) => ({ question: q })));
                } else {
                  setFollowUpQuestions([]);
                }
              }  else {
                setFollowUpQuestions([]);
              }
            } catch (e) {
              console.error('Error processing synapse response:', e);
              setFollowUpQuestions([]);
            }
          } else {
            setFollowUpQuestions([]);
          }
        }
      } catch (e) {
        console.error('API error:', e);
        if (activeTab === 'ask') {
          setAskResponse(null);
        } else {
          setSearchResults([]);
          setSynapseResponse(null);
        }
        setFollowUpQuestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [searchQuery, activeTab]);

  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    if (inputValue !== searchQuery) {
      debounceTimeout.current = setTimeout(() => {
        setSearchQuery(inputValue);
      }, 3000);
    }
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [inputValue]);

  // Helper to get icon and background color for a result
  const getIconAndBg = (item: any) => {
    const mime = item.metadata?.mime_type;
    if (mime === 'application/vnd.google-apps.spreadsheet') {
      return { icon: '/icons/google_sheet.svg', bg: 'bg-green-100' };
    }
    if (mime === 'application/pdf') {
      return { icon: '/icons/pdf.svg', bg: 'bg-red-100' };
    }
    if (mime === 'application/vnd.google-apps.document') {
      return { icon: '/icons/google-docs.svg', bg: 'bg-blue-100' };
    }
    if (mime === 'application/vnd.google.colab') {
      return { icon: '/icons/colab.svg', bg: 'bg-yellow-100' };
    }
    // Add more types as needed
    return { icon: null, bg: 'bg-gray-100' };
  };

  // Helper to get a user-friendly type label
  const getTypeLabel = (item: any) => {
    const mime = item.metadata?.mime_type;
    if (mime === 'application/vnd.google-apps.spreadsheet') return 'Google Sheet';
    if (mime === 'application/pdf') return 'PDF';
    if (mime === 'application/vnd.google-apps.document') return 'Google Doc';
    return '';
  };

  // Helper for edited/opened text (placeholder for now)
  const getEditedText = (item: any) => {
    // You can add logic here based on item metadata
    return 'You edited in the past week';
  };

  // Only show popover if user is typing (1+ chars)
  const shouldShowPopover = showDropdown && searchQuery.length >= 1;

  // Filter recent queries by search text
  const filteredRecent = RECENT_QUERIES.filter(q => q.toLowerCase().includes(searchQuery.toLowerCase()) && searchQuery.length > 0);

  // Function to handle markdown link clicks
  const handleMarkdownLinkClick = (sourceName: string) => {
    const source = askResponse?.sources.find(s => s.file_name === sourceName);
    if (source) {
      // Scroll to the source in the right panel
      const sourceElement = document.getElementById(`source-${sourceName}`);
      if (sourceElement) {
        sourceElement.scrollIntoView({ behavior: 'smooth' });
        sourceElement.classList.add('bg-blue-50');
        setTimeout(() => {
          sourceElement.classList.remove('bg-blue-50');
        }, 2000);
      }
    }
  };

  // Custom renderer for markdown links and citations
  const customRenderers: Components = {
    link: ({ node, children, ...props }) => {
      const sourceName = children?.toString().replace(/[\[\]]/g, '');
      return (
        <button
          onClick={() => handleMarkdownLinkClick(sourceName || '')}
          className="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1"
        >
          {children}
          <Info className="w-3 h-3" />
        </button>
      );
    },
    blockquote: ({ children }) => (
      <div className="border-l-4 border-gray-200 pl-4 my-2 text-sm text-gray-600 italic">
        {children}
      </div>
    ),
    h3: ({ children }) => (
      <div className="flex items-center gap-2 mt-4 mb-2">
        <h3 className="text-lg font-semibold text-gray-900">{children}</h3>
      </div>
    ),
    ul: ({ children }) => (
      <ul className="list-disc pl-5 space-y-1 my-2">
        {children}
      </ul>
    ),
    li: ({ children }) => (
      <li className="text-gray-700">
        {children}
      </li>
    ),
  };

  // Function to clean markdown content
  const cleanMarkdownContent = (content: string) => {
    // Remove markdown code block markers
    let cleanedContent = content.replace(/```markdown\n/g, '').replace(/```/g, '');
    
    // Try to parse structured JSON content
    try {
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonData = JSON.parse(jsonMatch[0]);
        
        // If this is our structured format, return a formatted summary and details
        if (jsonData.summary) {
          let formattedContent = `${jsonData.summary}\n\n`;
          
          // Add detailed sections if available
          if (jsonData.details) {
            Object.entries(jsonData.details).forEach(([title, text]) => {
              formattedContent += `**${title}**: ${text}\n\n`;
            });
          }
          
          return formattedContent.trim();
        }
      }
    } catch (e) {
      console.error('Error parsing structured content:', e);
      // Continue with normal markdown cleanup if JSON parsing fails
    }
    
    // Remove the citations/document sections entirely
    const sections = cleanedContent.split('## Citations');
    cleanedContent = sections[0]?.trim();
    
    // Also remove Follow-up Questions section from display
    if (cleanedContent) {
      const followUpSplit = cleanedContent.split('## Follow-up Questions');
      cleanedContent = followUpSplit[0]?.trim();
    }
    
    return cleanedContent;
  };

  // Helper function to get structured data from synapse response
  const getStructuredData = (synapseResponse: any) => {
    if (!synapseResponse || !synapseResponse.synapse) return null;
    
    try {
      if (typeof synapseResponse.synapse === 'string') {
        const match = synapseResponse.synapse.match(/\{[\s\S]*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          return parsed;
        }
      }
      return null;
    } catch (e) {
      console.error('Failed to parse structured data:', e);
      return null;
    }
  };

  // Helper function to extract structured source information
  const getStructuredSources = (answer: string) => {
    try {
      const jsonMatch = answer.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonData = JSON.parse(jsonMatch[0]);
        if (jsonData.sources && Array.isArray(jsonData.sources)) {
          return jsonData.sources;
        }
      }
      return null;
    } catch (e) {
      console.error('Error extracting structured sources:', e);
      return null;
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col min-h-screen bg-white rounded-lg shadow p-[7px]">
        {/* Search and Apps Bar */}
        <div className="w-full max-w-full md:w-4/5 md:max-w-5xl flex flex-col bg-white rounded-2xl shadow border border-gray-200 px-2 py-3 md:px-8 md:py-6 mx-auto">
          <div className="relative w-full">
            <input
              type="text"
              className={`bg-transparent text-lg focus:outline-none placeholder-gray-400 mb-0 w-full pr-20 pl-4 rounded-t-2xl ${shouldShowPopover ? '' : 'rounded-b-2xl'} break-words`}
              placeholder="Search or ask your work content…"
              value={inputValue}
              onChange={e => {
                setInputValue(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => {
                setShowDropdown(false);
                setSearchQuery(inputValue);
                if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
              }}
            />
            {/* Grey icons inside the search bar, right side */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center space-x-3 pr-2 opacity-40">
              <img src="/icons/google_sheet.svg" alt="Google Sheet" className="w-6 h-6" />
              <img src="/icons/google-drive.svg" alt="Google Drive" className="w-6 h-6" />
              <img src="/icons/google-docs.svg" alt="Google Drive" className="w-6 h-6" />
            </div>
          </div>
          {/* Integrated Dropdown Extension as sibling, not child, of input wrapper */}
          <div
            className={`relative w-full transition-all duration-200 ${shouldShowPopover ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'} overflow-hidden mt-2 md:mt-3`}
          >
            <div className="w-full z-30 bg-white border-x border-b border-gray-200 rounded-b-2xl shadow-lg overflow-hidden transition-all duration-200" style={{ borderTop: 'none' }}>
              {/* Recent Label */}
              {filteredRecent.length > 0 && (
                <div className="px-4 py-2 text-xs text-gray-400 bg-gray-50 font-semibold border-b border-gray-100">Recent</div>
              )}
              {/* Recent Queries */}
              {filteredRecent.map((query, idx) => (
                <div
                  key={query}
                  className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  onMouseDown={() => setSearchQuery(query)}
                >
                  <Clock className="w-5 h-5 text-gray-400 mr-3" />
                  <div className="text-gray-900 text-sm break-words">{query}</div>
                </div>
              ))}
              {/* Find Label */}
              {searchResults.length > 0 && (
                <div className="px-4 py-2 text-xs text-gray-400 bg-gray-50 font-semibold border-b border-gray-100">Find</div>
              )}
              {/* Files */}
              {searchResults.length > 0 && (
                <div>
                  {searchResults.map((item, idx) => {
                    const { icon, bg } = getIconAndBg(item);
                    return (
                      <div
                        key={item.file_name || idx}
                        className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                        onMouseDown={() => setShowDropdown(false)}
                      >
                        <span className={`mr-3 flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg ${bg}`}>
                          {icon ? (
                            <img src={icon} alt="" className="w-5 h-5" />
                          ) : (
                            <FileText className="w-5 h-5 text-gray-400" />
                          )}
                        </span>
                        <div className="flex-1 min-w-0 break-words">
                          <div className="truncate font-medium text-gray-900 text-sm">{item.file_name}</div>
                          <div className="truncate text-xs text-gray-500">{getTypeLabel(item)} · {item.creator || 'Unknown'} · {item.time || 'Recently'}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {/* Ask Label (always show) */}
              <div className="px-4 py-2 text-xs text-gray-400 border-t border-gray-100 bg-gray-50 font-semibold">Ask</div>
              {/* Ask Suggestions - Show follow-up questions if available, otherwise show default ASK_SUGGESTIONS */}
              {(followUpQuestions.length > 0 ? followUpQuestions : askSuggestions.map(s => s.question)).map((question, idx) => (
                <div
                  key={idx}
                  className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  onMouseDown={() => {
                    setSearchQuery(question);
                    setInputValue(question);
                    setActiveTab('ask');
                    setShowDropdown(false);
                  }}
                >
                  <HelpCircle className="w-5 h-5 text-blue-400 mr-3" />
                  <div className="text-gray-900 text-sm break-words">{question}</div>
                </div>
              ))}
              {/* If no files, no asks, and no recent, show empty state */}
              {searchResults.length === 0 && askSuggestions.length === 0 && filteredRecent.length === 0 && (
                <div className="px-4 py-6 text-center text-gray-400 text-sm">No suggestions found</div>
              )}
            </div>
          </div>
          {/* Responsive Action Buttons and Connected Apps */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center mt-2 w-full gap-2 md:gap-0">
            {/* Action buttons */}
            <div className="flex flex-row md:flex-row space-x-4 md:space-x-8 w-full md:w-auto justify-center md:justify-start">
              <button 
                className={`flex items-center space-x-2 ${activeTab === 'files' ? 'text-blue-600 font-bold' : 'text-gray-600 hover:text-blue-600 font-medium'}`}
                onClick={() => setActiveTab('files')}
              >
                <Search size={18} />
                <span>Find</span>
              </button>
              <button 
                className={`flex items-center space-x-2 ${activeTab === 'ask' ? 'text-blue-600 font-bold' : 'text-gray-600 hover:text-blue-600 font-medium'}`}
                onClick={() => setActiveTab('ask')}
              >
                <HelpCircle size={18} />
                <span>Ask</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 font-medium">
                <FolderKanban size={18} />
                <span>Organize</span>
              </button>
            </div>
            {/* Spacer (hidden on mobile) */}
            <div className="hidden md:flex flex-1" />
            {/* Connected Apps */}
            <div className="flex flex-row items-center space-x-3 justify-center md:justify-end w-full md:w-auto mt-2 md:mt-0">
              {connectedApps.map((app, index) => (
                <div
                  key={index}
                  className={`relative flex items-center justify-center w-6 h-6 rounded-full ${
                    app.isConnected ? 'opacity-100' : 'opacity-50'
                  }`}
                  title={app.isConnected ? `${app.name} is connected` : `${app.name} is not connected`}
                >
                  <Image
                    src={app.icon}
                    alt={app.name}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                  {app.isConnected && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col flex-1 items-center p-6 pt-2">
          {/* AI Answer + Sources Block */}
          <div className="w-full max-w-full md:w-4/5 md:max-w-5xl flex flex-col md:flex-row bg-white rounded-xl shadow border border-gray-100 mb-8" style={{ minHeight: '160px' }}>
            {/* AI Answer (main area) */}
            <div className="flex-[2] min-w-0 overflow-hidden p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-gray-200">
              <div style={{width: '100%', overflowWrap: 'break-word', wordBreak: 'break-all'}} className="prose prose-sm max-w-full break-words break-all whitespace-normal prose-pre:break-words">
                {activeTab === 'files' && synapseResponse && (
                  <div className="mt-4">
                    <div style={{ 
                      wordBreak: 'normal', 
                      whiteSpace: 'normal', 
                      overflowWrap: 'break-word',
                      hyphens: 'auto',
                      paddingLeft: '8px'
                    }}>
                      {(() => {
                        const structuredData = getStructuredData(synapseResponse);
                        if (structuredData && structuredData.summary) {
                          return (
                            <div>
                              <p className="text-lg font-medium mb-2">{structuredData.summary}</p>
                              {structuredData.answer_status && (
                                <p className="text-sm text-gray-500 mb-3">Status: {structuredData.answer_status}</p>
                              )}
                            </div>
                          );
                        } else {
                          return (
                            <ReactMarkdown>
                              {cleanSourceText((synapseResponse.synapse.split('## Sources')[0] || '').trim())}
                            </ReactMarkdown>
                          );
                        }
                      })()}
                    </div>
                  </div>
                )}
                {activeTab === 'ask' && askResponse && (
                  <div className="pl-2">
                    {(() => {
                      if (askResponse && askResponse.answer) {
                        let detailsContent = null;
                        if (askResponse.details) {
                          const details = askResponse.details;
             
                          if (details.details_type === 'table' && Array.isArray(details.content) && details.content.length > 0) {
                            // Render a table with dynamic columns
                            const columns = Object.keys(details.content[0]);
                            detailsContent = (
                              <table className="min-w-full mt-4 mb-2 border text-sm">
                                <thead>
                                  <tr className="bg-gray-100">
                                    {columns.map((col) => (
                                      <th key={col} className="px-3 py-2 border">{col}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {details.content.map((row: any, idx: number) => (
                                    <tr key={idx}>
                                      {columns.map((col) => (
                                        <td key={col} className="px-3 py-2 border align-top">
                                          <ReactMarkdown components={customRenderers}>{String(row[col] ?? '')}</ReactMarkdown>
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            );
                          } else if (details.details_type === 'text' && typeof details.content === 'string') {
                            detailsContent = <ReactMarkdown components={customRenderers}>{details.content}</ReactMarkdown>;
                          } else {
                            // Fallback: render as markdown
                            detailsContent = <ReactMarkdown components={customRenderers}>{typeof details === 'string' ? details : JSON.stringify(details)}</ReactMarkdown>;
                          }
                        }
                        return (
                          <div>
                            <ReactMarkdown components={customRenderers}>
                              {askResponse.answer}
                            </ReactMarkdown>
                            {detailsContent}
                            {askResponse.answer_status && (
                              <p className="text-sm text-gray-500 mb-3">Status: {askResponse.answer_status}</p>
                            )}
                          </div>
                        );
                      } else {
                        return (
                          <ReactMarkdown components={customRenderers}>
                            {cleanMarkdownContent(askResponse.answer.replace('```markdown\n', '').replace('```', ''))}
                          </ReactMarkdown>
                        );
                      }
                    })()}
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-400 mt-4">Uses third-party AI. AI can make mistakes.</div>
            </div>
            {/* Sources (side panel) */}
            <div className="flex-[1] max-w-xs w-full md:w-80 p-6 flex flex-col">
              <div className="text-xs text-gray-500 font-semibold mb-2">Sources</div>
              <div className="flex flex-col space-y-4">
                {activeTab === 'ask' && askResponse ? (
                  <>
                    {askResponse.sources.map((rawSource, idx) => {
                      // Use type assertion to avoid TypeScript errors
                      const source = rawSource as SourceItem;
                      let icon: string | null = null, bg: string = '', name: string | undefined = undefined, typeLabel: string = '';
                      
                      // Extract additional details from the answer if available
                      const answerText = askResponse.answer || '';
                      const sourceName = typeof source === 'object' && source !== null && source.file_name 
                        ? source.file_name 
                        : '';
                      
                      // Try to find structured source information first
                      const structuredSources = getStructuredSources(answerText);
                      let structuredSource = null;
                      
                      if (structuredSources) {
                        structuredSource = structuredSources.find((s: { name?: string }) =>
                          s.name === sourceName || s.name === name
                        );
                      }
                      
                      // If we have structured source data, use that
                      const relevance = structuredSource?.relevance === 'high' ? 0.9 : 
                                       structuredSource?.relevance === 'medium' ? 0.7 : 
                                       structuredSource?.relevance === 'low' ? 0.5 : 
                                       source.relevance;
                      
                      const contributionText = structuredSource?.contribution || '';
                      const keyQuote = structuredSource?.key_text_quote || '';
                      
                      // Fallback to legacy source format extraction if no structured data
                      const sourceSection = !structuredSource && answerText.includes(`Document ${idx + 1}: ${sourceName}`) 
                        ? answerText.split(`Document ${idx + 1}: ${sourceName}`)[1]?.split('###')[0] 
                        : '';
                      
                      const supportingText = !structuredSource && sourceSection && sourceSection.includes('Supporting Text') 
                        ? cleanSourceText(sourceSection.split('Supporting Text')[1]?.split('-')[0]) 
                        : keyQuote; // Use keyQuote if structured
                      
                      const contribution = !structuredSource && sourceSection && sourceSection.includes('Contribution') 
                        ? cleanSourceText(sourceSection.split('Contribution')[1]?.split('-')[0]) 
                        : contributionText; // Use contribution from structured data
                      
                      const additionalContext = !structuredSource && sourceSection && sourceSection.includes('Additional Context') 
                        ? cleanSourceText(sourceSection.split('Additional Context')[1]?.split('-')[0]) 
                        : '';

                      if (typeof source === 'object' && source !== null && source.metadata && source.file_name) {
                        ({ icon, bg } = getIconAndBg({ metadata: source.metadata }));
                        name = source.file_name;
                        typeLabel = getTypeLabel({ metadata: source.metadata });
                      } else {
                        // For strings or other unexpected types, handle gracefully
                        const sourceStr = typeof source === 'string' ? source : String(source || '');
                        name = sourceStr.replace ? sourceStr.replace(/\*\*/g, '') : sourceStr;
                        ({ icon, bg } = getIconAndBg({ metadata: { mime_type: '' } }));
                        typeLabel = '';
                      }
                      return (
                        <div 
                          key={idx} 
                          id={`source-${name}`}
                          className="flex flex-col space-y-2 p-3 pl-4 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors duration-200 mb-2"
                        >
                          <div className="flex items-center space-x-2">
                            <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg ${bg}`}>
                              {icon ? (
                                <img src={icon} alt="" className="w-4 h-4" />
                              ) : (
                                <FileText className="w-4 h-4 text-gray-400" />
                              )}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">{name}</div>
                              <div className="text-xs text-gray-500">{typeLabel}</div>
                            </div>
                          </div>
                          {source.relevance !== undefined && (
                            <div className="text-xs text-gray-500">Relevance: {typeof relevance === 'number' ? (relevance * 100).toFixed(1) + '%' : relevance}</div>
                          )}
                          {source.similarity_score !== undefined && (
                            <div className="text-xs text-gray-500">Similarity: {(source.similarity_score * 100).toFixed(1)}%</div>
                          )}
                          {supportingText && (
                            <div className="text-xs text-gray-700"><b>Supporting Text:</b> {cleanSourceText(supportingText)}</div>
                          )}
                          {contribution && (
                            <div className="text-xs text-gray-700"><b>Contribution:</b> {cleanSourceText(contribution)}</div>
                          )}
                          {additionalContext && (
                            <div className="text-xs text-gray-700"><b>Additional Context:</b> {cleanSourceText(additionalContext)}</div>
                          )}
                        </div>
                      );
                    })}
                  </>
                ) : synapseResponse?.sources ? (
                  synapseResponse.sources.map((rawSource, idx) => {
                    const source = rawSource as SourceItem;
                    let icon: string | null = null, bg: string = '', name: string | undefined = undefined, typeLabel: string = '';
                    
                    if (typeof source === 'object' && source !== null && source.metadata && source.name) {
                      ({ icon, bg } = getIconAndBg({ metadata: source.metadata }));
                      name = source.name;
                      typeLabel = getTypeLabel({ metadata: source.metadata });
                    } else {
                      // For strings or other unexpected types, handle gracefully
                      const sourceStr = typeof source === 'string' ? source : String(source || '');
                      name = sourceStr.replace ? sourceStr.replace(/\*\*/g, '') : sourceStr;
                      ({ icon, bg } = getIconAndBg({ metadata: { mime_type: '' } }));
                      typeLabel = '';
                    }
                    return (
                      <div 
                        key={idx}
                        className="flex flex-col space-y-2 p-3 pl-4 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors duration-200 mb-2"
                      >
                        <div className="flex items-center space-x-2">
                          <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg ${bg}`}>
                            {icon ? (
                              <img src={icon} alt="" className="w-4 h-4" />
                            ) : (
                              <FileText className="w-4 h-4 text-gray-400" />
                            )}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">{name}</div>
                            <div className="text-xs text-gray-500">{typeLabel}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <>
                    <div className="flex items-center space-x-2">
                      <img src="/icons/google_sheet.svg" alt="Sheet" className="w-5 h-5" />
                      <span className="text-sm text-gray-700">Spring Campaign Plan</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <img src="/icons/google-docs.svg" alt="Doc" className="w-5 h-5" />
                      <span className="text-sm text-gray-700">Hero Product Brief</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Divider between AI and results */}
          <div className="w-full max-w-full md:w-4/5 md:max-w-5xl flex items-center mb-6 px-2 md:px-0">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="mx-4 text-xs text-gray-400">Search Results</span>
            <div className="flex-1 h-px bg-gray-200" /> 
          </div>
         
          {/* Filters Row */}
          <div className="w-full max-w-full md:w-4/5 md:max-w-5xl flex flex-wrap items-center gap-2 md:gap-4 mb-4 px-2 md:px-0">
            <button className="flex items-center space-x-1 text-gray-600 bg-gray-100 rounded px-3 py-1 text-sm font-medium">
              <span>App</span>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke="#888" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
            <button className="flex items-center space-x-1 text-gray-600 bg-gray-100 rounded px-3 py-1 text-sm font-medium">
              <span>Type</span>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke="#888" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
            <button className="flex items-center space-x-1 text-gray-600 bg-gray-100 rounded px-3 py-1 text-sm font-medium">
              <span>Updated</span>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke="#888" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
            <button className="flex items-center space-x-1 text-gray-600 bg-gray-100 rounded px-3 py-1 text-sm font-medium">
              <span>People</span>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke="#888" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
          </div>

          {/* Results List or Recent Files */}
          <div className="w-full max-w-full md:w-4/5 md:max-w-5xl flex flex-col space-y-4 px-2 md:px-0 h-auto min-h-0">
            {activeTab === 'ask' ? (
              // Show files from ask response
              askResponse?.sources.map((source, idx) => {
                const { icon, bg } = getIconAndBg({ metadata: source.metadata });
                return (
                  <div key={idx} className="flex items-start bg-white rounded-xl shadow border border-gray-100 p-4 pl-5 break-words w-full">
                    <span className={`mr-4 flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg ${bg}`}>
                      {icon ? (
                        <img src={icon} alt="" className="w-6 h-6" />
                      ) : (
                        <FileText className="w-6 h-6 text-gray-400" />
                      )}
                    </span>
                    <div className="flex-1 min-w-0 break-words">
                      <div className="font-semibold text-gray-900 break-words">{source.file_name}</div>
                      <div className="text-xs text-gray-500 mb-1 break-words">
                        Relevance: {(source.relevance * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              // Show search results
              searchResults.map((item, idx) => {
                const { icon, bg } = getIconAndBg(item);
                return (
                  <div key={item.file_name || idx} className="flex items-start bg-white rounded-xl shadow border border-gray-100 p-4 pl-5 break-words w-full">
                    <span className={`mr-4 flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg ${bg}`}>
                      {icon ? (
                        <img src={icon} alt="" className="w-6 h-6" />
                      ) : (
                        <FileText className="w-6 h-6 text-gray-400" />
                      )}
                    </span>
                    <div className="flex-1 min-w-0 break-words">
                      <div className="font-semibold text-gray-900 break-words">{item.file_name}</div>
                      <div className="text-xs text-gray-500 mb-1 break-words">
                        {item.creator && (
                          <>Created by <span className="underline">{item.creator}</span> · </>
                        )}
                        {item.time || "Recently"}
                      </div>
                      {item.description && (
                        <div className="text-sm text-gray-700 break-words">{item.description}</div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Overview; 