import React, { useState, useEffect } from 'react';
import { Language, UserRole, HelpArticle, HelpCategoryId } from '../types';
import { helpCategories, helpArticles } from '../data/helpArticlesData';
import { generateUserManualPDF, openTamilBiometricGuidePrintWindow } from '../utils/helpPdfGenerator';
import { HelpMockup } from './HelpMockups';
import { OnboardingTour } from './OnboardingTour';
import { VisualTamilUserGuide } from './VisualTamilUserGuide';
import {
  Search,
  BookOpen,
  Download,
  Printer,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  X,
  ExternalLink,
  HelpCircle,
  Lightbulb,
  AlertTriangle,
  Info,
  CheckCircle2,
  Rocket,
  LayoutDashboard,
  Users,
  Clock,
  CalendarOff,
  Watch,
  Zap,
  Award,
  Calculator,
  ShieldCheck,
  Database,
  Fingerprint,
  FileSpreadsheet,
  Wrench,
  Globe,
  Share2,
  FileText,
  History,
  Image as ImageIcon
} from 'lucide-react';

interface HelpCenterProps {
  language: Language;
  role?: UserRole;
  initialArticleId?: string;
  initialCategoryId?: HelpCategoryId;
  isDrawerModal?: boolean;
  onClose?: () => void;
  onNavigateToModule?: (view: 'dashboard' | 'employees' | 'salary-schemes' | 'run-payroll' | 'epf-etf' | 'config') => void;
}

const iconMap: Record<string, React.ElementType> = {
  Rocket,
  LayoutDashboard,
  Users,
  Clock,
  CalendarOff,
  Watch,
  Zap,
  Award,
  Calculator,
  ShieldCheck,
  Printer,
  Database,
  Fingerprint,
  FileSpreadsheet,
  Wrench,
  HelpCircle
};

export const HelpCenter: React.FC<HelpCenterProps> = ({
  language: parentLanguage,
  role = 'admin',
  initialArticleId,
  initialCategoryId,
  isDrawerModal = false,
  onClose,
  onNavigateToModule
}) => {
  const [lang, setLang] = useState<Language>(parentLanguage);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<HelpCategoryId | null>(initialCategoryId || null);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(initialArticleId || null);
  const [showTour, setShowTour] = useState(false);
  const [recentArticleIds, setRecentArticleIds] = useState<string[]>([]);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [tabMode, setTabMode] = useState<'manual' | 'visual-tamil'>('visual-tamil');

  useEffect(() => {
    setLang(parentLanguage);
  }, [parentLanguage]);

  useEffect(() => {
    if (initialArticleId) {
      setSelectedArticleId(initialArticleId);
      setTabMode('manual');
      const art = helpArticles.find(a => a.id === initialArticleId);
      if (art) setSelectedCategoryId(art.categoryId);
    }
  }, [initialArticleId]);

  // Load recently viewed
  useEffect(() => {
    try {
      const stored = localStorage.getItem('nava_recent_help_articles');
      if (stored) {
        setRecentArticleIds(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const trackArticleView = (articleId: string) => {
    setSelectedArticleId(articleId);
    try {
      const updated = [articleId, ...recentArticleIds.filter(id => id !== articleId)].slice(0, 5);
      setRecentArticleIds(updated);
      localStorage.setItem('nava_recent_help_articles', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const selectedArticle = helpArticles.find(a => a.id === selectedArticleId);

  // Search filtering
  const filteredArticles = searchQuery.trim() === ''
    ? []
    : helpArticles.filter(article => {
        const query = searchQuery.toLowerCase();
        const titleEn = article.title.en.toLowerCase();
        const titleTa = article.title.ta.toLowerCase();
        const titleSi = article.title.si.toLowerCase();
        const summaryEn = article.summary.en.toLowerCase();
        const summaryTa = article.summary.ta.toLowerCase();
        const summarySi = article.summary.si.toLowerCase();
        const tags = [
          ...(article.tags.en || []),
          ...(article.tags.ta || []),
          ...(article.tags.si || [])
        ].map(t => t.toLowerCase());

        return (
          titleEn.includes(query) ||
          titleTa.includes(query) ||
          titleSi.includes(query) ||
          summaryEn.includes(query) ||
          summaryTa.includes(query) ||
          summarySi.includes(query) ||
          tags.some(t => t.includes(query))
        );
      });

  const handleDownloadManual = async (targetLang: Language) => {
    setGeneratingPdf(true);
    try {
      generateUserManualPDF(targetLang);
    } catch (e) {
      console.error(e);
      alert('Error generating PDF User Manual. Please check browser permissions.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handlePrintArticle = () => {
    window.print();
  };

  return (
    <div className={`help-center-root font-sans ${isDrawerModal ? 'fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex justify-end' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'}`}>
      
      {/* Container Box */}
      <div className={`bg-white ${isDrawerModal ? 'w-full max-w-4xl h-full shadow-2xl flex flex-col overflow-y-auto animate-in slide-in-from-right duration-200' : 'rounded-2xl border border-stone-200 shadow-xs overflow-hidden'}`}>
        
        {/* Top Vibrant Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 relative overflow-hidden border-b border-indigo-900/50">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center space-x-2.5 mb-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/80 px-2.5 py-0.5 rounded-full border border-indigo-800">
                  UFO Tech Solution • Enterprise Manual
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {lang === 'ta' ? 'உதவி மையம் & பயனர் கையேடு' : lang === 'si' ? 'උපකාරක මධ්‍යස්ථානය සහ පරිශීලක අත්පොත' : 'Help Center & Operations Manual'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-2xl">
                {lang === 'ta' 
                  ? 'நவா லேடி மனிதவள & சம்பள மென்பொருளுக்கான விரிவான தொழிற்பாட்டு வழிகாட்டி மற்றும் சட்டரீதியான ஆவணங்கள்.' 
                  : lang === 'si' 
                  ? 'නවා ලේඩි HRM සහ වැටුප් පද්ධතිය සඳහා වන සවිස්තරාත්මක මෙහෙයුම් අත්පොත.' 
                  : 'Official operations guide, statutory compliance workflows, and biometric hardware instructions.'}
              </p>
            </div>

            {/* Top Right Actions */}
            <div className="flex items-center flex-wrap gap-2">
              {/* Language Selector */}
              <div className="flex items-center bg-white/10 backdrop-blur-xs border border-white/20 rounded-xl p-1 text-xs">
                <Globe className="w-3.5 h-3.5 text-stone-300 ml-1.5" />
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value as Language)}
                  className="bg-transparent text-white font-medium focus:outline-hidden cursor-pointer px-2 py-1"
                >
                  <option value="en" className="text-stone-900">English (UK)</option>
                  <option value="ta" className="text-stone-900">தமிழ் (Sri Lanka)</option>
                  <option value="si" className="text-stone-900">සිංහල (Sri Lanka)</option>
                </select>
              </div>

              {/* Onboarding Tour Button */}
              <button
                onClick={() => setShowTour(true)}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-sm cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{lang === 'ta' ? 'வழிகாட்டல் சுழற்சி' : lang === 'si' ? 'මඟපෙන්වීම' : 'Interactive Tour'}</span>
              </button>

              {/* Close Button if in drawer modal */}
              {isDrawerModal && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                  title="Close Help Center"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Search Input Bar & Mode Selector */}
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-xl">
              <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (selectedArticleId && e.target.value.trim() !== '') {
                    setSelectedArticleId(null);
                  }
                  if (e.target.value.trim() !== '' && tabMode === 'visual-tamil') {
                    setTabMode('manual');
                  }
                }}
                placeholder={lang === 'ta' ? 'கேள்விகள் அல்லது தலைப்புகளைத் தேடுங்கள்...' : lang === 'si' ? 'ගැටළු හෝ මාතෘකා සොයන්න...' : 'Search articles, keywords (e.g. EPF, 25-Day Rule, Hikvision, Backup)...'}
                className="w-full pl-12 pr-10 py-3 rounded-xl bg-white/10 text-white placeholder-stone-400 border border-white/20 focus:outline-hidden focus:ring-2 focus:ring-indigo-400 focus:bg-white/20 text-sm transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center bg-black/30 p-1 rounded-xl border border-white/15 shrink-0">
              <button
                onClick={() => {
                  setTabMode('visual-tamil');
                  setSelectedArticleId(null);
                  setSearchQuery('');
                }}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  tabMode === 'visual-tamil'
                    ? 'bg-amber-400 text-slate-950 shadow-md ring-1 ring-amber-300'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-900" />
                <span>தமிழ் காட்சி வழிகாட்டி (7 பணிகள்)</span>
              </button>

              <button
                onClick={() => setTabMode('manual')}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  tabMode === 'manual'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>அனைத்து கட்டுரைகள் (16 Modules)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-6 sm:p-8 space-y-8">

          {/* VISUAL TAMIL USER GUIDE TAB */}
          {tabMode === 'visual-tamil' && searchQuery.trim() === '' && !selectedArticle && (
            <VisualTamilUserGuide 
              onNavigateToModule={onNavigateToModule}
              onClose={onClose}
            />
          )}

          {/* SEARCH RESULTS VIEW */}
          {searchQuery.trim() !== '' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-stone-900 flex items-center">
                  <Search className="w-4 h-4 text-indigo-600 mr-2" />
                  Search Results for "{searchQuery}" ({filteredArticles.length})
                </h3>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  Clear Search
                </button>
              </div>

              {filteredArticles.length === 0 ? (
                <div className="text-center py-12 bg-stone-50 rounded-2xl border border-stone-200">
                  <HelpCircle className="w-10 h-10 text-stone-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-stone-700">No matching articles found</p>
                  <p className="text-xs text-stone-500 mt-1">Try searching for keywords like "EPF", "Attendance", "25-Day", or "Biometric"</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredArticles.map(article => (
                    <div
                      key={article.id}
                      onClick={() => {
                        trackArticleView(article.id);
                        setSearchQuery('');
                      }}
                      className="bg-white border border-stone-200 hover:border-indigo-500 p-4 rounded-xl shadow-2xs hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${article.badgeColor}`}>
                            {article.readTimeMins} min read
                          </span>
                          <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-indigo-600 transition group-hover:translate-x-1" />
                        </div>
                        <h4 className="font-bold text-stone-900 text-sm group-hover:text-indigo-600 transition">
                          {article.title[lang] || article.title.en}
                        </h4>
                        <p className="text-xs text-stone-600 mt-1 line-clamp-2">
                          {article.summary[lang] || article.summary.en}
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-stone-100 flex flex-wrap gap-1">
                        {(article.tags[lang] || article.tags.en || []).slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="text-[9px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ARTICLE DETAIL VIEW */}
          {searchQuery.trim() === '' && selectedArticle && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Back to Categories Link */}
              <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                <button
                  onClick={() => setSelectedArticleId(null)}
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-stone-600 hover:text-indigo-600 transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{lang === 'ta' ? 'அனைத்து பிரிவுகளுக்கும் திரும்பு' : lang === 'si' ? 'සියලු මාතෘකා වෙත' : 'Back to All Categories'}</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePrintArticle}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-700 font-semibold text-xs transition cursor-pointer"
                    title="Print Article"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>

                  {selectedArticle.targetRoute && onNavigateToModule && (
                    <button
                      onClick={() => {
                        onNavigateToModule(selectedArticle.targetRoute!);
                        if (isDrawerModal && onClose) onClose();
                      }}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs cursor-pointer"
                    >
                      <span>Open Live Screen</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Article Header Card */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 relative overflow-hidden">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${selectedArticle.badgeColor}`}>
                    {selectedArticle.categoryId.toUpperCase()}
                  </span>
                  <span className="text-xs text-stone-500">
                    • {selectedArticle.readTimeMins} Min Read
                  </span>
                </div>

                <h1 className="text-2xl font-black text-stone-900 tracking-tight">
                  {selectedArticle.title[lang] || selectedArticle.title.en}
                </h1>
                <p className="text-sm text-stone-600 mt-2 leading-relaxed max-w-3xl">
                  {selectedArticle.summary[lang] || selectedArticle.summary.en}
                </p>
              </div>

              {/* Step-by-Step Instructions */}
              <div className="space-y-4">
                <h3 className="text-base font-extrabold text-stone-900 flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-2" />
                  {lang === 'ta' ? 'படிமுறை வழிகாட்டி' : lang === 'si' ? 'පියවරෙන් පියවර උපදෙස්' : 'Step-by-Step Operating Procedures'}
                </h3>

                <div className="space-y-4">
                  {selectedArticle.steps.map((step, idx) => (
                    <div key={idx} className="bg-white border border-stone-200 rounded-xl p-5 shadow-2xs">
                      <div className="flex items-start space-x-3.5">
                        <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                          {step.stepNumber}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-stone-900 text-sm">
                            {step.title[lang] || step.title.en}
                          </h4>
                          <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                            {step.description[lang] || step.description.en}
                          </p>

                          {/* Render Illustration Mockup */}
                          {step.illustrationType && (
                            <HelpMockup type={step.illustrationType} />
                          )}

                          {/* Step Callout */}
                          {step.callout && (
                            <div className={`mt-3 p-3 rounded-lg border text-xs flex items-start space-x-2 ${
                              step.callout.type === 'tip' 
                                ? 'bg-amber-50 border-amber-200 text-amber-900' 
                                : step.callout.type === 'warning'
                                ? 'bg-rose-50 border-rose-200 text-rose-900'
                                : 'bg-blue-50 border-blue-200 text-blue-900'
                            }`}>
                              <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                              <span>{step.callout.text[lang] || step.callout.text.en}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pro Tip Box */}
              {selectedArticle.proTip && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 flex items-start space-x-3.5 shadow-2xs">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                      {lang === 'ta' ? 'முக்கிய ஆலோசனை (Pro Tip)' : lang === 'si' ? 'විශේෂ උපදෙස (Pro Tip)' : 'Pro Tip & Best Practice'}
                    </h4>
                    <p className="text-xs text-amber-950 mt-1 font-medium leading-relaxed">
                      {selectedArticle.proTip[lang] || selectedArticle.proTip.en}
                    </p>
                  </div>
                </div>
              )}

              {/* Warning Box */}
              {selectedArticle.warning && (
                <div className="bg-gradient-to-r from-rose-50 to-red-50 border border-rose-200 rounded-2xl p-5 flex items-start space-x-3.5 shadow-2xs">
                  <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900">
                      {lang === 'ta' ? 'சட்டரீதியான எச்சரிக்கை (Critical Warning)' : lang === 'si' ? 'අනතුරු ඇඟවීම (Warning)' : 'Critical Statutory Warning'}
                    </h4>
                    <p className="text-xs text-rose-950 mt-1 font-medium leading-relaxed">
                      {selectedArticle.warning[lang] || selectedArticle.warning.en}
                    </p>
                  </div>
                </div>
              )}

              {/* FAQs Accordion */}
              {selectedArticle.faqs && selectedArticle.faqs.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-stone-200">
                  <h3 className="text-sm font-bold text-stone-900 flex items-center">
                    <HelpCircle className="w-4 h-4 text-indigo-600 mr-2" />
                    Frequently Asked Questions for this Topic
                  </h3>
                  <div className="space-y-2">
                    {selectedArticle.faqs.map((faq, idx) => (
                      <div key={idx} className="bg-stone-50 border border-stone-200 rounded-xl p-4">
                        <p className="text-xs font-bold text-stone-900">
                          Q: {faq.question[lang] || faq.question.en}
                        </p>
                        <p className="text-xs text-stone-600 mt-1 pl-4 border-l-2 border-indigo-500">
                          {faq.answer[lang] || faq.answer.en}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* MAIN CATEGORIES GRID (When no article is selected and in manual mode) */}
          {tabMode === 'manual' && searchQuery.trim() === '' && !selectedArticle && (
            <div className="space-y-8">
              
              {/* Recently Viewed Strip */}
              {recentArticleIds.length > 0 && (
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4">
                  <div className="flex items-center space-x-2 text-xs font-bold text-stone-700 mb-2">
                    <History className="w-3.5 h-3.5 text-stone-500" />
                    <span>{lang === 'ta' ? 'அண்மையில் பார்த்தவை' : lang === 'si' ? 'මෑතකදී බැලූ මාතෘකා' : 'Recently Viewed Topics'}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentArticleIds.map(id => {
                      const art = helpArticles.find(a => a.id === id);
                      if (!art) return null;
                      return (
                        <button
                          key={id}
                          onClick={() => trackArticleView(id)}
                          className="text-xs font-semibold bg-white hover:bg-indigo-50 text-stone-800 hover:text-indigo-700 px-3 py-1.5 rounded-lg border border-stone-200 transition flex items-center space-x-1 cursor-pointer shadow-2xs"
                        >
                          <FileText className="w-3 h-3 text-indigo-500" />
                          <span>{art.title[lang] || art.title.en}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 16 Category Cards Grid */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-extrabold text-stone-900 tracking-tight">
                    {lang === 'ta' ? 'அனைத்து பிரிவுகள் (16 பிரிவுகள்)' : lang === 'si' ? 'සියලුම මාතෘකා (16ක්)' : 'Help Categories (16 Core Modules)'}
                  </h3>
                  <span className="text-xs text-stone-500 font-medium">
                    Commercial Release v4.8.2
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {helpCategories.map((category) => {
                    const IconComponent = iconMap[category.iconName] || BookOpen;
                    const catArticleCount = helpArticles.filter(a => a.categoryId === category.id).length;

                    return (
                      <div
                        key={category.id}
                        onClick={() => {
                          const firstArt = helpArticles.find(a => a.categoryId === category.id);
                          if (firstArt) {
                            trackArticleView(firstArt.id);
                          }
                        }}
                        className="bg-white border border-stone-200 hover:border-indigo-400 p-5 rounded-2xl shadow-2xs hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${category.colorClass} flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
                              <IconComponent className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                              {catArticleCount} {catArticleCount === 1 ? 'Article' : 'Articles'}
                            </span>
                          </div>

                          <h4 className="font-bold text-stone-900 text-sm group-hover:text-indigo-600 transition">
                            {category.title[lang] || category.title.en}
                          </h4>
                          <p className="text-xs text-stone-500 mt-1.5 line-clamp-2 leading-relaxed">
                            {category.description[lang] || category.description.en}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-indigo-600 group-hover:text-indigo-700">
                          <span>{lang === 'ta' ? 'படிக்க' : lang === 'si' ? 'කියවන්න' : 'Explore'}</span>
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* PDF Manual Download Card */}
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div className="max-w-xl">
                    <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold mb-3 border border-indigo-400/30">
                      <Download className="w-3.5 h-3.5" />
                      <span>Downloadable Comprehensive User Manual</span>
                    </div>
                    <h3 className="text-xl font-extrabold tracking-tight">
                      {lang === 'ta' ? 'முழுமையான PDF கையேட்டைப் பதிவிறக்கவும்' : lang === 'si' ? 'සම්පූර්ණ PDF අත්පොත බාගත කරන්න' : 'Download Complete Operations Manual (PDF)'}
                    </h3>
                    <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                      {lang === 'ta'
                        ? '30+ பக்கங்கள் கொண்ட நிறுவன முத்திரையிடப்பட்ட உத்தியோகபூர்வ கையேடு (தமிழ், சிங்களம் அல்லது ஆங்கிலத்தில்).'
                        : lang === 'si'
                        ? 'පිටු 30+ කින් සමන්විත ආයතනික නිල අත්පොත (සිංහල, දෙමළ හෝ ඉංග්‍රීසි භාෂාවෙන්).'
                        : 'Official 30+ page manual formatted with cover page, table of contents, step-by-step screenshots, and statutory compliance references.'}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                    <button
                      onClick={openTamilBiometricGuidePrintWindow}
                      className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition shadow-md flex items-center justify-center space-x-1.5 cursor-pointer"
                      title="Hikvision கைரேகை இயந்திர இணைப்பு கையேடு PDF"
                    >
                      <Fingerprint className="w-3.5 h-3.5" />
                      <span>கைரேகை PDF வழிகாட்டி</span>
                    </button>

                    <button
                      onClick={() => handleDownloadManual('en')}
                      disabled={generatingPdf}
                      className="px-4 py-2.5 rounded-xl bg-white hover:bg-stone-100 text-slate-900 font-bold text-xs transition shadow-md flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-600" />
                      <span>English Manual</span>
                    </button>

                    <button
                      onClick={() => handleDownloadManual('ta')}
                      disabled={generatingPdf}
                      className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-md flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>தமிழ் கையேடு</span>
                    </button>

                    <button
                      onClick={() => handleDownloadManual('si')}
                      disabled={generatingPdf}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>සිංහල අත්පොත</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Commercial Support & Helpdesk Card */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-stone-900">
                    Need Dedicated Technical Support?
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    UFO Tech Solution enterprise engineers provide on-site biometric terminal configuration and training.
                  </p>
                </div>
                <div className="flex items-center space-x-3 text-xs font-semibold text-stone-700">
                  <span className="bg-white px-3 py-1.5 rounded-lg border border-stone-200 shadow-2xs font-mono">
                    Hotline: +94 (11) 234-5678
                  </span>
                  <span className="bg-white px-3 py-1.5 rounded-lg border border-stone-200 shadow-2xs">
                    support@ufotech.lk
                  </span>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* Interactive Onboarding Tour Modal */}
      <OnboardingTour
        language={lang}
        isOpen={showTour}
        onClose={() => setShowTour(false)}
        onNavigateToModule={onNavigateToModule}
      />

    </div>
  );
};
