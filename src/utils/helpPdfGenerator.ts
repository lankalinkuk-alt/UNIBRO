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
