import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface OrderItem {
    name: string;
    brand: string;
    size: number;
    quantity: number;
    price: number;
    color: string;
    imageUrl?: string | null;
}

export interface OrderData {
    orderCode: string;
    createdAt: string;
    status: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    apartment?: string;
    city: string;
    postalCode: string;
    items: OrderItem[];
    subtotal: number;
    shippingCost: number;
    discountCode?: string;
    discountAmount?: number;
    total: number;
    paymentMethod?: string;
}

export interface InvoiceResult {
    blobUrl: string;
    download: () => void;
    cleanup: () => void;
}

export const generateInvoicePDF = async (order: OrderData): Promise<InvoiceResult> => {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;

    // ============================================================
    // 1. PREMIUM HEADER SECTION
    // ============================================================

    // Brand Name (Top Left)
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text("TOKYO SHOES", margin, 22);

    // Tagline
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Premium Footwear Collection", margin, 29);

    // TAX INVOICE Box (Top Right - Gray Background)
    const boxWidth = 70;
    const boxHeight = 32;
    const boxX = pageWidth - margin - boxWidth;
    const boxY = 10;

    // Draw gray box
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 2, 2, "F");

    // TAX INVOICE title
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("TAX INVOICE", boxX + boxWidth - 5, boxY + 8, { align: "right" });

    // Invoice details in the box
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.text(`Order #${order.orderCode}`, boxX + boxWidth - 5, boxY + 15, { align: "right" });

    const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
    doc.text(`Date: ${formattedDate}`, boxX + boxWidth - 5, boxY + 21, { align: "right" });

    // Status badge
    const statusColors: Record<string, [number, number, number]> = {
        pending: [234, 179, 8],
        processing: [59, 130, 246],
        shipped: [139, 92, 246],
        delivered: [34, 197, 94],
        cancelled: [239, 68, 68],
    };
    const statusColor = statusColors[order.status.toLowerCase()] || [100, 100, 100];
    doc.setTextColor(...statusColor);
    doc.setFont("helvetica", "bold");
    doc.text(`Status: ${order.status.toUpperCase()}`, boxX + boxWidth - 5, boxY + 28, { align: "right" });

    // Divider line below header
    let currentY = 50;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, pageWidth - margin, currentY);

    // ============================================================
    // 2. ADDRESSES SECTION (Side-by-Side)
    // ============================================================
    currentY += 10;

    const billToX = margin;
    const shipToX = pageWidth / 2 + 10;

    // Bill To Section (Left)
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("BILL TO", billToX, currentY);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(10);
    currentY += 6;
    doc.text(`${order.firstName} ${order.lastName}`, billToX, currentY);
    currentY += 5;
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(9);
    doc.text(order.email, billToX, currentY);

    // Ship To Section (Right)
    let shipY = currentY - 11; // Align with Bill To header
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("SHIP TO", shipToX, shipY);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(10);
    shipY += 6;

    // Calculate available width for Ship To (margin to right margin)
    const availableWidth = pageWidth - margin - shipToX;

    // Wrap main address line
    const wrappedAddress = doc.splitTextToSize(order.address, availableWidth);
    doc.text(wrappedAddress, shipToX, shipY);

    // Adjust Y based on lines in wrapped address (standard line height is ~1.15 * fontSize)
    const addressLineCount = Array.isArray(wrappedAddress) ? wrappedAddress.length : 1;
    shipY += (addressLineCount * 5); // 5mm spacing per line

    // Apartment details on a new line
    if (order.apartment) {
        doc.setFontSize(10);
        doc.setTextColor(30, 30, 30);
        doc.text(order.apartment, shipToX, shipY);
        shipY += 5;
    }

    // City and Postal Code
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(`${order.city}, ${order.postalCode}`, shipToX, shipY);

    // Update currentY to be after both address sections
    currentY = Math.max(currentY, shipY) + 15;

    // ============================================================
    // 3. PRODUCT TABLE
    // ============================================================

    // Prepare table data with proper alignment
    const tableData = order.items.map(item => [
        `${item.brand} ${item.name}\nSize: ${item.size} | Color: ${item.color}`,
        item.quantity.toString(),
        `Rs.${item.price.toFixed(2)}`,
        `Rs.${(item.price * item.quantity).toFixed(2)}`
    ]);

    autoTable(doc, {
        startY: currentY,
        head: [["Product", "Qty", "Price", "Total"]],
        body: tableData,
        theme: "plain",
        headStyles: {
            fillColor: [30, 30, 30],
            textColor: [255, 255, 255],
            fontSize: 9,
            fontStyle: "bold",
            cellPadding: 5,
        },
        styles: {
            fontSize: 9,
            textColor: [50, 50, 50],
            cellPadding: 6,
            lineColor: [230, 230, 230],
            lineWidth: 0.1,
        },
        columnStyles: {
            0: { cellWidth: "auto", halign: "left" },           // Product - LEFT
            1: { cellWidth: 20, halign: "center" },             // Qty - CENTER
            2: { cellWidth: 30, halign: "right" },              // Price - RIGHT
            3: { cellWidth: 35, halign: "right", fontStyle: "bold" },  // Total - RIGHT
        },
        alternateRowStyles: {
            fillColor: [250, 250, 250],
        },
        margin: { left: margin, right: margin },
        didDrawPage: () => {
            // Draw table border
            const table = (doc as any).lastAutoTable;
            if (table) {
                doc.setDrawColor(220, 220, 220);
                doc.setLineWidth(0.5);
                doc.rect(table.settings.margin.left, table.settings.startY,
                    pageWidth - table.settings.margin.left - table.settings.margin.right,
                    table.finalY - table.settings.startY);
            }
        }
    });

    currentY = (doc as any).lastAutoTable.finalY + 12;

    // ============================================================
    // 4. PAYMENT SUMMARY (Bottom Right - Under Total Column)
    // ============================================================
    const summaryRightX = pageWidth - margin;
    const summaryLabelX = summaryRightX - 55;

    // Payment Summary Box
    const summaryBoxY = currentY - 5;
    const summaryBoxHeight = order.discountAmount && order.discountAmount > 0 ? 55 : 45;

    doc.setFillColor(250, 250, 250);
    doc.roundedRect(summaryLabelX - 10, summaryBoxY, 75, summaryBoxHeight, 2, 2, "F");

    currentY += 3;

    // Summary Rows
    const renderSummaryLine = (label: string, value: string, isTotal = false, isDiscount = false) => {
        if (isTotal) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
        } else if (isDiscount) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(34, 197, 94); // Green
        } else {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(80, 80, 80);
        }
        doc.text(label, summaryLabelX, currentY);
        doc.text(value, summaryRightX - 5, currentY, { align: "right" });
        currentY += isTotal ? 8 : 6;
    };

    renderSummaryLine("Subtotal", `Rs.${order.subtotal.toFixed(2)}`);
    renderSummaryLine("Shipping", order.shippingCost === 0 ? "FREE" : `Rs.${order.shippingCost.toFixed(2)}`);

    if (order.discountAmount && order.discountAmount > 0) {
        renderSummaryLine(`Discount (${order.discountCode || "PROMO"})`, `-Rs.${order.discountAmount.toFixed(2)}`, false, true);
    }

    // Divider before total
    currentY += 2;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(summaryLabelX, currentY, summaryRightX - 5, currentY);
    currentY += 6;

    // Grand Total
    renderSummaryLine("TOTAL", `Rs.${order.total.toFixed(2)}`, true);

    // Payment Method (below summary)
    currentY += 5;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text(`Payment: ${order.paymentMethod || "N/A"}`, summaryLabelX, currentY);

    // ============================================================
    // 5. FOOTER
    // ============================================================
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "normal");
    doc.text("Thank you for shopping with Tokyo Shoes!", pageWidth / 2, pageHeight - 15, { align: "center" });
    doc.text("Questions? Contact support@tokyoshoes.com", pageWidth / 2, pageHeight - 10, { align: "center" });

    // ============================================================
    // OUTPUT
    // ============================================================
    const pdfBlob = doc.output("blob");
    const blobUrl = URL.createObjectURL(pdfBlob);

    return {
        blobUrl,
        download: () => {
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = `Invoice-${order.orderCode}.pdf`;
            link.click();
        },
        cleanup: () => {
            URL.revokeObjectURL(blobUrl);
        },
    };
};
