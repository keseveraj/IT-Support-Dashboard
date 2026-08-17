import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Ticket } from '../types';

interface PDFExportOptions {
    monthLabel?: string;
    preparedBy?: string;
    customTitle?: string;
}

// Format date to DD-MMM-YY (e.g., 13-Jan-25)
function formatDateDDMMMYY(dateString?: string): string {
    if (!dateString) return '-';
    try {
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return dateString;
        
        const day = String(d.getDate()).padStart(2, '0');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = months[d.getMonth()];
        const year = String(d.getFullYear()).slice(-2);
        
        return `${day}-${month}-${year}`;
    } catch {
        return dateString;
    }
}

// Draw Raj's signature using precise vector curves matching the provided image
function drawRajSignature(doc: jsPDF, startX: number, startY: number) {
    doc.saveGraphicsState();
    doc.setDrawColor(20, 45, 95); // Deep blue ink
    doc.setLineWidth(0.7);

    // Initial vertical loop stroke (the "R" stem and loop)
    doc.lines(
        [
            [2, -14],  // up
            [6, 3],    // right curve
            [-2, 6],   // down
            [-8, 6],   // cross
            [12, 1],   // horizontal line
            [4, -9],   // loop top
            [6, 9],    // down slope
            [8, -2],   // flourish
        ],
        startX + 3,
        startY + 15,
        [1, 1],
        'S',
        false
    );

    // Characteristic cursive loop and flourish
    doc.setLineWidth(0.6);
    doc.lines(
        [
            [-4, -10],
            [8, -6],
            [12, 8],
            [10, -4],
            [8, 2],
        ],
        startX + 5,
        startY + 12,
        [1, 1],
        'S',
        false
    );

    doc.restoreGraphicsState();
}

export function exportTicketsToPDF(tickets: Ticket[], options: PDFExportOptions = {}) {
    const {
        monthLabel = 'All Dates',
        preparedBy = 'Raj',
        customTitle = 'IT Ticketing Summary'
    } = options;

    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;

    // Prepare table data: Date | Category | Description | Requestor/User
    const tableBody = tickets.map(ticket => {
        const dateFormatted = formatDateDDMMMYY(ticket.created_at);
        const category = ticket.issue_type || 'Others';
        const description = ticket.description || '-';
        const requestor = ticket.user_name || ticket.department || 'User';

        return [dateFormatted, category, description, requestor];
    });

    // Setup AutoTable
    autoTable(doc, {
        head: [['Date', 'Category', 'Description', 'Requestor/User']],
        body: tableBody,
        startY: 32,
        margin: { left: margin, right: margin, top: 32, bottom: 42 },
        theme: 'plain',
        styles: {
            fontSize: 8.5,
            cellPadding: { top: 2.2, bottom: 2.2, left: 2.5, right: 2.5 },
            lineColor: [0, 0, 0],
            lineWidth: 0.35,
            textColor: [20, 20, 20],
            valign: 'middle',
            font: 'helvetica',
        },
        headStyles: {
            fillColor: [215, 215, 215], // Light gray matching reference
            textColor: [0, 0, 0],
            fontStyle: 'bold',
            fontSize: 8.5,
            halign: 'center',
            lineWidth: 0.5,
            lineColor: [0, 0, 0],
        },
        columnStyles: {
            0: { cellWidth: 22, halign: 'center' }, // Date
            1: { cellWidth: 36, halign: 'center' }, // Category
            2: { cellWidth: 'auto', halign: 'left' }, // Description (flexible)
            3: { cellWidth: 34, halign: 'center' }, // Requestor/User
        },
        didDrawPage: (data) => {
            // Header on every page
            const currentPage = data.pageNumber;

            // 1. Page Number (Top Right: "Page X of Y" placeholder - will be finalized after all pages)
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.5);
            doc.setTextColor(30, 30, 30);
            
            // 2. Title: IT Ticketing Summary
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(16);
            doc.text(customTitle, margin, 18);

            // Underline under title
            const titleWidth = doc.getTextWidth(customTitle);
            doc.setLineWidth(0.6);
            doc.setDrawColor(0, 0, 0);
            doc.line(margin, 19.5, margin + titleWidth, 19.5);

            // 3. Month Subtitle
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(110, 110, 110);
            doc.text(`Month : `, margin, 26);
            
            doc.setTextColor(50, 50, 50);
            doc.text(monthLabel, margin + doc.getTextWidth('Month : '), 26);
        },
    });

    // Total page count
    const totalPages = (doc as any).internal.getNumberOfPages();

    // Now loop over each page to render Page Numbers & Footer / Signature
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);

        // Page Number at top right: Page X of Y
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(0, 0, 0);
        const pageText = `Page ${i} of ${totalPages}`;
        doc.text(pageText, pageWidth - margin - doc.getTextWidth(pageText), 12);

        // Render Prepared By on each page or the bottom of the page as in reference
        const sigY = pageHeight - 34;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(40, 40, 40);
        doc.text('Prepared by:', margin, sigY);

        // Signature vector
        drawRajSignature(doc, margin, sigY + 2);

        // Dotted line
        doc.setLineWidth(0.3);
        doc.setDrawColor(120, 120, 120);
        doc.setLineDashPattern([0.8, 0.8], 0);
        doc.line(margin, sigY + 22, margin + 32, sigY + 22);
        doc.setLineDashPattern([], 0); // reset

        // Name
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(20, 20, 20);
        const nameWidth = doc.getTextWidth(preparedBy);
        doc.text(preparedBy, margin + (32 - nameWidth) / 2, sigY + 26);
    }

    // Generate filename
    const sanitizedMonth = monthLabel.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `IT_Ticketing_Summary_${sanitizedMonth}.pdf`;
    
    doc.save(filename);
}
