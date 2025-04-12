import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { Employee } from '../types';

// Convert markdown headers to PDF structure
const parseMarkdownForPDF = (markdown: string) => {
  const lines = markdown.split('\n');
  const sections = [];
  let currentSection: { title: string; content: string } | null = null;

  for (const line of lines) {
    if (line.startsWith('# ')) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = { title: line.substring(2), content: '' };
    } else if (line.startsWith('## ')) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = { title: line.substring(3), content: '' };
    } else if (line.startsWith('### ')) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = { title: line.substring(4), content: '' };
    } else if (currentSection) {
      currentSection.content += line + '\n';
    }
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  return sections;
};

// Convert markdown content to formatted text for Word docs
const parseMarkdownForWord = (markdown: string) => {
  const lines = markdown.split('\n');
  const paragraphs = [];

  for (const line of lines) {
    if (line.trim() === '') {
      // Empty line
      paragraphs.push(new Paragraph({}));
    } else if (line.startsWith('# ')) {
      // H1
      paragraphs.push(
        new Paragraph({
          text: line.substring(2),
          heading: HeadingLevel.HEADING_1,
        })
      );
    } else if (line.startsWith('## ')) {
      // H2
      paragraphs.push(
        new Paragraph({
          text: line.substring(3),
          heading: HeadingLevel.HEADING_2,
        })
      );
    } else if (line.startsWith('### ')) {
      // H3
      paragraphs.push(
        new Paragraph({
          text: line.substring(4),
          heading: HeadingLevel.HEADING_3,
        })
      );
    } else if (line.startsWith('- ')) {
      // Bullet point
      paragraphs.push(
        new Paragraph({
          text: line.substring(2),
          bullet: { level: 0 },
        })
      );
    } else if (line.startsWith('  - ')) {
      // Nested bullet point
      paragraphs.push(
        new Paragraph({
          text: line.substring(4),
          bullet: { level: 1 },
        })
      );
    } else if (line.startsWith('**') && line.endsWith('**')) {
      // Bold text
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line.substring(2, line.length - 2),
              bold: true,
            }),
          ],
        })
      );
    } else {
      // Regular text
      paragraphs.push(new Paragraph({ text: line }));
    }
  }

  return paragraphs;
};

/**
 * Generate and download a PDF from markdown content
 */
export const generatePDF = (
  markdown: string,
  employee: Employee,
  reviewPeriod: string,
  reviewerName: string
) => {
  const doc = new jsPDF();
  const sections = parseMarkdownForPDF(markdown);

  // Add title
  doc.setFontSize(18);
  doc.text(`Performance Review: ${employee.name}`, 14, 20);

  // Add metadata
  doc.setFontSize(10);
  doc.text(`Position: ${employee.position}`, 14, 30);
  doc.text(`Department: ${employee.department}`, 14, 35);
  doc.text(`Review Period: ${reviewPeriod}`, 14, 40);
  doc.text(`Reviewer: ${reviewerName}`, 14, 45);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 50);

  doc.setFontSize(12);
  let y = 60;

  // Add content sections
  for (const section of sections) {
    // Add section title
    doc.setFont('helvetica', 'bold');
    doc.text(section.title, 14, y);
    y += 8;

    // Add section content
    doc.setFont('helvetica', 'normal');
    const splitText = doc.splitTextToSize(section.content, 180);
    
    // Check if we need to add a new page
    if (y + splitText.length * 5 > doc.internal.pageSize.height - 20) {
      doc.addPage();
      y = 20;
    }
    
    doc.text(splitText, 14, y);
    y += splitText.length * 5 + 10;
  }

  // Download the PDF
  doc.save(`performance-review-${employee.name.toLowerCase().replace(/\s+/g, '-')}-${reviewPeriod.toLowerCase().replace(/\s+/g, '-')}.pdf`);
};

/**
 * Generate and download a Word document from markdown content
 */
export const generateWord = async (
  markdown: string,
  employee: Employee,
  reviewPeriod: string,
  reviewerName: string
) => {
  // Create document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Title
          new Paragraph({
            text: `Performance Review: ${employee.name}`,
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
          }),
          
          // Metadata
          new Paragraph({
            children: [
              new TextRun({ text: `Position: `, bold: true }),
              new TextRun({ text: employee.position }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Department: `, bold: true }),
              new TextRun({ text: employee.department }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Review Period: `, bold: true }),
              new TextRun({ text: reviewPeriod }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Reviewer: `, bold: true }),
              new TextRun({ text: reviewerName }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Generated on: `, bold: true }),
              new TextRun({ text: new Date().toLocaleDateString() }),
            ],
          }),
          
          // Spacer
          new Paragraph({}),
          
          // Content
          ...parseMarkdownForWord(markdown),
        ],
      },
    ],
  });

  // Generate and save document
  const buffer = await Packer.toBuffer(doc);
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  saveAs(blob, `performance-review-${employee.name.toLowerCase().replace(/\s+/g, '-')}-${reviewPeriod.toLowerCase().replace(/\s+/g, '-')}.docx`);
}; 