import React, { useState, useEffect, useRef } from "react";
import AdminLayout from '../layout';
import { Activity, Users, FileText, Clock, Search, Plus, HelpCircle, List, FolderKanban, File, Info } from 'lucide-react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import { useRouter, usePathname } from 'next/navigation';

// Icon mapping for dynamic rendering
const ICON_MAP: Record<string, string> = {
  'Google Sheets': '/icons/google_sheet.svg',
  'Google Slides': '/icons/google-drive.svg',
  'Confluence': '/icons/microsoft-365.svg',
  'Recent Search': '/icons/google_sheet.svg', // You can use a clock icon if you have one
};

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

interface RecentQueries {
  search: string[];
  ask: string[];
}

function RecentQueries() {
  const [recentQueries, setRecentQueries] = useState<RecentQueries>({ search: [], ask: [] });
  const router = useRouter();
  const pathname = usePathname();
  const isSearchPage = pathname?.includes('/search');

  useEffect(() => {
    const fetchRecentQueries = async () => {
      try {
        const response = await fetch('/api/recent/recent');
        const data = await response.json();
        setRecentQueries(data);
      } catch (error) {
        console.error('Error fetching recent queries:', error);
      }
    };

    fetchRecentQueries();
  }, []);

  // Only show queries relevant to current page
  const relevantQueries = isSearchPage ? recentQueries.search : recentQueries.ask;
  const title = isSearchPage ? 'Recent Searches' : 'Recent Asks';

  if (relevantQueries.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 p-4 border border-gray-200 rounded-lg">
      <h3 className="text-sm font-semibold text-gray-600 mb-2">{title}</h3>
      <ul className="space-y-2">
        {relevantQueries.map((query, index) => (
          <li key={`${isSearchPage ? 'search' : 'ask'}-${index}`} className="text-sm text-gray-500">
            {query}
          </li>
        ))}
      </ul>
    </div>
  );
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

// Add this component at the top of the file, after the imports
const LoadingSkeleton = () => {
  return (
    <div className="w-full max-w-full md:w-4/5 md:max-w-5xl flex flex-col space-y-4 px-2 md:px-0">
      {/* AI Answer Skeleton */}
      <div className="w-full max-w-full md:w-4/5 md:max-w-5xl flex flex-col md:flex-row bg-white rounded-xl shadow border border-gray-100 mb-8">
        <div className="flex-[2] min-w-0 overflow-hidden p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-gray-200">
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
          </div>
        </div>
        <div className="flex-[1] max-w-xs w-full md:w-80 p-6 flex flex-col">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col space-y-2 p-3 pl-4 rounded-lg border border-gray-100">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mt-2 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Results Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start bg-white rounded-xl shadow border border-gray-100 p-4 pl-5">
            <div className="mr-4 w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="flex-1">
              <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mt-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mt-2 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
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
  const [askSuggestions, setAskSuggestions] = useState<{question: string}[]>([]);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [recentQueries, setRecentQueries] = useState<{ search: string[], ask: string[] }>({ search: [], ask: [] });
  const [hasFetchedRecent, setHasFetchedRecent] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const connectedApps = [
    {
      name: 'Google Drive',
      icon: '/google-drive-icon.svg',
      isConnected: true
    }
  ];

  const router = useRouter();
  const pathname = usePathname();
  const isSearchPage = pathname?.includes('/search');

  // Fetch recent queries when input is reset and user starts typing
  useEffect(() => {
    const fetchRecentQueries = async () => {
      if (!hasFetchedRecent && isTyping) {
        try {
          const response = await fetch('/api/recent/recent');
          const data = await response.json();
          setRecentQueries(data);
          setHasFetchedRecent(true);
        } catch (error) {
          console.error('Error fetching recent queries:', error);
        }
      }
    };

    fetchRecentQueries();
  }, [hasFetchedRecent, isTyping]);

  // Reset hasFetchedRecent when input is cleared
  useEffect(() => {
    if (inputValue === '') {
      setHasFetchedRecent(false);
      setIsTyping(false);
    }
  }, [inputValue]);

  // Update input handling
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    setShowDropdown(true);
    setIsTyping(true);

    // Auto-grow textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  };

  // Update search effect to only trigger on 5+ characters
  useEffect(() => {
    if (searchQuery.length < 5) {
      setSearchResults([]);
      setAskResponse(null);
      setSynapseResponse(null);
      setFollowUpQuestions([]);
      setAskSuggestions([]);
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
            let parsedData = data;
            if (parsedData.follow_up_questions) {
              let questions: string[] = [];
              if (typeof parsedData.follow_up_questions === 'string') {
                try {
                  questions = JSON.parse(parsedData.follow_up_questions);
                } catch {
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
              let parsedData = synapseData;
              if (parsedData.follow_up_questions) {
                let questions: string[] = [];
                if (typeof parsedData.follow_up_questions === 'string') {
                  try {
                    questions = JSON.parse(parsedData.follow_up_questions);
                  } catch {
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

  // Update the filtered recent queries logic
  const filteredRecent = activeTab === 'ask' 
    ? recentQueries.ask.filter(q => q.toLowerCase().includes(searchQuery.toLowerCase()))
    : recentQueries.search.filter(q => q.toLowerCase().includes(searchQuery.toLowerCase()));

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
          {/* Search input and file icons row */}
          <div className="flex flex-row flex-wrap items-start w-full gap-2">
            {/* Search Input */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-row items-start w-full">
                <textarea
                  className={`bg-transparent text-lg focus:outline-none placeholder-gray-400 mb-0 w-full pr-2 pl-4 rounded-t-2xl ${shouldShowPopover ? '' : 'rounded-b-2xl'} break-words whitespace-pre-line resize-none`}
                  placeholder="Search or ask your work content…"
                  value={inputValue}
                  onChange={handleInputChange}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => {
                    setShowDropdown(false);
                    setSearchQuery(inputValue);
                    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
                  }}
                  rows={1}
                  style={{ minHeight: '48px' }}
                />
                {/* File icons, always right of input, never overlap */}
                <div className="flex flex-row items-center space-x-3 ml-2 shrink-0 opacity-40 pt-2">
                  <img src="/icons/google_sheet.svg" alt="Google Sheet" className="w-6 h-6" />
                  <img src="/icons/google-drive.svg" alt="Google Drive" className="w-6 h-6" />
                  <img src="/icons/google-docs.svg" alt="Google Drive" className="w-6 h-6" />
                </div>
              </div>
              {/* Integrated Dropdown Extension */}
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
                      key={`${activeTab}-${idx}`}
                      className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                      onMouseDown={async () => {
                        setInputValue(query);
                        setSearchQuery(query);
                        setShowDropdown(false);
                        setIsLoading(true);

                        try {
                          if (activeTab === 'ask') {
                            const res = await fetch(`/api/ask?query=${encodeURIComponent(query)}`);
                            const data = await res.json();
                            setAskResponse(data);
                            
                            // Extract follow-up questions
                            try {
                              let parsedData = data;
                              if (parsedData.follow_up_questions) {
                                let questions: string[] = [];
                                if (typeof parsedData.follow_up_questions === 'string') {
                                  try {
                                    questions = JSON.parse(parsedData.follow_up_questions);
                                  } catch {
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
                            const searchPromise = fetch(`/api/search/search?query=${encodeURIComponent(query)}`).then(res => res.json());
                            const synapsePromise = fetch(`/api/ask_synapse?query=${encodeURIComponent(query)}`).then(res => res.json()).catch(() => null);
                            const [searchData, synapseData] = await Promise.all([searchPromise, synapsePromise]);
                            setSearchResults(Array.isArray(searchData) ? searchData : []);
                            setSynapseResponse(synapseData);
                            
                            // Extract follow-up questions from synapse response
                            if (synapseData) {
                              try {
                                let parsedData = synapseData;
                                if (parsedData.follow_up_questions) {
                                  let questions: string[] = [];
                                  if (typeof parsedData.follow_up_questions === 'string') {
                                    try {
                                      questions = JSON.parse(parsedData.follow_up_questions);
                                    } catch {
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
                      }}
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
                  {/* Ask Label (only show if we have suggestions) */}
                  {(followUpQuestions.length > 0 || askSuggestions.length > 0) && (
                    <div className="px-4 py-2 text-xs text-gray-400 border-t border-gray-100 bg-gray-50 font-semibold">Ask</div>
                  )}
                  {/* Ask Suggestions - Show follow-up questions if available */}
                  {(followUpQuestions.length > 0 ? followUpQuestions : askSuggestions.map(s => s.question)).map((question, idx) => (
                    <div
                      key={idx}
                      className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                      onMouseDown={async () => {
                        setInputValue(question);
                        setSearchQuery(question);
                        setActiveTab('ask');
                        setShowDropdown(false);
                        setIsLoading(true);

                        try {
                          const res = await fetch(`/api/ask?query=${encodeURIComponent(question)}`);
                          const data = await res.json();
                          setAskResponse(data);
                          
                          // Extract follow-up questions
                          try {
                            let parsedData = data;
                            if (parsedData.follow_up_questions) {
                              let questions: string[] = [];
                              if (typeof parsedData.follow_up_questions === 'string') {
                                try {
                                  questions = JSON.parse(parsedData.follow_up_questions);
                                } catch {
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
                        } catch (e) {
                          console.error('API error:', e);
                          setAskResponse(null);
                          setFollowUpQuestions([]);
                        } finally {
                          setIsLoading(false);
                        }
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
            </div>
          </div>

          {/* Action Buttons and Connected Apps Row */}
          <div className="flex flex-row items-center justify-between mt-4 w-full gap-2 flex-wrap">
            <div className="flex flex-row space-x-4 md:space-x-8">
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
            {/* Connected Apps right-aligned */}
            <div className="flex flex-row items-center space-x-3 ml-auto">
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
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <>
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
                          <div className="text-sm text-gray-700">
                            <ReactMarkdown components={customRenderers}>
                              {synapseResponse.synapse}
                            </ReactMarkdown>
                          </div>
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
                              } else if (details.details_type === 'paragraph' && typeof details.content === 'string') {
                                detailsContent = (
                                  <div className="mt-4 text-sm text-gray-700">
                                    <ReactMarkdown components={customRenderers}>
                                      {details.content}
                                    </ReactMarkdown>
                                  </div>
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
                      <div className="text-sm text-gray-500">No files</div>
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
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Overview; 