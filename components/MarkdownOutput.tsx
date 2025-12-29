import React, { useState, useMemo, useEffect } from 'react';

interface MarkdownOutputProps {
  content: string;
  isCollapsible?: boolean;
}

interface Section {
  title: string;
  lines: string[];
}

const MarkdownOutput: React.FC<MarkdownOutputProps> = ({ content, isCollapsible = true }) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  // Split logic based on diverse technical emoji headers
  const sections = useMemo(() => {
    const lines = content.split('\n');
    const result: Section[] = [];
    let currentSection: Section | null = null;

    lines.forEach(line => {
      const trimmed = line.trim();
      const isHeader = 
        trimmed.startsWith('🏗️') || 
        trimmed.startsWith('🛠️') || 
        trimmed.startsWith('📐') || 
        trimmed.startsWith('⚠️') || 
        trimmed.startsWith('🚀') || 
        trimmed.startsWith('💡') || 
        trimmed.startsWith('📚');
      
      if (isHeader) {
        if (currentSection) result.push(currentSection);
        currentSection = { title: line, lines: [] };
      } else if (currentSection) {
        currentSection.lines.push(line);
      } else if (trimmed.length > 0) {
        currentSection = { title: "Overview", lines: [line] };
      }
    });
    if (currentSection) result.push(currentSection);
    return result;
  }, [content]);

  useEffect(() => {
    const initial: Record<string, boolean> = {};
    sections.forEach(s => initial[s.title] = true);
    setExpandedSections(initial);
  }, [sections]);

  const toggleSection = (title: string) => {
    if (!isCollapsible) return;
    setExpandedSections(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopyStatus('copied');
    setTimeout(() => setCopyStatus('idle'), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pathify-blueprint-${new Date().getTime()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const cleanText = (text: string) => text.replace(/\*\*/g, '');

  const formatWithFilenames = (text: string) => {
    const filenameRegex = /\b([\w-]+\.(?:tsx|ts|js|jsx|py|html|css|json|md|txt|sh|rs|go|yml|yaml|sql|php|rb|java|c|cpp|h))\b/g;
    const parts = text.split(filenameRegex);
    
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return (
          <code key={i} className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 font-mono text-[0.95em] border border-sky-500/20 shadow-sm mx-0.5">
            {part}
          </code>
        );
      }
      return cleanText(part);
    });
  };

  const renderSectionContent = (lines: string[]) => {
    return lines.map((line, i) => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('●')) {
        const isPoppedHeader = /week \d+|phase \d+/i.test(trimmedLine);
        return (
          <div 
            key={i} 
            className={`font-black mt-10 mb-6 flex items-start text-sm md:text-base uppercase tracking-[0.25em] pl-5 border-l-4 transition-all duration-300
              ${isPoppedHeader 
                ? 'text-white border-teal-500 bg-teal-500/10 py-3 pr-4 rounded-r-lg shadow-[0_0_25px_rgba(20,184,166,0.1)] brightness-125' 
                : 'text-indigo-300 border-indigo-500/40'}`}
          >
            <span>{formatWithFilenames(trimmedLine.replace('●', '').trim())}</span>
          </div>
        );
      }
      
      if (trimmedLine.startsWith('•')) {
        return (
          <div key={i} className="ml-6 md:ml-10 text-slate-200 mb-5 flex items-start leading-relaxed text-base md:text-lg group">
            <span className="mr-4 text-teal-400 flex-shrink-0 mt-1.5 opacity-60">•</span>
            <span className="font-medium opacity-95 tracking-wide">{formatWithFilenames(trimmedLine.replace('•', '').trim())}</span>
          </div>
        );
      }

      if (trimmedLine.length === 0) return <div key={i} className="h-2" />;
      
      return (
        <p key={i} className="text-slate-400 mb-6 leading-relaxed ml-6 md:ml-10 text-base md:text-lg max-w-5xl">
          {formatWithFilenames(line)}
        </p>
      );
    });
  };

  return (
    <div className="bg-white/[0.02] text-slate-100 rounded-[40px] shadow-2xl border border-white/10 font-sans selection:bg-indigo-500/30 overflow-hidden relative">
      <div className="flex justify-between items-center p-8 border-b border-white/5 bg-white/[0.01]">
        <div className="text-xs font-black uppercase tracking-[0.4em] text-slate-500">Architectural Report Output</div>
        <div className="flex space-x-4">
          <button 
            onClick={handleCopy}
            className="flex items-center space-x-3 px-5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white"
          >
            {copyStatus === 'copied' ? (
              <>
                <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                <span>Copied</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                <span>Copy Markdown</span>
              </>
            )}
          </button>
          <button 
            onClick={handleDownload}
            className="flex items-center space-x-3 px-5 py-2.5 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all text-xs font-bold uppercase tracking-widest text-indigo-400 hover:text-indigo-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            <span>Download .md</span>
          </button>
        </div>
      </div>

      <div className="p-6 md:p-12 space-y-8">
        {sections.map((section, index) => {
          const isExpanded = expandedSections[section.title];
          return (
            <div key={index} className={`bg-white/[0.02] rounded-[32px] border border-white/5 overflow-hidden transition-all duration-300 ${isCollapsible ? 'group' : 'pb-8'}`}>
              {isCollapsible ? (
                <button 
                  onClick={() => toggleSection(section.title)}
                  className="w-full flex items-center justify-between p-8 text-left group-hover:bg-white/[0.03] transition-colors"
                >
                  <h3 className="text-white text-lg md:text-xl font-black uppercase tracking-[0.1em] leading-none flex items-center">
                    <span className="opacity-90 group-hover:opacity-100 transition-opacity">
                      {cleanText(section.title.replace('###', '').trim())}
                    </span>
                  </h3>
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/20 transition-all">
                    <svg 
                      className={`w-5 h-5 text-slate-400 transition-transform duration-500 ${isExpanded ? 'rotate-180' : 'rotate-0'}`} 
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </button>
              ) : (
                <div className="w-full flex items-center justify-between p-8 text-left border-b border-white/5 bg-white/[0.01]">
                  <h3 className="text-white text-2xl md:text-3xl font-black uppercase tracking-[0.05em] leading-none flex items-center">
                    <span className="text-indigo-400 mr-4">/</span>
                    {cleanText(section.title.replace('###', '').trim())}
                  </h3>
                </div>
              )}
              
              <div className={`transition-all duration-500 ease-in-out ${(!isCollapsible || isExpanded) ? 'max-h-[20000px] opacity-100 p-8 pt-4' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                {isCollapsible && <div className="h-px bg-white/5 mb-8" />}
                {renderSectionContent(section.lines)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MarkdownOutput;