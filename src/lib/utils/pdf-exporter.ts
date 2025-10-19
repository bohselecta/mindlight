/**
 * PDF Export Utility
 * 
 * Generates comprehensive PDF reports including:
 * - User profile and scores
 * - Phase 2 module completion status
 * - Badges and achievements
 * - Daily reflections summary
 * - Streak information
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { AutonomyProfile, Badge, DailyReflection, DisconfirmGame, SchemaReclaim, InfluenceSource, StreakData } from '@/types';

export interface PDFReportData {
  profile: AutonomyProfile;
  streak: StreakData;
  badges: Badge[];
  reflections: DailyReflection[];
  disconfirmGames: DisconfirmGame[];
  schemaReclaims: SchemaReclaim[];
  influenceSources: InfluenceSource[];
  generatedAt: Date;
}

export class PDFExporter {
  private doc: jsPDF;
  private currentY: number = 20;
  private pageHeight: number = 280;
  private margin: number = 20;

  constructor() {
    this.doc = new jsPDF();
    this.setupDocument();
  }

  private setupDocument() {
    this.doc.setProperties({
      title: 'Reflector Progress Report',
      subject: 'Epistemic Autonomy Assessment',
      author: 'Reflector App',
      creator: 'Reflector App'
    });
  }

  private addHeader(title: string, subtitle?: string) {
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += 10;

    if (subtitle) {
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(subtitle, this.margin, this.currentY);
      this.currentY += 15;
    } else {
      this.currentY += 5;
    }
  }

  private addSection(title: string, content: string[]) {
    // Check if we need a new page
    if (this.currentY > this.pageHeight - 50) {
      this.doc.addPage();
      this.currentY = 20;
    }

    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += 8;

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    content.forEach(line => {
      if (this.currentY > this.pageHeight - 20) {
        this.doc.addPage();
        this.currentY = 20;
      }
      this.doc.text(line, this.margin + 5, this.currentY);
      this.currentY += 5;
    });
    
    this.currentY += 10;
  }

  private addScoreChart(scores: Record<string, number>) {
    // Simple bar chart representation
    const constructs = Object.keys(scores);
    const maxScore = 100;
    const barWidth = 20;
    const barSpacing = 30;
    const startX = this.margin + 10;

    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Construct Scores', this.margin, this.currentY);
    this.currentY += 15;

    constructs.forEach((construct, index) => {
      const score = scores[construct];
      const barHeight = (score / maxScore) * 40;
      const x = startX + (index * barSpacing);
      const y = this.currentY + 40 - barHeight;

      // Draw bar
      this.doc.setFillColor(100, 150, 200);
      this.doc.rect(x, y, barWidth, barHeight, 'F');

      // Draw score text
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(score.toString(), x + barWidth/2 - 5, y - 5);

      // Draw construct label
      this.doc.text(construct.substring(0, 8), x - 5, this.currentY + 50);
    });

    this.currentY += 60;
  }

  private addBadges(badges: Badge[]) {
    if (badges.length === 0) return;

    this.addSection('Achievements', [`Total badges earned: ${badges.length}`]);
    
    const badgeCategories = badges.reduce((acc, badge) => {
      const category = badge.name.includes('Streak') ? 'Streak' :
                      badge.name.includes('Module') ? 'Module' :
                      badge.name.includes('Reflection') ? 'Reflection' : 'Other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(badge);
      return acc;
    }, {} as Record<string, Badge[]>);

    Object.entries(badgeCategories).forEach(([category, categoryBadges]) => {
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${category} Badges:`, this.margin + 5, this.currentY);
      this.currentY += 6;

      categoryBadges.forEach(badge => {
        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text(`• ${badge.name}: ${badge.description}`, this.margin + 10, this.currentY);
        this.currentY += 5;
      });
      this.currentY += 3;
    });
  }

  private addReflections(reflections: DailyReflection[]) {
    if (reflections.length === 0) return;

    this.addSection('Daily Reflections Summary', [
      `Total reflections: ${reflections.length}`,
      `Insightful reflections: ${reflections.filter(r => r.insightFlagged).length}`,
      `Average time per reflection: ${Math.round(reflections.reduce((sum, r) => sum + r.timeSpent, 0) / reflections.length)} seconds`
    ]);

    // Add recent reflections
    const recentReflections = reflections.slice(-5).reverse();
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Recent Reflections:', this.margin + 5, this.currentY);
    this.currentY += 8;

    recentReflections.forEach(reflection => {
      const date = new Date(reflection.date).toLocaleDateString();
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${date} - ${reflection.category}`, this.margin + 10, this.currentY);
      this.currentY += 5;

      this.doc.setFont('helvetica', 'normal');
      const prompt = reflection.prompt.length > 60 ? 
        reflection.prompt.substring(0, 60) + '...' : 
        reflection.prompt;
      this.doc.text(`Prompt: ${prompt}`, this.margin + 15, this.currentY);
      this.currentY += 5;

      const response = reflection.response.length > 100 ? 
        reflection.response.substring(0, 100) + '...' : 
        reflection.response;
      this.doc.text(`Response: ${response}`, this.margin + 15, this.currentY);
      this.currentY += 8;
    });
  }

  private addPhase2Stats(data: PDFReportData) {
    this.addSection('Phase 2 Module Progress', [
      `Disconfirm Games completed: ${data.disconfirmGames.length}`,
      `Schema Reclaim sessions: ${data.schemaReclaims.length}`,
      `Influence sources mapped: ${data.influenceSources.length}`,
      `Daily reflections: ${data.reflections.length}`
    ]);

    // Add module insights
    if (data.disconfirmGames.length > 0) {
      const avgScore = data.disconfirmGames.reduce((sum, game) => sum + game.overallScore, 0) / data.disconfirmGames.length;
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`Average Disconfirm Game score: ${avgScore.toFixed(1)}/100`, this.margin + 5, this.currentY);
      this.currentY += 5;
    }

    if (data.schemaReclaims.length > 0) {
      const avgImprovement = data.schemaReclaims.reduce((sum, session) => {
        return sum + (session.preRegulation.certainty - session.postRegulation.certainty);
      }, 0) / data.schemaReclaims.length;
      this.doc.text(`Average certainty reduction: ${avgImprovement.toFixed(1)} points`, this.margin + 5, this.currentY);
      this.currentY += 5;
    }
  }

  private addFooter() {
    const pageCount = this.doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(
        `Generated by Reflector App - Page ${i} of ${pageCount}`,
        this.margin,
        this.doc.internal.pageSize.height - 10
      );
    }
  }

  async generateReport(data: PDFReportData): Promise<Blob> {
    // Reset document
    this.doc = new jsPDF();
    this.setupDocument();
    this.currentY = 20;

    // Add title page
    this.addHeader('Reflector Progress Report', 'Your Epistemic Autonomy Journey');
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Generated on: ${data.generatedAt.toLocaleDateString()}`, this.margin, this.currentY);
    this.currentY += 20;

    // Add profile summary
    this.addSection('Profile Summary', [
      `Epistemic Autonomy Index: ${data.profile.scores.EAI.raw.toFixed(1)}`,
      `Reflective Flexibility: ${data.profile.scores.RF.raw.toFixed(1)}`,
      `Source Awareness: ${data.profile.scores.SA.raw.toFixed(1)}`,
      `Affect Regulation in Debate: ${data.profile.scores.ARD.raw.toFixed(1)}`,
      `Last updated: ${new Date(data.profile.lastUpdated).toLocaleDateString()}`
    ]);

    // Add score visualization
    const scoreValues = Object.fromEntries(
      Object.entries(data.profile.scores).map(([construct, score]) => [construct, score.raw])
    );
    this.addScoreChart(scoreValues);

    // Add streak information
    this.addSection('Reflection Streak', [
      `Current streak: ${data.streak.current} days`,
      `Longest streak: ${data.streak.longest} days`,
      `Milestones achieved: ${Object.values(data.streak.milestones).filter(Boolean).length}/4`
    ]);

    // Add badges
    this.addBadges(data.badges);

    // Add Phase 2 stats
    this.addPhase2Stats(data);

    // Add reflections
    this.addReflections(data.reflections);

    // Add insights section
    this.addSection('Key Insights', [
      'This report shows your progress in developing epistemic autonomy.',
      'Higher scores indicate better metacognitive awareness and critical thinking.',
      'Regular reflection practice strengthens your ability to recognize bias.',
      'Continue exploring different modules to maintain balanced development.'
    ]);

    // Add footer
    this.addFooter();

    return this.doc.output('blob');
  }

  async generateVisualReport(elementId: string): Promise<Blob> {
    // Capture the dashboard element as an image
    const element = document.getElementById(elementId);
    if (!element) throw new Error('Element not found');

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true
    });

    const imgData = canvas.toDataURL('image/png');
    
    // Create PDF with the image
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    return pdf.output('blob');
  }
}

export const pdfExporter = new PDFExporter();
