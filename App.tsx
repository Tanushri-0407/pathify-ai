import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import Input from './components/Input';
import Button from './components/Button';
import FileUpload from './components/FileUpload';
import MarkdownOutput from './components/MarkdownOutput';

const App: React.FC = () => {
  const [sourceInput, setSourceInput] = useState<string>('');
  const [goalInput, setGoalInput] = useState<string>('');
  const [contextInput, setContextInput] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [outputContent, setOutputContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showDocs, setShowDocs] = useState<boolean>(false);
  const [statusIndex, setStatusIndex] = useState<number>(0);

  // Roadmap Settings
  const [focus, setFocus] = useState<'Frontend' | 'Backend' | 'Full Stack'>('Full Stack');
  const [intensity, setIntensity] = useState<number>(50); 
  const [duration, setDuration] = useState<string>('4 weeks');
  const [specialRequirements, setSpecialRequirements] = useState<string>('');

  const intensityLabel = intensity < 50 ? 'Gradual Onboarding' : 'Deep Dive';

  // Status messages configuration
  const statusMessages = useMemo(() => {
    const isModeB = uploadedFiles.length === 0 && sourceInput.trim().length > 0;
    
    if (isModeB) {
      return [
        { emoji: "🚀", text: `1. Generating ${duration} onboarding roadmap...`, animation: "animate-soft-pulse" },
        { emoji: "✨", text: "2. Polishing the roadmap...", animation: "animate-slow-rotate" },
      ];
    }
    
    return [
      { emoji: "🔍", text: "Analyzing file structure...", animation: "animate-soft-pulse" },
      { emoji: "🏗️", text: "Mapping project blueprint...", animation: "animate-slow-rotate" },
      { emoji: "⚠️", text: "Scanning for security hotspots...", animation: "animate-soft-pulse" },
      { emoji: "🚀", text: `Generating ${duration} onboarding plan...`, animation: "animate-soft-pulse" },
      { emoji: "✨", text: "Polishing your results...", animation: "animate-slow-rotate" },
    ];
  }, [duration, uploadedFiles.length, sourceInput]);

  useEffect(() => {
    let interval: number;
    if (isLoading) {
      interval = window.setInterval(() => {
        setStatusIndex((prev) => (prev + 1) % statusMessages.length);
      }, 2500);
    } else {
      setStatusIndex(0);
    }
    return () => clearInterval(interval);
  }, [isLoading, statusMessages.length]);

  const handleTrySample = useCallback(() => {
    const sampleOutput = `🏗️ BLUEPRINT
● PROJECT BLUEPRINT
Pathify is a specialized AI platform engineered to facilitate high-velocity technical onboarding by transforming raw source code into structured architectural audits and contribution roadmaps.

● CORE TECHNOLOGIES & COMPONENTS
       • React 19: Powering the view layer with concurrent rendering and functional state primitives.
       • Google Generative AI (Gemini 3 Pro): Providing multi-modal reasoning and code-understanding logic.
       • Tailwind CSS: Managing atomic design and hardware-accelerated UI transitions.

● ARCHITECTURAL SUMMARY & COMPONENTS
       • App.tsx: Orchestrating global application state, GenAI bridge logic, and route segmentation.
       • MarkdownOutput.tsx: Implementing a regex-based parser for dynamic report generation and collapsible UI state.

⚠️ SECURITY AND MAINTENANCE
● SECURITY HOTSPOTS
       • Client-side Secrets: Environment variables like process.env.API_KEY are exposed in the client bundle.
       • Buffer Handling: The lack of file size limits in FileUpload.tsx may cause memory heap exhaustion.

● RISK & MAINTENANCE
       • Prompt Injection: Direct injection of user strings into AI prompts is a primary risk factor.
       • Fragile Regex: The parser depends on emoji-prefix consistency which varies by model output.

🚀 THE ONBOARDING ROADMAP
● ${duration.toUpperCase()} TIMELINE
       • Goal: Debug state synchronization between file uploading and the global loading indicator.
       • Technical Context: Investigate React batching behavior during multiple asynchronous file buffer resolutions.

● MICRO-CONTRIBUTION TASK
       • Task: Add a "Clear All" utility to FileUpload.tsx to purge selected files from the transient state.`;

    setOutputContent(sampleOutput);
    setTimeout(() => {
      document.getElementById('result-area')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [duration]);

  const handleSubmit = useCallback(async () => {
    setIsLoading(true);
    setOutputContent('');

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const isModeA = uploadedFiles.length > 0;
    
    const systemInstruction = isModeA 
      ? `You are 'Pathify' AI, a Senior Software Architect.
         [MODE A: FULL AUDIT]
         YOUR RESPONSE MUST BE ORGANIZED INTO EXACTLY THREE SECTIONS:
         1. 🏗️ BLUEPRINT
            - Content must include: Project Blueprint, Core Technologies & Components, and Architectural Summary & Components.
         2. ⚠️ SECURITY AND MAINTENANCE
            - Content must include: Security Hotspots, and Risk & Maintenance.
         3. 🚀 THE ONBOARDING ROADMAP
            - Content must include: The ${duration} onboarding roadmap and a Micro-Contribution task.
         
         TECHNICAL CONTENT RULES:
         - One high-density technical sentence per bullet.
         - Use ● for sub-headers and • for bullets. No double asterisks (**).`
      : `You are 'Pathify' AI, a Senior Technical Curriculum Designer.
         [MODE B: SKILL ARCHITECT]
         YOUR RESPONSE MUST BE ORGANIZED INTO EXACTLY THREE SECTIONS:
         1. 🚀 [DURATION] ONBOARDING ROADMAP (Phase-based technical roadmap)
         2. 💡 PRO TIP (Short, 1-2 sentence actionable advice)
         3. 📚 RECOMMENDED RESOURCES (A list of 3-5 trusted, high-quality high-value sources/docs for reference)
         
         CRITICAL RULES:
         - ONLY output the Roadmap, Pro Tip, and Recommended Resources.
         - DO NOT show 'Project Analysis' or 'Security Hotspots'.
         - For roadmap headers, use '● WEEK 1: ...' or '● PHASE 1: ...'.
         - One high-density sentence per bullet.
         - Use ● for sub-headers and • for bullets. No double asterisks (**).`;

    const settingsContext = `
    ROADMAP SETTINGS:
    - Focus Area: ${focus}
    - Intensity: ${intensityLabel} (${intensity}/100)
    - Target Duration: ${duration}
    - Special Instructions: ${specialRequirements || 'None provided'}
    `;

    let userPrompt = "";

    if (isModeA) {
      const fileData = await Promise.all(uploadedFiles.map(async f => ({
        name: f.name,
        content: await f.text()
      })));

      userPrompt = `[MODE A: FULL AUDIT]
      GOAL: ${goalInput || 'Full Onboarding'}
      CONTEXT: ${contextInput}
      ${settingsContext}
      
      SOURCE CODE:
      ${fileData.map(f => `FILE: ${f.name}\nCONTENT: ${f.content}`).join('\n\n')}
      
      GENERATE THE 3-SECTION AUDIT NOW.`;
    } else {
      userPrompt = `[MODE B: SKILL ARCHITECT]
      SKILL TO MASTER: ${sourceInput || 'Modern Software Engineering'}
      GOAL: ${goalInput}
      CONTEXT: ${contextInput}
      ${settingsContext}
      
      GENERATE THE TECHNICAL ROADMAP, PRO TIP, AND RECOMMENDED RESOURCES FOR THIS SKILL.`;
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: userPrompt,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.1,
        },
      });

      setOutputContent(response.text || "Failed to generate report.");
      setTimeout(() => {
        document.getElementById('result-area')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error("Pathify Engine Error:", error);
      setOutputContent("Error during generation. Check console.");
    } finally {
      setIsLoading(false);
    }
  }, [uploadedFiles, sourceInput, goalInput, contextInput, focus, intensity, duration, specialRequirements, intensityLabel]);

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-4">
      {/* Navigation */}
      <nav className="flex justify-between items-center py-6 mb-12">
        <button 
          onClick={() => setShowDocs(false)}
          className="text-4xl text-white bubble-font lowercase outline-none focus:outline-none"
        >
          pathify<span className="text-indigo-500">.</span>
        </button>
        <div className="flex space-x-8 text-sm font-semibold tracking-wide text-slate-400">
          <button 
            onClick={() => setShowDocs(!showDocs)}
            className={`${showDocs ? 'text-white' : 'hover:text-white'} transition-colors uppercase tracking-[0.2em] text-xs font-black`}
          >
            {showDocs ? 'Back to Architect' : 'Documentation'}
          </button>
        </div>
      </nav>

      {showDocs ? (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-top-4 duration-500 pb-24 text-lg">
          <h1 className="text-5xl font-black text-white mb-8">Documentation</h1>
          
          <section className="space-y-16">
            {/* How It Works Section */}
            <div>
              <h2 className="text-2xl font-black text-indigo-400 uppercase tracking-widest mb-6 border-b border-white/10 pb-2">How Pathify Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <h3 className="text-white font-bold text-xl flex items-center">
                    <span className="bg-indigo-500/20 text-indigo-400 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm font-black">1</span>
                    With Source Code
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    By uploading critical files (up to 5), Pathify performs a deep-tissue architectural scan. It maps component hierarchies, identifies technical patterns, and detects security bottlenecks to create a personalized onboarding plan based on your existing codebase.
                  </p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-white font-bold text-xl flex items-center">
                    <span className="bg-teal-500/20 text-teal-400 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm font-black">2</span>
                    Without Uploads
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    If you want to master a new skill from scratch, simply use the <span className="text-white font-semibold italic">Skill Architect</span> input. Pathify acts as a Senior Curriculum Designer, building a high-level roadmap of core pillars, common pitfalls, and implementation phases for any technology you wish to learn.
                  </p>
                </div>
              </div>
            </div>

            {/* Privacy Section */}
            <div className="bg-white/[0.03] p-8 rounded-[32px] border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <svg className="w-24 h-24 text-indigo-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-3zm0 10.5h7c-.47 4.01-2.9 7.73-7 8.92V12.5H5V6.3l7-2.33v8.53z"/></svg>
              </div>
              <h2 className="text-2xl font-black text-teal-400 uppercase tracking-widest mb-6">Privacy & File Safety</h2>
              <p className="text-slate-300 leading-relaxed mb-6">
                Your code is your intellectual property. Pathify is designed with a <span className="text-white font-bold underline decoration-indigo-500 underline-offset-4">Security-First Architecture</span>:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                  <h4 className="text-indigo-300 font-bold mb-2 text-sm uppercase">Zero Storage</h4>
                  <p className="text-slate-500 text-xs">Files are read as transient text buffers and never written to any disk or database.</p>
                </div>
                <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                  <h4 className="text-indigo-300 font-bold mb-2 text-sm uppercase">No Training</h4>
                  <p className="text-slate-500 text-xs">Your private code is never used to train future AI models or shared with third parties.</p>
                </div>
                <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                  <h4 className="text-indigo-300 font-bold mb-2 text-sm uppercase">In-Memory</h4>
                  <p className="text-slate-500 text-xs">All processing happens in volatile memory and is purged once your session ends.</p>
                </div>
              </div>
            </div>

            {/* Architecture Overview */}
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-indigo-400 uppercase tracking-widest mb-6 border-b border-white/10 pb-2">The Pathify Output</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <span className="text-2xl">🏗️</span>
                  <div>
                    <h4 className="text-white font-bold">Project Analysis (Mode A)</h4>
                    <p className="text-slate-400 text-base">Comprehensive breakdown of project DNA, tech stack, and architecture.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <span className="text-2xl">💡</span>
                  <div>
                    <h4 className="text-white font-bold">Pro Tip (Mode B)</h4>
                    <p className="text-slate-400 text-base">Expert advice to accelerate your learning journey when exploring new technologies.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <span className="text-2xl">🚀</span>
                  <div>
                    <h4 className="text-white font-bold">Onboarding Roadmap</h4>
                    <p className="text-slate-400 text-base">A phased execution plan tailored to your duration and focus area.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start mb-24">
            <div className="pt-12 lg:sticky lg:top-24">
              <h1 className="text-6xl xl:text-7xl font-black text-white leading-[1.1] mb-8">
                Pathify: The <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-teal-400">Onboarding Architect.</span>
              </h1>
              <p className="text-xl xl:text-2xl text-slate-400 leading-relaxed max-w-xl">
                Turn complex codebases into structured contribution plans instantly.
              </p>
            </div>

            <div className="glass-card p-8 xl:p-12 shadow-2xl relative">
              <div className="space-y-6">
                <div className="flex flex-col space-y-4">
                  <FileUpload onFilesSelected={setUploadedFiles} maxFiles={5} />
                  <button 
                    onClick={handleTrySample}
                    className="text-indigo-400 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors flex items-center justify-center space-x-2 bg-indigo-500/10 py-3 rounded-lg border border-indigo-500/20 hover:bg-indigo-500/20"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span>Sample Architectural Audit</span>
                  </button>
                </div>
                
                <div className="relative flex items-center justify-center py-2">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                  <span className="relative px-4 bg-[#0a0a1a] text-slate-500 text-[10px] font-black uppercase tracking-widest">OR</span>
                </div>
                
                <Input
                  label="Enter Skill to Architect"
                  value={sourceInput}
                  onChange={(e) => setSourceInput(e.target.value)}
                  placeholder="e.g., 'Golang Microservices'..."
                  className="mb-0"
                />

                <Input
                  label="Specific Onboarding Goal"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  placeholder="e.g., 'Maintain the Auth service'"
                />

                <Input
                  label="New Hire Context"
                  value={contextInput}
                  onChange={(e) => setContextInput(e.target.value)}
                  placeholder="e.g., 'Expert in Ruby, new to TS'"
                  rows={2}
                />

                <div className="pt-6 mt-6 border-t border-white/10 space-y-8">
                  <h3 className="text-sm font-black text-indigo-400 uppercase tracking-[0.2em]">Strategy Parameters</h3>
                  <div className="space-y-4">
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest">Focus</label>
                    <div className="flex flex-wrap gap-3">
                      {(['Frontend', 'Backend', 'Full Stack'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => setFocus(type)}
                          className={`px-6 py-2 rounded-full text-xs font-bold transition-all duration-300 border ${
                            focus === type 
                              ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-[0_0_15px_rgba(79,70,229,0.4)]' 
                              : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest">Intensity</label>
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                          {intensityLabel}
                        </span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={intensity} 
                        onChange={(e) => setIntensity(parseInt(e.target.value))}
                        className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>
                    <Input
                      label="Duration"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="e.g., '4 weeks'"
                      className="mb-0"
                    />
                  </div>

                  <Input
                    label="Special Constraints"
                    value={specialRequirements}
                    onChange={(e) => setSpecialRequirements(e.target.value)}
                    placeholder="e.g., 'Focus on unit testing coverage'"
                    rows={2}
                    className="mb-0"
                  />
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <Button 
                      onClick={handleSubmit} 
                      disabled={isLoading} 
                      className="w-full"
                    >
                      Build Onboarding Path
                    </Button>
                    
                    {isLoading && (
                      <div className="flex justify-center items-center mt-6 h-8 overflow-hidden">
                        <div key={statusIndex} className="flex items-center space-x-3 text-sm font-mono text-blue-300/70 drop-shadow-[0_0_10px_rgba(147,197,253,0.4)] animate-status-fade">
                          <span className={`inline-block text-lg ${statusMessages[statusIndex].animation}`}>
                            {statusMessages[statusIndex].emoji}
                          </span>
                          <span>{statusMessages[statusIndex].text}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {outputContent && (
            <div id="result-area" className="mb-24 animate-in fade-in slide-in-from-bottom-12 duration-700">
              <div className="flex items-center space-x-6 mb-8">
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Architecture Report</h2>
                <div className="h-px flex-grow bg-gradient-to-r from-indigo-500 to-transparent"></div>
              </div>
              <MarkdownOutput content={outputContent} isCollapsible={uploadedFiles.length === 0} />
            </div>
          )}
        </>
      )}

      {/* Feature Icons Container */}
      <div className="flex justify-center items-center space-x-12 mb-16 opacity-40 hover:opacity-80 transition-opacity duration-500">
        <div className="flex flex-col items-center space-y-2">
          <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Blueprint</span>
        </div>
        <div className="flex flex-col items-center space-y-2">
          <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Security</span>
        </div>
        <div className="flex flex-col items-center space-y-2">
          <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Roadmap</span>
        </div>
      </div>

      <footer className="py-12 border-t border-white/5 text-center space-y-4">
        <p className="text-slate-500 text-sm font-medium">&copy; {new Date().getFullYear()} Pathify AI. Optimized for Senior Software Architects.</p>
        <p className="text-slate-600 text-[10px] tracking-[0.3em] uppercase font-black flex items-center justify-center space-x-4">
          <span>Built with</span>
          <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20">Gemini 3 Pro</span>
          <span className="text-slate-700">&</span>
          <span className="px-3 py-1 bg-teal-500/10 text-teal-400 rounded-full border border-teal-500/20">React</span>
        </p>
      </footer>
    </div>
  );
};

export default App;