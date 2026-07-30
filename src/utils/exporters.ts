import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, LevelFormat } from 'docx';
import { ResumeData } from '../types';

/**
 * PDF Export using HTML container or jsPDF element rendering with resilient fallbacks
 */
export async function exportToPdf(containerId: string, filename: string = 'Resume.pdf', resume?: ResumeData): Promise<void> {
  let targetElement = document.getElementById(containerId);
  let isTemp = false;

  // Step 1: If element not in DOM (e.g. user on another tab), create temp element if resume provided
  if (!targetElement && resume) {
    targetElement = createTempResumeElement(resume);
    document.body.appendChild(targetElement);
    isTemp = true;
  }

  if (!targetElement) {
    if (resume) {
      exportDirectJsPdf(resume, filename);
      return;
    }
    throw new Error('Resume container element not found for PDF export.');
  }

  const originalScrollY = window.scrollY;
  window.scrollTo(0, 0);

  try {
    const canvas = await html2canvas(targetElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      allowTaint: true,
      windowWidth: targetElement.scrollWidth || 800,
      windowHeight: targetElement.scrollHeight || 1050
    });

    if (isTemp && targetElement.parentNode) {
      targetElement.parentNode.removeChild(targetElement);
      isTemp = false;
    }

    window.scrollTo(0, originalScrollY);

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let page = 0;

    while (heightLeft > 0) {
      if (page > 0) {
        pdf.addPage();
      }
      const position = -(page * pdfHeight);
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
      page++;
    }

    pdf.save(filename);
  } catch (err) {
    if (isTemp && targetElement && targetElement.parentNode) {
      targetElement.parentNode.removeChild(targetElement);
    }
    window.scrollTo(0, originalScrollY);
    console.warn('html2canvas render failed, using direct jsPDF fallback:', err);

    if (resume) {
      exportDirectJsPdf(resume, filename);
    } else {
      throw err;
    }
  }
}

function createTempResumeElement(resume: ResumeData): HTMLElement {
  const container = document.createElement('div');
  container.id = 'temp-pdf-export-container';
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0px';
  container.style.width = '794px';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#0f172a';
  container.style.padding = '40px';
  container.style.boxSizing = 'border-box';

  const fontCssMap: Record<string, string> = {
    'Calibri': 'Calibri, "Gill Sans", sans-serif',
    'Arial': 'Arial, Helvetica, sans-serif',
    'Times New Roman': '"Times New Roman", Times, serif',
    'Georgia': 'Georgia, serif',
    'Helvetica': 'Helvetica, Arial, sans-serif',
    'Garamond': 'Garamond, "Baskerville", serif'
  };

  const fontFamily = resume.fontFamily || 'Calibri';
  container.style.fontFamily = fontCssMap[fontFamily] || 'Arial, sans-serif';

  const templateId = resume.templateId || 'classic-ats';

  const contactStr = [
    resume.personalInfo.email,
    resume.personalInfo.phone,
    resume.personalInfo.location,
    resume.personalInfo.linkedin,
    resume.personalInfo.github
  ].filter(Boolean).join('  •  ');

  // Dynamic Header HTML based on templateId
  let headerHtml = '';
  if (templateId === 'modern-corporate') {
    headerHtml = `
      <div style="border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 20px;">
        <h1 style="font-size: 26px; font-weight: 800; margin: 0; color: #091e42; text-transform: uppercase;">${escapeHtml(resume.personalInfo.fullName || 'RESUME')}</h1>
        ${resume.personalInfo.jobTitle ? `<p style="font-size: 14px; font-weight: 700; color: #1d4ed8; margin: 4px 0 0 0; text-transform: uppercase;">${escapeHtml(resume.personalInfo.jobTitle)}</p>` : ''}
        <p style="font-size: 12px; color: #475569; margin: 8px 0 0 0;">${escapeHtml(contactStr)}</p>
      </div>
    `;
  } else if (templateId === 'tech-minimal') {
    headerHtml = `
      <div style="border-bottom: 1px solid #0f172a; padding-bottom: 16px; margin-bottom: 20px; font-family: monospace;">
        <h1 style="font-size: 24px; font-weight: bold; margin: 0; color: #0f172a;">${escapeHtml(resume.personalInfo.fullName || 'RESUME')}</h1>
        ${resume.personalInfo.jobTitle ? `<p style="font-size: 13px; font-weight: 600; color: #334155; margin: 4px 0 0 0; text-transform: uppercase;">&gt; ${escapeHtml(resume.personalInfo.jobTitle)}</p>` : ''}
        <p style="font-size: 11px; color: #475569; margin: 8px 0 0 0;">${escapeHtml(contactStr)}</p>
      </div>
    `;
  } else if (templateId === 'executive-clean') {
    headerHtml = `
      <div style="border-top: 4px solid #0f172a; border-bottom: 2px solid #0f172a; text-align: center; padding: 12px 0 16px 0; margin-bottom: 20px; font-family: Georgia, serif;">
        <h1 style="font-size: 28px; font-weight: bold; margin: 0; color: #020617; text-transform: uppercase; letter-spacing: 2px;">${escapeHtml(resume.personalInfo.fullName || 'RESUME')}</h1>
        ${resume.personalInfo.jobTitle ? `<p style="font-size: 14px; font-weight: 600; color: #1e293b; margin: 6px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">${escapeHtml(resume.personalInfo.jobTitle)}</p>` : ''}
        <p style="font-size: 12px; color: #334155; margin: 8px 0 0 0;">${escapeHtml(contactStr)}</p>
      </div>
    `;
  } else if (templateId === 'academic-standard') {
    headerHtml = `
      <div style="text-align: center; border-bottom: 4px double #0f172a; padding-bottom: 16px; margin-bottom: 20px; font-family: Garamond, serif;">
        <h1 style="font-size: 26px; font-weight: bold; margin: 0; color: #0f172a; text-transform: uppercase;">${escapeHtml(resume.personalInfo.fullName || 'RESUME')}</h1>
        ${resume.personalInfo.jobTitle ? `<p style="font-size: 13px; font-weight: bold; color: #1e293b; margin: 6px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">${escapeHtml(resume.personalInfo.jobTitle)}</p>` : ''}
        <p style="font-size: 12px; color: #334155; margin: 8px 0 0 0;">${escapeHtml(contactStr)}</p>
      </div>
    `;
  } else {
    headerHtml = `
      <div style="text-align: center; border-bottom: 2px solid #cbd5e1; padding-bottom: 16px; margin-bottom: 20px;">
        <h1 style="font-size: 26px; font-weight: bold; margin: 0; color: #0f172a; text-transform: uppercase;">${escapeHtml(resume.personalInfo.fullName || 'RESUME')}</h1>
        ${resume.personalInfo.jobTitle ? `<p style="font-size: 14px; font-weight: 600; color: #334155; margin: 6px 0 0 0; text-transform: uppercase;">${escapeHtml(resume.personalInfo.jobTitle)}</p>` : ''}
        <p style="font-size: 12px; color: #475569; margin: 8px 0 0 0;">${escapeHtml(contactStr)}</p>
      </div>
    `;
  }

  const getSectionHeaderHtml = (title: string) => {
    if (templateId === 'modern-corporate') {
      return `<h2 style="font-size: 14px; font-weight: 800; color: #0f172a; border-left: 4px solid #2563eb; padding: 2px 0 2px 8px; background-color: #eff6ff; margin-bottom: 10px; text-transform: uppercase;">${escapeHtml(title)}</h2>`;
    } else if (templateId === 'tech-minimal') {
      return `<h2 style="font-size: 13px; font-weight: bold; color: #0f172a; border-bottom: 1px solid #0f172a; padding-bottom: 4px; margin-bottom: 8px; font-family: monospace; text-transform: uppercase;">// ${escapeHtml(title)}</h2>`;
    } else if (templateId === 'executive-clean') {
      return `<h2 style="font-size: 14px; font-weight: bold; color: #020617; border-bottom: 2px solid #0f172a; padding-bottom: 4px; margin-bottom: 10px; font-family: Georgia, serif; text-transform: uppercase; letter-spacing: 1px;">${escapeHtml(title)}</h2>`;
    } else if (templateId === 'academic-standard') {
      return `<h2 style="font-size: 14px; font-weight: bold; color: #0f172a; border-bottom: 2px double #0f172a; padding-bottom: 4px; margin-bottom: 8px; font-family: Garamond, serif; text-transform: uppercase;">${escapeHtml(title)}</h2>`;
    } else {
      return `<h2 style="font-size: 14px; font-weight: bold; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px; text-transform: uppercase;">${escapeHtml(title)}</h2>`;
    }
  };

  let html = headerHtml;

  if (resume.summary) {
    html += `
      <div style="margin-bottom: 20px;">
        ${getSectionHeaderHtml('Professional Summary')}
        <p style="font-size: 12px; line-height: 1.5; color: #334155; margin: 0;">${escapeHtml(resume.summary)}</p>
      </div>
    `;
  }

  if (resume.workExperience && resume.workExperience.length > 0) {
    html += `
      <div style="margin-bottom: 20px;">
        ${getSectionHeaderHtml('Work Experience')}
    `;
    resume.workExperience.forEach(exp => {
      html += `
        <div style="margin-bottom: 14px;">
          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 13px; color: #0f172a;">
            <span>${escapeHtml(exp.company)}${exp.location ? ' - ' + escapeHtml(exp.location) : ''}</span>
            <span style="font-style: italic; font-size: 12px; color: #64748b;">${escapeHtml(exp.startDate)} - ${exp.isCurrent ? 'Present' : escapeHtml(exp.endDate)}</span>
          </div>
          <div style="font-style: italic; font-size: 12px; color: #334155; margin-bottom: 6px;">${escapeHtml(exp.position)}</div>
          <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: #334155; line-height: 1.4;">
            ${exp.bullets.map(b => `<li style="margin-bottom: 3px;">${escapeHtml(b)}</li>`).join('')}
          </ul>
        </div>
      `;
    });
    html += `</div>`;
  }

  const hardSkills = resume.skills?.hardSkills || [];
  const tools = resume.skills?.toolsAndFrameworks || [];
  const softSkills = resume.skills?.softSkills || [];
  if (hardSkills.length || tools.length || softSkills.length) {
    html += `
      <div style="margin-bottom: 20px;">
        ${getSectionHeaderHtml('Skills & Technical Expertise')}
        <div style="font-size: 12px; color: #334155; line-height: 1.5;">
          ${hardSkills.length ? `<div><strong>Core Skills:</strong> ${escapeHtml(hardSkills.join(', '))}</div>` : ''}
          ${tools.length ? `<div><strong>Tools & Tech:</strong> ${escapeHtml(tools.join(', '))}</div>` : ''}
          ${softSkills.length ? `<div><strong>Methodologies:</strong> ${escapeHtml(softSkills.join(', '))}</div>` : ''}
        </div>
      </div>
    `;
  }

  if (resume.education && resume.education.length > 0) {
    html += `
      <div style="margin-bottom: 20px;">
        ${getSectionHeaderHtml('Education')}
    `;
    resume.education.forEach(edu => {
      html += `
        <div style="margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 13px; color: #0f172a;">
            <span>${escapeHtml(edu.institution)}${edu.location ? ', ' + escapeHtml(edu.location) : ''}</span>
            <span style="font-style: italic; font-size: 12px; color: #64748b;">${escapeHtml(edu.startDate)} - ${escapeHtml(edu.endDate)}</span>
          </div>
          <div style="font-size: 12px; color: #334155;">${escapeHtml(edu.degree)} in ${escapeHtml(edu.fieldOfStudy)}${edu.gpa ? ' (GPA: ' + escapeHtml(edu.gpa) + ')' : ''}</div>
        </div>
      `;
    });
    html += `</div>`;
  }

  if (resume.certifications && resume.certifications.length > 0) {
    html += `
      <div style="margin-bottom: 20px;">
        ${getSectionHeaderHtml('Certifications')}
        <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: #334155; line-height: 1.4;">
          ${resume.certifications.map(c => `<li style="margin-bottom: 3px;"><strong>${escapeHtml(c.name)}</strong> - ${escapeHtml(c.issuer)} (${escapeHtml(c.date)})</li>`).join('')}
        </ul>
      </div>
    `;
  }

  if (resume.projects && resume.projects.length > 0) {
    html += `
      <div style="margin-bottom: 20px;">
        ${getSectionHeaderHtml('Key Projects')}
    `;
    resume.projects.forEach(p => {
      html += `
        <div style="margin-bottom: 10px;">
          <div style="font-weight: bold; font-size: 13px; color: #0f172a;">${escapeHtml(p.title)}${p.role ? ' (' + escapeHtml(p.role) + ')' : ''}</div>
          ${p.techStack?.length ? `<div style="font-size: 11px; font-style: italic; color: #64748b;">Tech: ${escapeHtml(p.techStack.join(', '))}</div>` : ''}
          <ul style="margin: 4px 0 0 0; padding-left: 18px; font-size: 12px; color: #334155; line-height: 1.4;">
            ${p.bullets.map(b => `<li style="margin-bottom: 2px;">${escapeHtml(b)}</li>`).join('')}
          </ul>
        </div>
      `;
    });
    html += `</div>`;
  }

  container.innerHTML = html;
  return container;
}
    resume.projects.forEach(p => {
      html += `
        <div style="margin-bottom: 10px;">
          <div style="font-weight: bold; font-size: 13px; color: #0f172a;">${escapeHtml(p.title)}${p.role ? ' (' + escapeHtml(p.role) + ')' : ''}</div>
          ${p.techStack?.length ? `<div style="font-size: 11px; font-style: italic; color: #64748b;">Tech: ${escapeHtml(p.techStack.join(', '))}</div>` : ''}
          <ul style="margin: 4px 0 0 0; padding-left: 18px; font-size: 12px; color: #334155; line-height: 1.4;">
            ${p.bullets.map(b => `<li style="margin-bottom: 2px;">${escapeHtml(b)}</li>`).join('')}
          </ul>
        </div>
      `;
    });
    html += `</div>`;
  }

  container.innerHTML = html;
  return container;
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function exportDirectJsPdf(resume: ResumeData, filename: string): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const margin = 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - (margin * 2);
  let y = 20;

  const checkNewPage = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // Title - Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text((resume.personalInfo.fullName || 'RESUME').toUpperCase(), pageWidth / 2, y, { align: 'center' });
  y += 7;

  // Job Title
  if (resume.personalInfo.jobTitle) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(51, 65, 85);
    doc.text(resume.personalInfo.jobTitle.toUpperCase(), pageWidth / 2, y, { align: 'center' });
    y += 6;
  }

  // Contact
  const contactParts = [
    resume.personalInfo.email,
    resume.personalInfo.phone,
    resume.personalInfo.location,
    resume.personalInfo.linkedin,
    resume.personalInfo.github
  ].filter(Boolean);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(contactParts.join('  |  '), pageWidth / 2, y, { align: 'center' });
  y += 6;

  // Divider Line
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  const addHeading = (title: string) => {
    checkNewPage(12);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(title.toUpperCase(), margin, y);
    y += 2;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;
  };

  // Summary
  if (resume.summary) {
    addHeading('Professional Summary');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);
    const lines = doc.splitTextToSize(resume.summary, contentWidth);
    checkNewPage(lines.length * 4.5);
    doc.text(lines, margin, y);
    y += lines.length * 4.5 + 4;
  }

  // Work Experience
  if (resume.workExperience && resume.workExperience.length > 0) {
    addHeading('Work Experience');
    resume.workExperience.forEach(exp => {
      checkNewPage(14);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(`${exp.company}${exp.location ? ' - ' + exp.location : ''}`, margin, y);

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`${exp.startDate} - ${exp.isCurrent ? 'Present' : exp.endDate}`, pageWidth - margin, y, { align: 'right' });
      y += 4.5;

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9.5);
      doc.setTextColor(51, 65, 85);
      doc.text(exp.position, margin, y);
      y += 5;

      exp.bullets.forEach(b => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85);
        const bLines = doc.splitTextToSize(`•  ${b}`, contentWidth - 4);
        checkNewPage(bLines.length * 4);
        doc.text(bLines, margin + 2, y);
        y += bLines.length * 4 + 1;
      });
      y += 3;
    });
  }

  // Skills
  const hardSkills = resume.skills?.hardSkills || [];
  const tools = resume.skills?.toolsAndFrameworks || [];
  const softSkills = resume.skills?.softSkills || [];
  if (hardSkills.length || tools.length || softSkills.length) {
    addHeading('Skills & Technical Expertise');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    if (hardSkills.length) {
      const sText = `Core Skills: ${hardSkills.join(', ')}`;
      const sLines = doc.splitTextToSize(sText, contentWidth);
      checkNewPage(sLines.length * 4);
      doc.text(sLines, margin, y);
      y += sLines.length * 4 + 2;
    }
    if (tools.length) {
      const tText = `Tools & Tech: ${tools.join(', ')}`;
      const tLines = doc.splitTextToSize(tText, contentWidth);
      checkNewPage(tLines.length * 4);
      doc.text(tLines, margin, y);
      y += tLines.length * 4 + 2;
    }
    if (softSkills.length) {
      const mText = `Methodologies: ${softSkills.join(', ')}`;
      const mLines = doc.splitTextToSize(mText, contentWidth);
      checkNewPage(mLines.length * 4);
      doc.text(mLines, margin, y);
      y += mLines.length * 4 + 2;
    }
    y += 2;
  }

  // Education
  if (resume.education && resume.education.length > 0) {
    addHeading('Education');
    resume.education.forEach(edu => {
      checkNewPage(10);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`${edu.institution}${edu.location ? ', ' + edu.location : ''}`, margin, y);

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`${edu.startDate} - ${edu.endDate}`, pageWidth - margin, y, { align: 'right' });
      y += 4.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      doc.text(`${edu.degree} in ${edu.fieldOfStudy}${edu.gpa ? ' (GPA: ' + edu.gpa : ''}`, margin, y);
      y += 6;
    });
  }

  // Certifications
  if (resume.certifications && resume.certifications.length > 0) {
    addHeading('Certifications');
    resume.certifications.forEach(c => {
      checkNewPage(5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      doc.text(`•  ${c.name} - ${c.issuer} (${c.date})`, margin, y);
      y += 4.5;
    });
    y += 2;
  }

  // Projects
  if (resume.projects && resume.projects.length > 0) {
    addHeading('Key Projects');
    resume.projects.forEach(p => {
      checkNewPage(10);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`${p.title}${p.role ? ' (' + p.role + ')' : ''}`, margin, y);
      y += 4.5;

      if (p.techStack?.length) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8.5);
        doc.setTextColor(100, 116, 139);
        doc.text(`Tech: ${p.techStack.join(', ')}`, margin, y);
        y += 4;
      }

      p.bullets.forEach(b => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85);
        const bLines = doc.splitTextToSize(`•  ${b}`, contentWidth - 4);
        checkNewPage(bLines.length * 4);
        doc.text(bLines, margin + 2, y);
        y += bLines.length * 4 + 1;
      });
      y += 2;
    });
  }

  doc.save(filename);
}


/**
 * Native Word (.docx) Document Generator using `docx` package
 */
export async function exportToDocx(resume: ResumeData, filename: string = 'Resume.docx'): Promise<void> {
  const children: Paragraph[] = [];
  const docFont = resume.fontFamily || 'Calibri';
  const templateId = resume.templateId || 'classic-ats';

  const headingColor = templateId === 'modern-corporate' ? '1E3A8A' : '000000';
  const headerAlignment = (templateId === 'modern-corporate' || templateId === 'tech-minimal') 
    ? AlignmentType.LEFT 
    : AlignmentType.CENTER;

  // Header - Name
  children.push(
    new Paragraph({
      alignment: headerAlignment,
      heading: HeadingLevel.TITLE,
      children: [
        new TextRun({
          text: resume.personalInfo.fullName || 'RESUME',
          bold: true,
          size: 32, // 16pt
          font: docFont,
          color: templateId === 'modern-corporate' ? '091E42' : '000000'
        })
      ]
    })
  );

  // Job Title
  if (resume.personalInfo.jobTitle) {
    children.push(
      new Paragraph({
        alignment: headerAlignment,
        children: [
          new TextRun({
            text: templateId === 'tech-minimal' ? `> ${resume.personalInfo.jobTitle}` : resume.personalInfo.jobTitle,
            bold: true,
            size: 24, // 12pt
            color: templateId === 'modern-corporate' ? '1D4ED8' : '333333',
            font: docFont
          })
        ]
      })
    );
  }

  // Contact Info Line
  const contactParts = [
    resume.personalInfo.email,
    resume.personalInfo.phone,
    resume.personalInfo.location,
    resume.personalInfo.linkedin,
    resume.personalInfo.github
  ].filter(Boolean);

  children.push(
    new Paragraph({
      alignment: headerAlignment,
      children: [
        new TextRun({
          text: contactParts.join('  •  '),
          size: 20, // 10pt
          color: '555555',
          font: docFont
        })
      ]
    })
  );

  children.push(new Paragraph({ text: '' })); // Spacing

  // Helper Section Heading Generator
  const addSectionHeading = (title: string) => {
    const formattedTitle = templateId === 'tech-minimal' ? `// ${title.toUpperCase()}` : title.toUpperCase();
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [
          new TextRun({
            text: formattedTitle,
            bold: true,
            size: 24, // 12pt
            font: docFont,
            color: headingColor
          })
        ]
      })
    );
  };

  // Professional Summary
  if (resume.summary) {
    addSectionHeading('Professional Summary');
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: resume.summary,
            size: 22,
            font: docFont
          })
        ]
      })
    );
    children.push(new Paragraph({ text: '' }));
  }

  // Work Experience
  if (resume.workExperience && resume.workExperience.length > 0) {
    addSectionHeading('Work Experience');
    resume.workExperience.forEach(exp => {
      // Company + Location
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${exp.company}${exp.location ? ' - ' + exp.location : ''}`,
              bold: true,
              size: 22,
              font: docFont
            }),
            new TextRun({
              text: `\t${exp.startDate} - ${exp.isCurrent ? 'Present' : exp.endDate}`,
              italics: true,
              size: 20,
              font: docFont
            })
          ]
        })
      );

      // Position Title
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: exp.position,
              italics: true,
              size: 22,
              font: docFont
            })
          ]
        })
      );

      // Bullets
      exp.bullets.forEach(bullet => {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({
                text: bullet,
                size: 21,
                font: docFont
              })
            ]
          })
        );
      });

      children.push(new Paragraph({ text: '' }));
    });
  }

  // Skills
  const hardSkills = resume.skills.hardSkills || [];
  const tools = resume.skills.toolsAndFrameworks || [];
  const softSkills = resume.skills.softSkills || [];

  if (hardSkills.length > 0 || tools.length > 0) {
    addSectionHeading('Skills & Technical Expertise');
    if (hardSkills.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Core Skills: ', bold: true, size: 21, font: docFont }),
            new TextRun({ text: hardSkills.join(', '), size: 21, font: docFont })
          ]
        })
      );
    }
    if (tools.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Tools & Technologies: ', bold: true, size: 21, font: docFont }),
            new TextRun({ text: tools.join(', '), size: 21, font: docFont })
          ]
        })
      );
    }
    if (softSkills.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Methodologies & Leadership: ', bold: true, size: 21, font: docFont }),
            new TextRun({ text: softSkills.join(', '), size: 21, font: docFont })
          ]
        })
      );
    }
    children.push(new Paragraph({ text: '' }));
  }

  // Education
  if (resume.education && resume.education.length > 0) {
    addSectionHeading('Education');
    resume.education.forEach(edu => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${edu.institution}${edu.location ? ', ' + edu.location : ''}`,
              bold: true,
              size: 22,
              font: docFont
            }),
            new TextRun({
              text: `\t${edu.startDate} - ${edu.endDate}`,
              italics: true,
              size: 20,
              font: docFont
            })
          ]
        })
      );
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${edu.degree} in ${edu.fieldOfStudy}${edu.gpa ? ' (GPA: ' + edu.gpa + ')' : ''}`,
              size: 21,
              font: docFont
            })
          ]
        })
      );
      children.push(new Paragraph({ text: '' }));
    });
  }

  // Certifications
  if (resume.certifications && resume.certifications.length > 0) {
    addSectionHeading('Certifications');
    resume.certifications.forEach(cert => {
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          children: [
            new TextRun({ text: `${cert.name} - `, bold: true, size: 21, font: docFont }),
            new TextRun({ text: `${cert.issuer} (${cert.date})`, size: 21, font: docFont })
          ]
        })
      );
    });
    children.push(new Paragraph({ text: '' }));
  }

  // Key Projects
  if (resume.projects && resume.projects.length > 0) {
    addSectionHeading('Key Projects');
    resume.projects.forEach(proj => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${proj.title}${proj.role ? ' (' + proj.role + ')' : ''}${proj.link ? ' | ' + proj.link : ''}`,
              bold: true,
              size: 21,
              font: docFont
            })
          ]
        })
      );
      if (proj.techStack && proj.techStack.length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'Tech Stack: ', italics: true, bold: true, size: 20, font: docFont }),
              new TextRun({ text: proj.techStack.join(', '), italics: true, size: 20, font: docFont })
            ]
          })
        );
      }
      proj.bullets.forEach(b => {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: b, size: 21, font: docFont })
            ]
          })
        );
      });
      children.push(new Paragraph({ text: '' }));
    });
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              bottom: 1440,
              left: 1440,
              right: 1440
            }
          }
        },
        children
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * ASCII Plain Text Export for raw ATS submission portals
 */
export function exportToPlainText(resume: ResumeData, filename: string = 'Resume.txt'): void {
  let text = '';

  text += `${resume.personalInfo.fullName.toUpperCase()}\n`;
  if (resume.personalInfo.jobTitle) {
    text += `${resume.personalInfo.jobTitle}\n`;
  }
  const contactParts = [
    resume.personalInfo.email,
    resume.personalInfo.phone,
    resume.personalInfo.location,
    resume.personalInfo.linkedin,
    resume.personalInfo.github
  ].filter(Boolean);
  text += `${contactParts.join(' | ')}\n\n`;

  if (resume.summary) {
    text += `=========================================\n`;
    text += `PROFESSIONAL SUMMARY\n`;
    text += `=========================================\n`;
    text += `${resume.summary}\n\n`;
  }

  if (resume.workExperience && resume.workExperience.length > 0) {
    text += `=========================================\n`;
    text += `WORK EXPERIENCE\n`;
    text += `=========================================\n`;
    resume.workExperience.forEach(exp => {
      text += `${exp.company} | ${exp.position}\n`;
      text += `${exp.location ? exp.location + ' | ' : ''}${exp.startDate} - ${exp.isCurrent ? 'Present' : exp.endDate}\n`;
      exp.bullets.forEach(b => {
        text += `* ${b}\n`;
      });
      text += `\n`;
    });
  }

  if (resume.skills) {
    text += `=========================================\n`;
    text += `SKILLS & TECHNICAL EXPERTISE\n`;
    text += `=========================================\n`;
    if (resume.skills.hardSkills?.length) {
      text += `Hard Skills: ${resume.skills.hardSkills.join(', ')}\n`;
    }
    if (resume.skills.toolsAndFrameworks?.length) {
      text += `Tools & Tech: ${resume.skills.toolsAndFrameworks.join(', ')}\n`;
    }
    if (resume.skills.softSkills?.length) {
      text += `Methodologies: ${resume.skills.softSkills.join(', ')}\n`;
    }
    text += `\n`;
  }

  if (resume.education && resume.education.length > 0) {
    text += `=========================================\n`;
    text += `EDUCATION\n`;
    text += `=========================================\n`;
    resume.education.forEach(edu => {
      text += `${edu.institution} - ${edu.degree} in ${edu.fieldOfStudy}\n`;
      text += `${edu.startDate} - ${edu.endDate}${edu.gpa ? ' | GPA: ' + edu.gpa : ''}\n\n`;
    });
  }

  if (resume.certifications && resume.certifications.length > 0) {
    text += `=========================================\n`;
    text += `CERTIFICATIONS\n`;
    text += `=========================================\n`;
    resume.certifications.forEach(cert => {
      text += `* ${cert.name} - ${cert.issuer} (${cert.date})\n`;
    });
    text += `\n`;
  }

  if (resume.projects && resume.projects.length > 0) {
    text += `=========================================\n`;
    text += `KEY PROJECTS\n`;
    text += `=========================================\n`;
    resume.projects.forEach(proj => {
      text += `${proj.title}${proj.role ? ' (' + proj.role + ')' : ''}${proj.link ? ' | ' + proj.link : ''}\n`;
      if (proj.techStack && proj.techStack.length > 0) {
        text += `Tech Stack: ${proj.techStack.join(', ')}\n`;
      }
      proj.bullets.forEach(b => {
        text += `* ${b}\n`;
      });
      text += `\n`;
    });
  }

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
