import React, { useState, useEffect, useCallback } from 'react';
import { Language, UserRole } from './types';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { EmployeeModule } from './components/EmployeeModule';
import { SalarySchemeModule } from './components/SalarySchemeModule';
import { RunPayroll } from './components/RunPayroll';
import { EPFETFBalance } from './components/EPFETFBalance';
import { ConfigurationModule } from './components/ConfigurationModule';
import { HelpCenter } from './components/HelpCenter';
import { HelpFloatingButton } from './components/HelpFloatingButton';

export type AppView = 'dashboard' | 'employees' | 'salary-schemes' | 'run-payroll' | 'epf-etf' | 'config' | 'help';

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [role, setRole] = useState<UserRole>('admin');
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [helpDrawerOpen, setHelpDrawerOpen] = useState(false);
  const [contextArticleId, setContextArticleId] = useState<string | undefined>(undefined);

  const [currentUserId, setCurrentUserId] = useState<string>('u-admin');
  const [stats, setStats] = useState({
    employeeCount: 3,
    lastPayrollNet: 145000,
    epfTotal: 28500,
    etfTotal: 10500
  });

  useEffect(() => {
    fetchStats();
  }, []);

  // Map route to relevant context article for F1 & Quick Help
  const getContextualArticleId = useCallback((view: AppView): string => {
    switch (view) {
      case 'employees':
        return 'employee-management';
      case 'salary-schemes':
        return 'special-25-day-rule';
      case 'run-payroll':
        return 'payroll-engine-workflow';
      case 'epf-etf':
        return 'epf-etf-management';
      case 'config':
        return 'backup-restore-guide';
      case 'dashboard':
      default:
        return 'dashboard-guide';
    }
  }, []);

  // Keyboard listener (e.g. Escape to close modal drawers)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && helpDrawerOpen) {
        setHelpDrawerOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [helpDrawerOpen]);

  const fetchStats = async () => {
    try {
      const empRes = await fetch('/api/employees');
      const employees = await empRes.json();

      const runRes = await fetch('/api/payroll-runs/2026-08');
      const payrollData = await runRes.json();

      const empCount = Array.isArray(employees) ? employees.length : 0;
      const run = payrollData?.run;

      setStats({
        employeeCount: empCount,
        lastPayrollNet: run?.total_net || run?.total_net_pay || 0,
        epfTotal: (run?.total_epf_employee || 0) + (run?.total_epf_employer || 0),
        etfTotal: run?.total_etf_employer || 0
      });
    } catch (err) {
      console.error("Error fetching stats in App:", err);
    }
  };

  const handleOpenHelp = () => {
    const targetArticle = getContextualArticleId(currentView);
    setContextArticleId(targetArticle);
    setHelpDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 font-sans selection:bg-emerald-500 selection:text-white pb-12">
      <Navbar
        language={language}
        setLanguage={setLanguage}
        role={role}
        setRole={setRole}
        onNavigate={(view) => {
          setCurrentView(view);
          if (view === 'help') {
            setHelpDrawerOpen(false);
          }
        }}
        currentView={currentView}
      />

      <main>
        {currentView === 'dashboard' && (
          <Dashboard
            language={language}
            onNavigate={setCurrentView}
            stats={stats}
            role={role}
          />
        )}
        {currentView === 'employees' && (
          <EmployeeModule language={language} />
        )}
        {currentView === 'salary-schemes' && (
          <SalarySchemeModule language={language} />
        )}
        {currentView === 'run-payroll' && (
          <RunPayroll language={language} />
        )}
        {currentView === 'epf-etf' && (
          <EPFETFBalance language={language} />
        )}
        {currentView === 'config' && (
          <ConfigurationModule
            language={language}
            role={role}
            currentUserId={currentUserId}
            onUserSwitch={(updatedUser) => {
              if (updatedUser.role) setRole(updatedUser.role);
              if (updatedUser.id) setCurrentUserId(updatedUser.id);
            }}
          />
        )}
        {currentView === 'help' && (
          <HelpCenter
            language={language}
            role={role}
            onNavigateToModule={(v) => setCurrentView(v)}
          />
        )}
      </main>

      {/* Persistent Floating Quick Help Button (shows on all views except full help view) */}
      {currentView !== 'help' && (
        <HelpFloatingButton
          language={language}
          onClick={handleOpenHelp}
        />
      )}

      {/* Context-Sensitive Modal Drawer when triggered via F1 or Floating Button */}
      {helpDrawerOpen && (
        <HelpCenter
          language={language}
          role={role}
          initialArticleId={contextArticleId}
          isDrawerModal={true}
          onClose={() => setHelpDrawerOpen(false)}
          onNavigateToModule={(view) => {
            setHelpDrawerOpen(false);
            setCurrentView(view);
          }}
        />
      )}
    </div>
  );
}
