import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function createSignedPDF(
  templatePdfBytes,
  signatures,
  signaturePositions
) {
  // Load the PDF document
  const pdfDoc = await PDFDocument.load(templatePdfBytes);
  
  // For each signature
  for (const [id, signatureDataUrl] of Object.entries(signatures)) {
    const position = signaturePositions[id];
    if (!position) continue;
    
    // Get the page
    const page = pdfDoc.getPages()[position.page || 0];
    
    // Convert data URL to bytes
    const signatureImageBytes = await convertDataUrlToBytes(signatureDataUrl);
    
    // Embed the signature image
    const signatureImage = await pdfDoc.embedPng(signatureImageBytes);
    
    // Calculate dimensions (you may need to adjust these)
    const width = 150;
    const height = 80;
    
    // Draw the signature on the page
    page.drawImage(signatureImage, {
      x: position.x,
      y: page.getHeight() - position.y - height, // PDF coordinates start from bottom-left
      width,
      height,
    });
  }
  
  // Save the PDF
  const signedPdfBytes = await pdfDoc.save();
  return signedPdfBytes;
}

// Helper function to convert data URL to bytes
async function convertDataUrlToBytes(dataUrl) {
  const base64Data = dataUrl.split(',')[1];
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}