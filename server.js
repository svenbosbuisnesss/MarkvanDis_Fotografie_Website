import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
})[character]);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Contactpagina
app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'contact.html'));
});

// Algemene Voorwaarden pagina (conform screenshots)
app.get('/algemene-voorwaarden', (req, res) => {
  res.redirect('/contact.html#termsModalBackdrop');
});

// Dedicated pages for portfolio categories
app.get('/mijnwerk', (req, res) => {
  res.sendFile(path.join(__dirname, 'mijnwerk', 'index.html'));
});

app.get('/mijnwerk/trouwfotos', (req, res) => {
  res.sendFile(path.join(__dirname, 'mijnwerk', 'trouwfotos', 'index.html'));
});

app.get('/mijnwerk/prijswinnende-fotos', (req, res) => {
  res.sendFile(path.join(__dirname, 'mijnwerk', 'prijswinnende-fotos', 'index.html'));
});

app.get('/mijnwerk/persoonlijke-favorieten', (req, res) => {
  res.sendFile(path.join(__dirname, 'mijnwerk', 'persoonlijke-favorieten', 'index.html'));
});

// Geautomatiseerde mail endpoint naar contact@markvandis.nl
app.post('/api/contact', async (req, res) => {
  try {
    const voornaam = String(req.body.voornaam || '').trim();
    const achternaam = String(req.body.achternaam || '').trim();
    const email = String(req.body.email || '').trim();
    const telefoon = String(req.body.telefoon || '').trim();
    const bericht = String(req.body.bericht || '').trim();

    if (!voornaam || !achternaam || !email || !bericht || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Vul uw voornaam, achternaam, een geldig e-mailadres en bericht in.',
      });
    }

    const smtpHost = process.env.SMTP_HOST?.trim();
    const smtpUser = process.env.SMTP_USER?.trim();
    const smtpPass = process.env.SMTP_PASS;
    const smtpPort = Number(process.env.SMTP_PORT || 587);

    if (!smtpHost || !smtpUser || !smtpPass || !Number.isInteger(smtpPort) || smtpPort < 1 || smtpPort > 65535) {
      return res.status(503).json({
        success: false,
        error: 'Het contactformulier is tijdelijk niet beschikbaar. Stuur uw bericht rechtstreeks naar contact@markvandis.nl.',
      });
    }

    const sentAt = new Date().toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam' });
    const fullName = `${voornaam} ${achternaam}`;
    const safeName = escapeHtml(fullName);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(telefoon || 'Niet opgegeven');
    const safeMessage = escapeHtml(bericht).replace(/\r\n|\r|\n/g, '<br>');
    const emailSubject = `Nieuwe contactaanvraag van ${fullName}`.replace(/[\r\n]+/g, ' ').slice(0, 180);
    const emailBodyText = [
      'Nieuwe contactaanvraag via de website',
      '',
      `Naam: ${fullName}`,
      `E-mailadres: ${email}`,
      `Telefoonnummer: ${telefoon || 'Niet opgegeven'}`,
      '',
      'Bericht:',
      bericht,
      '',
      `Ontvangen op: ${sentAt}`,
    ].join('\n');
    const emailBodyHtml = `
      <!doctype html>
      <html lang="nl">
        <body style="margin:0;padding:0;background:#f3f0eb;font-family:Arial,Helvetica,sans-serif;color:#292622;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f0eb;padding:32px 12px;">
            <tr><td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #e7e2dc;border-radius:8px;overflow:hidden;">
                <tr><td style="background:#24211e;padding:28px 32px;color:#ffffff;">
                  <p style="margin:0 0 8px;color:#d8c9b8;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;">Mark van Dis Fotografie</p>
                  <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:400;">Nieuwe contactaanvraag</h1>
                </td></tr>
                <tr><td style="padding:28px 32px;">
                  <p style="margin:0 0 20px;color:#625d56;font-size:15px;line-height:1.6;">Er is een bericht verstuurd via het contactformulier.</p>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;font-size:14px;line-height:1.6;">
                    <tr><td style="padding:10px 0;border-bottom:1px solid #eee9e3;color:#777067;width:145px;">Naam</td><td style="padding:10px 0;border-bottom:1px solid #eee9e3;font-weight:600;">${safeName}</td></tr>
                    <tr><td style="padding:10px 0;border-bottom:1px solid #eee9e3;color:#777067;">E-mailadres</td><td style="padding:10px 0;border-bottom:1px solid #eee9e3;"><a href="mailto:${safeEmail}" style="color:#675746;">${safeEmail}</a></td></tr>
                    <tr><td style="padding:10px 0;border-bottom:1px solid #eee9e3;color:#777067;">Telefoonnummer</td><td style="padding:10px 0;border-bottom:1px solid #eee9e3;">${safePhone}</td></tr>
                    <tr><td colspan="2" style="padding:20px 0 8px;color:#777067;">Bericht</td></tr>
                    <tr><td colspan="2" style="padding:16px;background:#f7f4ef;border-radius:5px;line-height:1.7;">${safeMessage}</td></tr>
                  </table>
                  <p style="margin:24px 0 0;"><a href="mailto:${safeEmail}" style="display:inline-block;padding:11px 18px;background:#292622;color:#ffffff;text-decoration:none;border-radius:4px;font-size:14px;">Beantwoord deze aanvraag</a></p>
                </td></tr>
                <tr><td style="padding:16px 32px;background:#faf9f7;border-top:1px solid #eee9e3;color:#817a71;font-size:12px;">Ontvangen op ${escapeHtml(sentAt)} via markvandis.nl</td></tr>
              </table>
            </td></tr>
          </table>
        </body>
      </html>`;

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: process.env.SMTP_SECURE
        ? process.env.SMTP_SECURE.toLowerCase() === 'true'
        : smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: {
        name: 'Mark van Dis Fotografie | Website',
        address: process.env.SMTP_FROM?.trim() || smtpUser,
      },
      to: 'contact@markvandis.nl',
      replyTo: { name: fullName, address: email },
      subject: emailSubject,
      text: emailBodyText,
      html: emailBodyHtml,
    });

    return res.status(200).json({
      success: true,
      message: 'Uw bericht is verzonden. Mark neemt zo snel mogelijk contact met u op.',
    });
  } catch (error) {
    console.error('Fout bij versturen contactmail:', error.code || error.name || 'Onbekende SMTP-fout');
    return res.status(500).json({
      success: false,
      error: 'Verzenden is niet gelukt. Probeer het opnieuw of stuur direct een mail naar contact@markvandis.nl.',
    });
  }
});

// Fallback to homepage
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});
