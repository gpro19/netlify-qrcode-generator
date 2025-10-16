const QRCode = require('qrcode');
const { createCanvas, loadImage } = require('canvas');

exports.handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'image/png',
    'Cache-Control': 'public, max-age=86400'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const params = event.queryStringParameters || {};
    
    const {
      text = 'https://example.com',
      width = 300,
      color_dark = '#000000',
      color_light = '#ffffff',
      logo,
      logoWidth = 50,
      logoHeight = 50,
      margin = 2
    } = params;

    // Parse numeric values
    const numWidth = parseInt(width);
    const numLogoWidth = parseInt(logoWidth);
    const numLogoHeight = parseInt(logoHeight);
    const numMargin = parseInt(margin);

    // Create canvas
    const canvas = createCanvas(numWidth, numWidth);
    const ctx = canvas.getContext('2d');

    // Generate QR Code
    await QRCode.toCanvas(canvas, text, {
      width: numWidth,
      margin: numMargin,
      color: {
        dark: color_dark,
        light: color_light,
      },
    });

    // Add logo if provided
    if (logo) {
      try {
        const logoImg = await loadImage(logo);
        const logoX = (numWidth - numLogoWidth) / 2;
        const logoY = (numWidth - numLogoHeight) / 2;
        
        // Add white background for logo
        ctx.fillStyle = color_light;
        ctx.fillRect(logoX - 2, logoY - 2, numLogoWidth + 4, numLogoHeight + 4);
        
        ctx.drawImage(logoImg, logoX, logoY, numLogoWidth, numLogoHeight);
      } catch (logoError) {
        console.log('Error loading logo:', logoError.message);
        // Continue without logo if there's an error
      }
    }

    // Convert canvas to buffer
    const buffer = canvas.toBuffer('image/png');

    return {
      statusCode: 200,
      headers,
      body: buffer.toString('base64'),
      isBase64Encoded: true
    };

  } catch (error) {
    console.error('Error generating QR code:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'Failed to generate QR code',
        message: error.message 
      })
    };
  }
};
