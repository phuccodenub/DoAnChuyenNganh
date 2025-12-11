/**
 * Certificate PDF Service
 * Generate PDF certificates from certificate data
 */
import puppeteer from 'puppeteer';
import { CertificateWithDetails } from '../../modules/certificate/certificate.types';
import logger from '../../utils/logger.util';
import { env } from '../../config/env.config';

export class CertificatePDFService {
  /**
   * Generate PDF buffer from certificate data
   */
  async generatePDF(certificate: CertificateWithDetails): Promise<Buffer> {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();
      
      await page.setViewport({
        width: 794,
        height: 1123,
        deviceScaleFactor: 2,
      });
      
      const htmlContent = this.generateCertificateHTML(certificate);
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
        preferCSSPageSize: true,
      });
      
      return pdfBuffer;
    } catch (error: any) {
      logger.error('[CertificatePDFService] Error generating PDF:', error);
      throw new Error(`Failed to generate PDF: ${error.message}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Remove Vietnamese diacritics from text
   */
  private removeVietnameseDiacritics(text: string): string {
    const diacriticsMap: { [key: string]: string } = {
      'á': 'a', 'à': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
      'ă': 'a', 'ắ': 'a', 'ằ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
      'â': 'a', 'ấ': 'a', 'ầ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
      'é': 'e', 'è': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
      'ê': 'e', 'ế': 'e', 'ề': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
      'í': 'i', 'ì': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
      'ó': 'o', 'ò': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
      'ô': 'o', 'ố': 'o', 'ồ': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
      'ơ': 'o', 'ớ': 'o', 'ờ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
      'ú': 'u', 'ù': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
      'ư': 'u', 'ứ': 'u', 'ừ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
      'ý': 'y', 'ỳ': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
      'đ': 'd',
      'Á': 'A', 'À': 'A', 'Ả': 'A', 'Ã': 'A', 'Ạ': 'A',
      'Ă': 'A', 'Ắ': 'A', 'Ằ': 'A', 'Ẳ': 'A', 'Ẵ': 'A', 'Ặ': 'A',
      'Â': 'A', 'Ấ': 'A', 'Ầ': 'A', 'Ẩ': 'A', 'Ẫ': 'A', 'Ậ': 'A',
      'É': 'E', 'È': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 'Ẹ': 'E',
      'Ê': 'E', 'Ế': 'E', 'Ề': 'E', 'Ể': 'E', 'Ễ': 'E', 'Ệ': 'E',
      'Í': 'I', 'Ì': 'I', 'Ỉ': 'I', 'Ĩ': 'I', 'Ị': 'I',
      'Ó': 'O', 'Ò': 'O', 'Ỏ': 'O', 'Õ': 'O', 'Ọ': 'O',
      'Ô': 'O', 'Ố': 'O', 'Ồ': 'O', 'Ổ': 'O', 'Ỗ': 'O', 'Ộ': 'O',
      'Ơ': 'O', 'Ớ': 'O', 'Ờ': 'O', 'Ở': 'O', 'Ỡ': 'O', 'Ợ': 'O',
      'Ú': 'U', 'Ù': 'U', 'Ủ': 'U', 'Ũ': 'U', 'Ụ': 'U',
      'Ư': 'U', 'Ứ': 'U', 'Ừ': 'U', 'Ử': 'U', 'Ữ': 'U', 'Ự': 'U',
      'Ý': 'Y', 'Ỳ': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y', 'Ỵ': 'Y',
      'Đ': 'D'
    };
    
    return text.split('').map(char => diacriticsMap[char] || char).join('');
  }

  /**
   * Generate HTML template for certificate
   */
  private generateCertificateHTML(certificate: CertificateWithDetails): string {
    const { metadata, certificate_number, issued_at } = certificate;
    const studentName = this.removeVietnameseDiacritics(metadata.student.name);
    const courseTitle = this.removeVietnameseDiacritics(metadata.course.title);
    const instructorName = this.removeVietnameseDiacritics(metadata.course.instructor.name);
    
    const completionDate = new Date(metadata.completion.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    const issuedDate = new Date(issued_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    const grade = metadata.completion.grade;
    const verificationUrl = `${env.frontendUrl}/certificates/verify?hash=${certificate.certificate_hash}`;
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificate of Completion</title>
  <style>
    @page {
      size: A4;
      margin: 0;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Garamond', 'Georgia', 'Times New Roman', serif;
      background: #ffffff;
      width: 210mm;
      height: 297mm;
      margin: 0;
      padding: 0;
      overflow: hidden;
    }
    
    .certificate-container {
      background: #ffffff;
      width: 210mm;
      height: 297mm;
      margin: 0;
      padding: 20mm 18mm;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    
    /* Traditional ornate border */
    .main-border {
      position: absolute;
      top: 12mm;
      left: 12mm;
      right: 12mm;
      bottom: 12mm;
      border: 4px double #1a202c;
      pointer-events: none;
    }
    
    .inner-border {
      position: absolute;
      top: 15mm;
      left: 15mm;
      right: 15mm;
      bottom: 15mm;
      border: 1px solid #2d3748;
      pointer-events: none;
    }
    
    /* Official seal watermark */
    .official-seal {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 150mm;
      height: 150mm;
      border: 2px solid rgba(212, 175, 55, 0.08);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }
    
    .official-seal::before {
      content: '';
      width: 140mm;
      height: 140mm;
      border: 1px solid rgba(212, 175, 55, 0.05);
      border-radius: 50%;
      position: absolute;
    }
    
    .official-seal::after {
      content: 'OFFICIAL CERTIFICATE';
      position: absolute;
      font-size: 14px;
      letter-spacing: 8px;
      color: rgba(26, 32, 44, 0.04);
      font-weight: bold;
      text-align: center;
    }
    
    .header {
      text-align: center;
      margin-bottom: 12mm;
      position: relative;
      z-index: 1;
      padding-top: 8mm;
    }
    
    .institution-name {
      font-size: 18px;
      font-weight: 700;
      color: #1a202c;
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-bottom: 2mm;
    }
    
    .institution-tagline {
      font-size: 11px;
      color: #4a5568;
      font-style: italic;
      margin-bottom: 10mm;
      letter-spacing: 1px;
    }
    
    .certificate-title {
      font-size: 38px;
      font-weight: bold;
      color: #1a202c;
      letter-spacing: 6px;
      text-transform: uppercase;
      margin-bottom: 3mm;
      padding: 5mm 0;
    }
    
    .certificate-subtitle {
      font-size: 13px;
      color: #2d3748;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    
    .certificate-body {
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: relative;
      z-index: 1;
      padding: 0 20mm;
      margin-bottom: 5mm;
    }
    
    .presented-to {
      font-size: 14px;
      color: #2d3748;
      margin-bottom: 5mm;
      letter-spacing: 2px;
      text-transform: uppercase;
      font-weight: 600;
    }
    
    .student-name {
      font-size: 42px;
      font-weight: 700;
      color: #1a202c;
      margin: 8mm 0;
      line-height: 1.2;
      padding-bottom: 3mm;
      letter-spacing: 2px;
    }
    
    .recognition-text {
      font-size: 13px;
      color: #2d3748;
      line-height: 1.6;
      margin: 6mm 0;
      font-weight: 400;
      max-width: 150mm;
      margin-left: auto;
      margin-right: auto;
    }
    
    .course-info {
      margin: 7mm 0;
      padding: 7mm 12mm;
      position: relative;
    }
    
    .course-title {
      font-size: 26px;
      font-weight: 700;
      color: #1a202c;
      margin-bottom: 6mm;
      line-height: 1.3;
      letter-spacing: 1px;
    }
    
    .course-details {
      display: flex;
      justify-content: center;
      gap: 20mm;
      font-size: 12px;
      color: #4a5568;
      margin-top: 5mm;
    }
    
    .detail-item {
      text-align: center;
    }
    
    .detail-label {
      font-weight: 700;
      color: #1a202c;
      margin-bottom: 2mm;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
    }
    
    .detail-value {
      font-size: 13px;
      color: #2d3748;
      font-weight: 600;
    }
    
    .completion-info {
      margin: 7mm 0;
      display: flex;
      justify-content: center;
      gap: 15mm;
    }
    
    .info-box {
      text-align: center;
      padding: 6mm 12mm;
      background: #ffffff;
      min-width: 60mm;
    }
    
    .info-label {
      font-size: 10px;
      color: #4a5568;
      margin-bottom: 3mm;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      font-weight: 700;
    }
    
    .info-value {
      font-size: 18px;
      font-weight: 700;
      color: #1a202c;
    }
    
    .footer {
      padding-top: 8mm;
      display: flex;
      justify-content: space-between;
      position: relative;
      z-index: 1;
    }
    
    .signature {
      text-align: center;
      width: 70mm;
    }
    
    .signature-line {
      padding-top: 3mm;
      margin-top: 10mm;
    }
    
    .signature-name {
      font-weight: 700;
      font-size: 14px;
      color: #1a202c;
      margin-bottom: 1mm;
      letter-spacing: 0.5px;
    }
    
    .signature-title {
      font-size: 11px;
      color: #4a5568;
      font-weight: 400;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .certificate-footer {
      text-align: center;
      margin-top: 6mm;
      padding-top: 4mm;
      position: relative;
      z-index: 1;
    }
    
    .certificate-number {
      font-size: 12px;
      color: #1a202c;
      margin-bottom: 3mm;
      text-transform: uppercase;
      letter-spacing: 2px;
      font-weight: 700;
    }
    
    .certificate-number-value {
      font-size: 14px;
      font-weight: 700;
      color: #1a202c;
      font-family: 'Courier New', monospace;
      letter-spacing: 2px;
      display: inline-block;
      padding: 2mm 5mm;
      background: #f7fafc;
      margin-left: 3mm;
    }
    
    .verification-info {
      text-align: center;
      margin-top: 3mm;
      font-size: 9px;
      color: #718096;
      line-height: 1.5;
    }
    
    .verification-url {
      color: #2d3748;
      word-break: break-all;
      font-size: 8px;
      margin-top: 1mm;
      font-weight: 500;
      font-family: 'Courier New', monospace;
    }
    
    /* Print optimizations */
    @media print {
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="certificate-container">
    <div class="main-border"></div>
    <div class="inner-border"></div>
    
    <div class="official-seal"></div>
    
    <div class="header">
      <div class="institution-name">GekLearn</div>
      <div class="institution-tagline">PhucNguyen, NguyenChidi, KimHuong</div>
      
      <h1 class="certificate-title">Certificate</h1>
      <p class="certificate-subtitle">of Completion</p>
    </div>
    
    <div class="certificate-body">
      <p class="presented-to">This is presented to</p>
      
      <div class="student-name">${studentName}</div>
      
      <p class="recognition-text">
        In recognition of successful completion of the comprehensive course of study and 
        demonstrated proficiency in the subject matter as prescribed by the curriculum requirements
      </p>
      
      <div class="course-info">
        <h2 class="course-title">${courseTitle}</h2>
        <div class="course-details">
          <div class="detail-item">
            <div class="detail-label">Instructed By</div>
            <div class="detail-value">${instructorName}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Course Level</div>
            <div class="detail-value">${metadata.course.level}</div>
          </div>
          ${metadata.course.duration ? `
          <div class="detail-item">
            <div class="detail-label">Total Hours</div>
            <div class="detail-value">${metadata.course.duration} Hours</div>
          </div>
          ` : ''}
        </div>
      </div>
      
      <div class="completion-info">
        <div class="info-box">
          <div class="info-label">Date of Completion</div>
          <div class="info-value">${completionDate}</div>
        </div>
        ${grade ? `
        <div class="info-box">
          <div class="info-label">Final Achievement</div>
          <div class="info-value">${grade.toFixed(1)}%</div>
        </div>
        ` : ''}
      </div>
    </div>
    
    <div class="certificate-footer">
      <div class="certificate-number">
        CERTIFICATE NO. <span class="certificate-number-value">${certificate_number}</span>
      </div>
      <div class="verification-info">
        <p>Verification URL:</p>
        <p class="verification-url">${verificationUrl}</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;
  }
}

export const certificatePDFService = new CertificatePDFService();