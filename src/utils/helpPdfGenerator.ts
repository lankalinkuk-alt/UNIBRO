import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Language } from '../types';
import { helpArticles, helpCategories } from '../data/helpArticlesData';

export const generateUserManualPDF = (language: Language = 'en') => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const labels = {
    en: {
      docTitle: 'HRM & PAYROLL SYSTEM',
      docSubtitle: 'Complete Commercial Operations Manual & Statutory Compliance Guide',
      company: 'UFO Tech Solution',
      client: 'UNIBRO SMART APPARELS (PVT) LTD',
      version: 'Enterprise Edition v4.8.2',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
      toc: 'TABLE OF CONTENTS',
      chapter: 'CHAPTER',
      stepsTitle: 'Standard Operating Procedures & Steps',
      tipsTitle: 'Pro Tips & Best Practices',
      warningsTitle: 'Statutory Warnings & Audit Notes',
      troubleshootingTitle: 'Troubleshooting & Resolution Matrix',
      footer: 'UFO Tech Solution • UNIBRO SMART APPARELS HRM & Payroll Manual',
      page: 'Page'
    },
    ta: {
      docTitle: 'மனிதவள & சம்பள முகாமைத்துவ கையேடு',
      docSubtitle: 'முழுமையான வணிக வழிகாட்டி & சட்டரீதியான ஆவணம்',
      company: 'UFO Tech Solution',
      client: 'UNIBRO SMART APPARELS (பிரைவேட்) லிமிடெட்',
      version: 'பதிப்பு 4.8.2',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
      toc: 'பொருளடக்கம்',
      chapter: 'அத்தியாயம்',
      stepsTitle: 'படிமுறை வழிகாட்டி & நெறிமுறைகள்',
      tipsTitle: 'முக்கிய ஆலோசனைகள்',
      warningsTitle: 'சட்டரீதியான எச்சரிக்கைகள்',
      troubleshootingTitle: 'பிரச்சினை தீர்க்கும் வழிகாட்டி',
      footer: 'UFO Tech Solution • UNIBRO HRM மற்றும் சம்பள வழிகாட்டி',
      page: 'பக்கம்'
    },
    si: {
      docTitle: 'මානව සම්පත් සහ වැටුප් කළමනාකරණ අත්පොත',
      docSubtitle: 'සම්පූර්ණ මෙහෙයුම් මාර්ගෝපදේශය සහ නීතිමය ලියවිල්ල',
      company: 'UFO Tech Solution',
      client: 'UNIBRO SMART APPARELS පුද්ගලික සමාගම',
      version: 'සංස්කරණය 4.8.2',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
      toc: 'පටුන',
      chapter: 'පරිච්ඡේදය',
      stepsTitle: 'ක්‍රියා පටිපාටිය සහ පියවර',
      tipsTitle: 'වැදගත් උපදෙස්',
      warningsTitle: 'ව්‍යවස්ථාපිත අනතුරු ඇඟවීම්',
      troubleshootingTitle: 'දෝෂ නිරාකරණ මාර්ගෝපදේශය',
      footer: 'UFO Tech Solution • HRM & වැටුප් පද්ධති අත්පොත',
      page: 'පිටුව'
    }
  };

  const l = labels[language] || labels.en;

  // ==========================================
  // PAGE 1: COVER PAGE
  // ==========================================
  
  // Top Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 90, 'F');

  // Accent Line
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(0, 88, pageWidth, 4, 'F');

  // Logo / System Header
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.text(l.company.toUpperCase(), 20, 35);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(56, 189, 248); // sky-400
  doc.text('INDUSTRIAL WORKFORCE & STATUTORY PAYROLL SUITE', 20, 45);

  doc.setTextColor(203, 213, 225);
  doc.setFontSize(10);
  doc.text(`Designed for: ${l.client}`, 20, 55);
  doc.text(`Documentation Language: ${language.toUpperCase()} • Sri Lanka Edition`, 20, 62);

  // Main Cover Title Box
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(l.docTitle, 20, 115);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(71, 85, 105);
  doc.text(l.docSubtitle, 20, 125);

  // Compliance Highlight Box
  doc.setFillColor(240, 253, 244); // emerald-50
  doc.setDrawColor(187, 247, 208); // emerald-200
  doc.roundedRect(20, 140, pageWidth - 40, 45, 3, 3, 'FD');

  doc.setTextColor(6, 95, 70); // emerald-800
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('CERTIFIED SRI LANKAN STATUTORY COMPLIANCE', 28, 150);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text('• Sri Lankan Shop & Office Employees Act No. 19 of 1954 (and amendments)', 28, 158);
  doc.text('• Employees\' Provident Fund (EPF) Act No. 15 of 1958 (8% Employee / 12% Employer)', 28, 165);
  doc.text('• Employees\' Trust Fund (ETF) Act No. 46 of 1980 (3% Employer Contribution)', 28, 172);

  // Metadata Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(20, 195, pageWidth - 40, 50, 3, 3, 'FD');

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(9);
  doc.text('SOFTWARE VERSION:', 28, 207);
  doc.text('RELEASE DATE:', 28, 217);
  doc.text('HARDWARE CERTIFICATION:', 28, 227);
  doc.text('SUPPORT HELPDESK:', 28, 237);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(l.version, 85, 207);
  doc.text(l.date, 85, 217);
  doc.text('Hikvision DS-K1A8503MF (ISAPI Digest Protocol)', 85, 227);
  doc.text('UFO Tech Solution 24/7 Enterprise Hotline', 85, 237);

  // Cover Page Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('CONFIDENTIAL & PROPRIETARY — FOR AUTHORIZED FACTORY ADMINISTRATION USE ONLY', pageWidth / 2, 280, { align: 'center' });

  // ==========================================
  // PAGE 2: TABLE OF CONTENTS
  // ==========================================
  doc.addPage();

  doc.setFillColor(241, 245, 249);
  doc.rect(0, 0, pageWidth, 25, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(l.toc, 20, 17);

  const tocRows = helpCategories.map((cat, idx) => [
    `#${idx + 1}`,
    cat.title[language] || cat.title.en,
    cat.description[language] || cat.description.en,
    `Ch. ${idx + 1}`
  ]);

  autoTable(doc, {
    startY: 32,
    head: [['Ref', 'Module / Category', 'Summary Scope', 'Section']],
    body: tocRows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 41, 59]
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    margin: { left: 20, right: 20 }
  });

  // ==========================================
  // CHAPTER PAGES (Detailed articles per category)
  // ==========================================
  helpCategories.forEach((cat, catIdx) => {
    doc.addPage();

    // Chapter Header Banner
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, pageWidth, 26, 'F');

    doc.setFillColor(16, 185, 129); // emerald marker
    doc.rect(0, 0, 6, 26, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`${l.chapter} ${catIdx + 1}: ${cat.title[language] || cat.title.en}`, 15, 17);

    // Chapter Description Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(20, 32, pageWidth - 40, 18, 2, 2, 'FD');

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(cat.description[language] || cat.description.en, 25, 43);

    // Find all articles in this category
    const catArticles = helpArticles.filter(a => a.categoryId === cat.id);

    let currentY = 56;

    if (catArticles.length === 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text('Refer to the online Help Center for additional dynamic sub-topics.', 20, currentY);
    } else {
      catArticles.forEach((article) => {
        // Article Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42);
        doc.text(article.title[language] || article.title.en, 20, currentY);
        currentY += 6;

        // Article Summary
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        const splitSummary = doc.splitTextToSize(article.summary[language] || article.summary.en, pageWidth - 40);
        doc.text(splitSummary, 20, currentY);
        currentY += splitSummary.length * 4 + 4;

        // Steps Table
        if (article.steps && article.steps.length > 0) {
          const stepRows = article.steps.map(s => [
            `Step ${s.stepNumber}`,
            s.title[language] || s.title.en,
            s.description[language] || s.description.en
          ]);

          autoTable(doc, {
            startY: currentY,
            head: [['Step #', 'Operation', 'Standard Procedure']],
            body: stepRows,
            theme: 'striped',
            headStyles: {
              fillColor: [51, 65, 85],
              textColor: [255, 255, 255],
              fontSize: 8.5
            },
            bodyStyles: {
              fontSize: 8,
              textColor: [30, 41, 59]
            },
            margin: { left: 20, right: 20 },
            columnStyles: {
              0: { cellWidth: 20 },
              1: { cellWidth: 45 },
              2: { cellWidth: 'auto' }
            }
          });

          const lastTable = (doc as any).lastAutoTable;
          currentY = lastTable ? lastTable.finalY + 8 : currentY + 30;
        }

        // Pro Tip Box
        if (article.proTip && currentY < pageHeight - 45) {
          doc.setFillColor(254, 243, 199); // amber-100
          doc.setDrawColor(251, 191, 36); // amber-400
          doc.roundedRect(20, currentY, pageWidth - 40, 16, 2, 2, 'FD');

          doc.setTextColor(146, 64, 14); // amber-800
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.text('PRO TIP & BEST PRACTICE:', 25, currentY + 6);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          const splitTip = doc.splitTextToSize(article.proTip[language] || article.proTip.en, pageWidth - 55);
          doc.text(splitTip, 25, currentY + 11);
          currentY += 22;
        }

        // Warning Box
        if (article.warning && currentY < pageHeight - 45) {
          doc.setFillColor(254, 226, 226); // red-100
          doc.setDrawColor(248, 113, 113); // red-400
          doc.roundedRect(20, currentY, pageWidth - 40, 16, 2, 2, 'FD');

          doc.setTextColor(153, 27, 27); // red-800
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.text('CRITICAL STATUTORY WARNING:', 25, currentY + 6);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          const splitWarn = doc.splitTextToSize(article.warning[language] || article.warning.en, pageWidth - 55);
          doc.text(splitWarn, 25, currentY + 11);
          currentY += 22;
        }
      });
    }
  });

  // ==========================================
  // ADD PAGE NUMBERS & RUNNING HEADERS
  // ==========================================
  const totalPages = doc.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);

    // Header
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(l.footer, 20, 8);
    doc.text(`UFO TECH SOLUTION • ${l.version}`, pageWidth - 20, 8, { align: 'right' });

    doc.setDrawColor(226, 232, 240);
    doc.line(20, 10, pageWidth - 20, 10);

    // Footer
    doc.line(20, pageHeight - 12, pageWidth - 20, pageHeight - 12);
    doc.text('CONFIDENTIAL • UNIBRO SMART APPARELS - HRM System', 20, pageHeight - 7);
    doc.text(`${l.page} ${i} of ${totalPages}`, pageWidth - 20, pageHeight - 7, { align: 'right' });
  }

  // Save the PDF
  const filename = `UNIBRO-SMART-APPARELS-HRM-Manual-${language.toUpperCase()}-v4.8.2.pdf`;
  doc.save(filename);
};

export const openTamilBiometricGuidePrintWindow = () => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to open the Tamil Biometric Connection Guide.');
    return;
  }

  const html = `<!DOCTYPE html>
<html lang="ta">
<head>
  <meta charset="UTF-8">
  <title>Hikvision கைரேகை இயந்திர இணைப்பு கையேடு - UNIBRO SMART APPARELS</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Mukta+Malar:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Mukta Malar', 'Plus Jakarta Sans', sans-serif;
      background-color: #f8fafc;
      color: #1e293b;
      padding: 24px;
      line-height: 1.6;
    }
    .page-container {
      max-width: 900px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 16px;
      padding: 36px 44px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);
    }
    .header-banner {
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
      color: #ffffff;
      padding: 24px 30px;
      border-radius: 12px;
      margin-bottom: 28px;
      border-bottom: 4px solid #10b981;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      background: #10b981;
      color: #ffffff;
      font-size: 11px;
      font-weight: 700;
      border-radius: 20px;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    h1 {
      font-size: 22px;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 6px;
      line-height: 1.3;
    }
    .subtitle {
      font-size: 13px;
      color: #94a3b8;
    }
    .section-title {
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
      border-left: 4px solid #4f46e5;
      padding-left: 12px;
      margin-top: 28px;
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .step-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 18px 20px;
      margin-bottom: 16px;
      position: relative;
    }
    .step-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }
    .step-num {
      width: 28px;
      height: 28px;
      background: #4f46e5;
      color: #ffffff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 13px;
      flex-shrink: 0;
    }
    .step-title {
      font-size: 15px;
      font-weight: 700;
      color: #1e1b4b;
    }
    .step-body {
      font-size: 13px;
      color: #334155;
      margin-left: 40px;
    }
    .code-box {
      background: #0f172a;
      color: #38bdf8;
      font-family: monospace;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 12px;
      margin-top: 8px;
      display: inline-block;
    }
    .info-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      font-size: 12.5px;
    }
    .info-table th {
      background: #f1f5f9;
      color: #334155;
      padding: 8px 12px;
      text-align: left;
      font-weight: 700;
      border: 1px solid #cbd5e1;
    }
    .info-table td {
      padding: 8px 12px;
      border: 1px solid #e2e8f0;
      color: #1e293b;
    }
    .pro-tip {
      background: #fefce8;
      border: 1px solid #fde047;
      border-radius: 10px;
      padding: 14px 18px;
      color: #854d0e;
      font-size: 12.5px;
      margin: 18px 0;
    }
    .warning-box {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 10px;
      padding: 14px 18px;
      color: #991b1b;
      font-size: 12.5px;
      margin: 18px 0;
    }
    .btn-bar {
      margin-bottom: 20px;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
    .btn-action {
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      border: none;
      transition: 0.2s;
    }
    .btn-print {
      background: #059669;
      color: #ffffff;
    }
    .btn-print:hover {
      background: #047857;
    }
    .btn-close {
      background: #64748b;
      color: #ffffff;
    }
    .footer {
      margin-top: 30px;
      border-top: 1px solid #e2e8f0;
      padding-top: 14px;
      display: flex;
      justify-content: space-between;
      color: #64748b;
      font-size: 11px;
    }
    @media print {
      body {
        padding: 0;
        background: #ffffff;
      }
      .page-container {
        border: none;
        padding: 10px;
        box-shadow: none;
        max-width: 100%;
      }
      .no-print {
        display: none !important;
      }
      .step-card {
        break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="no-print btn-bar">
    <button class="btn-action btn-print" onclick="window.print()">🖨️ Print / Save as PDF (அச்சிடு / PDF சேமி)</button>
    <button class="btn-action btn-close" onclick="window.close()">மூடு (Close)</button>
  </div>

  <div class="page-container">
    <div class="header-banner">
      <span class="badge">ஹார்ட்வேர் இணைப்பு வழிகாட்டி</span>
      <h1>ஹிக்விஷன் (Hikvision DS-K1A8503MF) கைரேகை இயந்திர இணைப்பு கையேடு</h1>
      <p class="subtitle">UNIBRO SMART APPARELS (PVT) LTD • HRM & Attendance Synchronization Standard Operating Procedure</p>
    </div>

    <div class="section-title">
      <span>1. வன்பொருள் & நெட்வொர்க் அமைப்பு (Hardware & LAN Setup)</span>
    </div>
    
    <div class="step-card">
      <div class="step-header">
        <div class="step-num">1</div>
        <div class="step-title">LAN கேபிள் இணைப்பு (Ethernet Cable Connection)</div>
      </div>
      <div class="step-body">
        <p>Hikvision DS-K1A8503MF கைரேகை இயந்திரத்தின் பின்புறம் உள்ள <strong>RJ-45 LAN Port</strong> இல் Cat-6 ஈத்தர்நெட் கேபிளை இணைக்கவும். மற்றொரு முனையை தொழிற்சாலை <strong>Router / Switch</strong> அல்லது வரவேற்பு கணினியுடன் இணைக்கவும்.</p>
        <div class="code-box">இயந்திர இயல்புநிலை போர்ட் (Port): 80 (HTTP ISAPI) | 12V 1.5A DC Power</div>
      </div>
    </div>

    <div class="step-card">
      <div class="step-header">
        <div class="step-num">2</div>
        <div class="step-title">கைரேகை இயந்திரத்தில் Static IP முகவரியை அமைத்தல்</div>
      </div>
      <div class="step-body">
        <p>இயந்திரத்தின் மெனு பொத்தானை அழுத்தி நிர்வாகி கடவுச்சொல் மூலம் நுழையவும்:</p>
        <p style="margin-top:6px;"><strong>Menu ➔ Comm. (தொடர்பு) ➔ Network (பிணையம்) ➔ TCP/IP</strong></p>
        <table class="info-table">
          <tr>
            <th>அமைப்பு (Parameter)</th>
            <th>பரிந்துரைக்கப்படும் மதிப்பு (Recommended Value)</th>
          </tr>
          <tr>
            <td>DHCP</td>
            <td><strong>Disabled (முடக்கப்பட்டுள்ளது)</strong> - Static IP கட்டாயம்</td>
          </tr>
          <tr>
            <td>IP Address</td>
            <td><strong>192.168.1.201</strong> (தொழிற்சாலை LAN எல்லைக்குள்)</td>
          </tr>
          <tr>
            <td>Subnet Mask</td>
            <td><strong>255.255.255.0</strong></td>
          </tr>
          <tr>
            <td>Default Gateway</td>
            <td><strong>192.168.1.1</strong></td>
          </tr>
          <tr>
            <td>Server Port</td>
            <td><strong>80</strong></td>
          </tr>
        </table>
      </div>
    </div>

    <div class="section-title">
      <span>2. UNIBRO HRM மென்பொருளில் இயந்திரத்தை இணைத்தல் (HRM System Setup)</span>
    </div>

    <div class="step-card">
      <div class="step-header">
        <div class="step-num">3</div>
        <div class="step-title">HRM மென்பொருளில் சாதனத்தை பதிவு செய்தல் (Add Device)</div>
      </div>
      <div class="step-body">
        <p>1. UNIBRO HRM இல் <strong>Configuration (கட்டமைப்பு) ➔ Biometric Devices (கைரேகை சாதனங்கள்)</strong> பகுதிக்குச் செல்லவும்.</p>
        <p>2. <strong>"Add Device" (சாதனம் சேர்)</strong> பொத்தானை அழுத்தவும்.</p>
        <p>3. பின்வரும் விபரங்களை உள்ளிடவும்:</p>
        <ul style="margin-left: 20px; margin-top: 6px;">
          <li><strong>Device Name:</strong> Factory Main Entrance - DS-K1A8503MF</li>
          <li><strong>Brand / Model:</strong> Hikvision / DS-K1A8503MF</li>
          <li><strong>IP Address:</strong> 192.168.1.201</li>
          <li><strong>Port:</strong> 80</li>
          <li><strong>Username:</strong> admin</li>
          <li><strong>Password:</strong> இயந்திரத்தின் நிர்வாகி கடவுச்சொல் (எ.கா: Password123#)</li>
          <li><strong>Time Zone:</strong> Asia/Colombo (UTC+05:30)</li>
        </ul>
        <p style="margin-top:8px;">4. <strong>"Test Connection" (இணைப்பை பரிசோதி)</strong> பொத்தானை அழுத்தி <em>"Terminal Online (Ping OK)"</em> என்று வருகிறதா என சரிபார்க்கவும்.</p>
      </div>
    </div>

    <div class="step-card">
      <div class="step-header">
        <div class="step-num">4</div>
        <div class="step-title">ஊழியர் கைரேகை ID பொருத்துதல் (Employee ID Mapping)</div>
      </div>
      <div class="step-body">
        <p>1. இயந்திரத்தில் ஊழியரின் கைரேகையை பதிவு செய்யும் போது அவருக்கு ஒரு <strong>User ID</strong> (எ.கா: 101, 102, 103) வழங்கப்படும்.</p>
        <p>2. HRM இல் <strong>"Employee Mapping" (ஊழியர் பொருத்துதல்)</strong> பகுதிக்குச் செல்லவும்.</p>
        <p>3. <strong>"Auto-Match by Employee Number"</strong> பொத்தானை அழுத்தினால் ஊழியரின் EMP ID தானாக இயந்திர User ID உடன் இணைக்கப்படும்.</p>
        <p>4. தேவைப்படின் <strong>"Map Employee"</strong> மூலம் கைமுறையாகவும் பொருத்தலாம்.</p>
      </div>
    </div>

    <div class="section-title">
      <span>3. வருகை பதிவை பெறுதல் & சம்பளத்தில் சேர்த்தல் (Attendance Sync Workflow)</span>
    </div>

    <div class="step-card">
      <div class="step-header">
        <div class="step-num">5</div>
        <div class="step-title">ஒரே கிளிக்கில் வருகை ஒத்திசைவு (One-Click Sync)</div>
      </div>
      <div class="step-body">
        <p>1. முகப்பு பக்கத்தில் (Dashboard) அல்லது Biometric பகுதியில் உள்ள பச்சை நிற <strong>"Sync Punch Logs"</strong> பொத்தானை அழுத்தவும்.</p>
        <p>2. இயந்திரத்தில் பதிவான ஊழியர்களின் விரல் பதிவுகள் (In Time, Out Time) நொடிகளில் கணினிக்கு மாற்றப்படும்.</p>
        <p>3. <strong>"Process Today's Attendance"</strong> அழுத்தினால் காலை 8:30 தாமத நேரம் (Grace Period), மேலதிக நேரம் (OT) மற்றும் 25-நாள் வருகை தானாக கணக்கிடப்படும்.</p>
      </div>
    </div>

    <div class="pro-tip">
      <strong>💡 முக்கிய தகவல் (Pro Tip):</strong> ஒவ்வொரு கைரேகை பஞ்சிலும் <strong>SHA-256 தனித்துவ குறியீடு</strong> (Hash) உள்ளதால் ஒரு நாளைக்கு எத்தனை முறை Sync செய்தாலும் இரட்டைப் பதிவுகள் (Duplicates) ஒருபோதும் உருவாகாது.
    </div>

    <div class="warning-box">
      <strong>⚠️ சட்டரீதியான எச்சரிக்கை (Statutory Warning):</strong> Hikvision இயந்திரத்தின் கடிகார நேரம் இலங்கை நேரத்துடன் (<strong>GMT+5:30 Asia/Colombo</strong>) மிகச் சரியாக இருப்பதை உறுதி செய்யவும். தவறான நேரம் இருந்தால் ஊழியரின் OT மற்றும் தாமத கணக்கீடு பாதிக்கப்படும்.
    </div>

    <div class="section-title">
      <span>4. பிழைத்திருத்த வழிகாட்டி (Troubleshooting Matrix)</span>
    </div>

    <table class="info-table" style="margin-bottom: 20px;">
      <thead>
        <tr>
          <th>பிரச்சினை (Issue)</th>
          <th>காரணம் (Cause)</th>
          <th>தீர்வு (Resolution)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Connection Timeout / Offline</strong></td>
          <td>IP முகவரி பொருந்தவில்லை அல்லது LAN கேபிள் துண்டிக்கப்பட்டுள்ளது</td>
          <td>Router மற்றும் கேபிளை சரிபார்க்கவும். இயந்திரத்தின் IP (192.168.1.201) ஐ கணினியிலிருந்து Ping செய்து பார்க்கவும்.</td>
        </tr>
        <tr>
          <td><strong>401 Unauthorized Error</strong></td>
          <td>தவறான Username அல்லது Password</td>
          <td>இயந்திரத்தின் சரியான admin கடவுச்சொல்லை HRM சாதன அமைப்பில் உள்ளிடவும்.</td>
        </tr>
        <tr>
          <td><strong>Logs Not Syncing</strong></td>
          <td>ஊழியர் ID மேப்பிங் செய்யப்படவில்லை</td>
          <td>Employee Mapping தாவலுக்கு சென்று Auto-Match அழுத்தவும்.</td>
        </tr>
        <tr>
          <td><strong>இணையம் இல்லை (No Internet)</strong></td>
          <td>தொழிற்சாலை இணைய துண்டிப்பு</td>
          <td>விண்டோஸ் சேவை (Windows Sync Client) பதிவுகளை கணினியில் பாதுகாப்பாக சேமித்து வைத்து இணையம் வந்தவுடன் பதிவேற்றும்.</td>
        </tr>
      </tbody>
    </table>

    <div class="footer">
      <span>UNIBRO SMART APPARELS (PVT) LTD • HRM Documentation</span>
      <span>UFO Tech Solution 24/7 Enterprise Support: +94 11 234 5678</span>
      <span>பக்கம் 1 / 1</span>
    </div>
  </div>
</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
};

