/**
 * Server for chamber site: handles jobs API and application submissions.
 * - GET /api/jobs
 * - POST /api/jobs (admin)
 * - DELETE /api/jobs/:id (admin)
 * - POST /api/jobs/:id/apply (accepts multipart/form-data with optional resume file)
 *
 * Environment variables:
 *  - ADMIN_TOKEN: simple bearer token for admin endpoints
 *  - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS: optional SMTP credentials
 */

const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const helmet = require('helmet');
const multer = require('multer');
const nodemailer = require('nodemailer');

const app = express();
app.use(helmet());

// Parse JSON for non-file endpoints
app.use(express.json());

// Paths
const ROOT = path.join(__dirname, '..'); // chamber/
const DATA_FILE = path.join(ROOT, 'data', 'jobs.json');
const UPLOADS = path.join(ROOT, 'uploads');
const APPLICATIONS = path.join(ROOT, 'applications');

// Ensure directories exist
async function ensureDirs() {
  await fs.mkdir(UPLOADS, { recursive: true });
  await fs.mkdir(APPLICATIONS, { recursive: true });
}
ensureDirs().catch(console.error);

// Multer setup for file uploads (store in uploads/ with original filename prefixed by timestamp)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-z0-9.\-]/gi,'_')}`)
});
const upload = multer({ storage });

// Nodemailer transporter (optional)
let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
}

// Helpers to read/write jobs
async function readJobs() {
  const raw = await fs.readFile(DATA_FILE, 'utf8');
  return JSON.parse(raw);
}
async function writeJobs(list) {
  await fs.writeFile(DATA_FILE, JSON.stringify(list, null, 2), 'utf8');
}

function requireAdmin(req, res, next) {
  const auth = req.headers['authorization'] || '';
  const token = auth.replace(/^Bearer\s+/i, '');
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';
  if (!ADMIN_TOKEN) return res.status(500).json({ error: 'Server not configured with ADMIN_TOKEN' });
  if (!token || token !== ADMIN_TOKEN) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// Prune helper: remove jobs older than 30 days
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

app.get('/api/jobs', async (req, res) => {
  try {
    const list = await readJobs();
    const now = Date.now();
    const pruned = list.filter(j => {
      const p = Date.parse(j.postedAt);
      if (Number.isNaN(p)) return true;
      return (now - p) <= THIRTY_DAYS_MS;
    });
    if (pruned.length !== list.length) await writeJobs(pruned);
    res.json(pruned);
  } catch (err) {
    console.error('GET /api/jobs error', err);
    res.status(500).json({ error: 'Failed to read jobs' });
  }
});

app.post('/api/jobs', requireAdmin, async (req, res) => {
  try {
    const job = req.body || {};
    if (!job.title || !job.company) return res.status(400).json({ error: 'Missing required fields' });
    const list = await readJobs();
    const lastId = list.length ? (list[list.length - 1].id || 0) : 0;
    job.id = lastId + 1;
    job.location = job.location || 'remote';
    job.type = job.type || 'full-time';
    job.description = job.description || '';
    job.link = job.link || '#';
    job.postedAt = job.postedAt || (new Date()).toISOString();
    // optional fields
    job.posterEmail = job.posterEmail || job.contactEmail || null;
    job.requirements = job.requirements || '';
    job.salary = job.salary || '';
    job.cvRequired = !!job.cvRequired;

    list.push(job);
    await writeJobs(list);
    res.status(201).json(job);
  } catch (err) {
    console.error('POST /api/jobs error', err);
    res.status(500).json({ error: 'Failed to save job' });
  }
});

app.delete('/api/jobs/:id', requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });
    const list = await readJobs();
    const idx = list.findIndex(j => Number(j.id) === id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    const removed = list.splice(idx, 1)[0];
    await writeJobs(list);
    res.json({ removed });
  } catch (err) {
    console.error('DELETE /api/jobs error', err);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

// Apply to a job - accepts multipart/form-data; if cv file is included it will be attached
app.post('/api/jobs/:id/apply', upload.single('cv'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const list = await readJobs();
    const job = list.find(j => Number(j.id) === id);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const { applicantEmail, contactNumber, message } = req.body || {};
    if (!applicantEmail || !contactNumber) return res.status(400).json({ error: 'Missing applicant contact info' });

    // Prepare application record
    const application = {
      jobId: id,
      jobTitle: job.title,
      applicantEmail,
      contactNumber,
      message: message || '',
      cvPath: req.file ? req.file.path : null,
      submittedAt: (new Date()).toISOString()
    };

    // If there's a posterEmail and transporter configured, send an email
    if (job.posterEmail && transporter) {
      const mail = {
        from: process.env.SMTP_USER,
        to: job.posterEmail,
        subject: `Job Application for ${job.title}`,
        text: `Applicant: ${applicantEmail}\nContact: ${contactNumber}\n\nMessage:\n${message || ''}`,
        attachments: []
      };
      if (req.file) mail.attachments.push({ filename: req.file.originalname, path: req.file.path });
      await transporter.sendMail(mail);
      await fs.appendFile(path.join(APPLICATIONS, `${id}.json`), JSON.stringify(application) + '\n');
      return res.json({ ok: true, sent: true });
    }

    // No transporter or posterEmail — save application to applications/ as fallback
    await fs.appendFile(path.join(APPLICATIONS, `${id}.json`), JSON.stringify(application) + '\n');
    res.json({ ok: true, sent: false, note: 'Saved locally' });
  } catch (err) {
    console.error('POST /api/jobs/:id/apply error', err);
    res.status(500).json({ error: 'Failed to process application' });
  }
});

// ============================================
// EVENTS API
// ============================================

const EVENTS_FILE = path.join(ROOT, 'data', 'events.json');
const EVENTS_APPLICATIONS = path.join(ROOT, 'applications');

// Helpers to read/write events
async function readEvents() {
  const raw = await fs.readFile(EVENTS_FILE, 'utf8');
  return JSON.parse(raw);
}

async function writeEvents(list) {
  await fs.writeFile(EVENTS_FILE, JSON.stringify(list, null, 2), 'utf8');
}

// GET /api/events - retrieve all events
app.get('/api/events', async (req, res) => {
  try {
    let list = await readEvents();
    
    // Prune expired events (remove events where date has passed)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const pruned = list.filter(e => {
      const eventDate = new Date(e.date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate >= today;
    });
    
    // Save pruned list if any events were removed
    if (pruned.length !== list.length) {
      await writeEvents(pruned);
    }
    
    res.json(pruned);
  } catch (err) {
    console.error('GET /api/events error', err);
    res.status(500).json({ error: 'Failed to read events' });
  }
});

// POST /api/events/:id/participate - register for an event (MUST come before GET /api/events/:id)
app.post('/api/events/:id/participate', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const list = await readEvents();
    const event = list.find(e => Number(e.id) === id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const { name, email, contact, paymentRef, additionalInfo, phone, company, role, industry, experience, goals } = req.body || {};
    if (!name || !email || !contact) {
      return res.status(400).json({ error: 'Missing required contact info' });
    }

    // Validate mandatory fields
    const mandatoryFields = event.mandatoryFields || [];
    for (const field of mandatoryFields) {
      const value = req.body[field];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    // If event requires payment, validate payment reference
    if (event.paymentRequired && !paymentRef) {
      return res.status(400).json({ error: 'Payment reference required for this event' });
    }

    // Prepare participation record
    const participation = {
      eventId: id,
      eventTitle: event.title,
      eventDate: event.date,
      participantName: name,
      participantEmail: email,
      participantContact: contact,
      paymentRef: paymentRef || null,
      phone: phone || null,
      company: company || null,
      role: role || null,
      industry: industry || null,
      experience: experience || null,
      goals: goals || null,
      additionalInfo: additionalInfo || '',
      submittedAt: (new Date()).toISOString()
    };

    // Save participation record to file
    const appFile = path.join(EVENTS_APPLICATIONS, `event-${id}.json`);
    await fs.appendFile(appFile, JSON.stringify(participation) + '\n');

    // Send email if posterEmail configured
    let emailSent = false;
    if (event.posterEmail && transporter) {
      try {
        const emailBody = `
Participant: ${name}
Email: ${email}
Contact: ${contact}

Event: ${event.title}
Date: ${event.date} at ${event.time}

${paymentRef ? `Payment Ref: ${paymentRef}\n` : ''}${phone ? `Phone: ${phone}\n` : ''}${company ? `Company: ${company}\n` : ''}${role ? `Role: ${role}\n` : ''}${industry ? `Industry: ${industry}\n` : ''}${experience ? `Experience: ${experience}\n` : ''}${goals ? `Event Goals: ${goals}\n` : ''}${additionalInfo ? `\nAdditional Info:\n${additionalInfo}` : ''}
        `;
        
        const mail = {
          from: process.env.SMTP_USER,
          to: event.posterEmail,
          subject: `New Event Registration: ${event.title}`,
          text: emailBody
        };
        await transporter.sendMail(mail);
        emailSent = true;
      } catch (mailErr) {
        console.error('Email send failed:', mailErr);
        // Continue anyway - record was saved locally
      }
    }

    res.json({ ok: true, sent: emailSent });
  } catch (err) {
    console.error('POST /api/events/:id/participate error', err);
    res.status(500).json({ error: 'Failed to save participation' });
  }
});

// GET /api/events/:id - retrieve specific event
app.get('/api/events/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });
    
    const list = await readEvents();
    const event = list.find(e => Number(e.id) === id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    
    res.json(event);
  } catch (err) {
    console.error('GET /api/events/:id error', err);
    res.status(500).json({ error: 'Failed to read event' });
  }
});

// POST /api/events - create new event (admin protected)
app.post('/api/events', requireAdmin, async (req, res) => {
  try {
    const event = req.body || {};
    if (!event.title || !event.date) return res.status(400).json({ error: 'Missing required fields' });
    
    const list = await readEvents();
    const lastId = list.length ? Math.max(...list.map(e => e.id), 0) : 0;
    
    event.id = lastId + 1;
    event.time = event.time || '10:00';
    event.location = event.location || '';
    event.description = event.description || '';
    event.requirements = event.requirements || '';
    event.posterEmail = event.posterEmail || null;
    event.paymentRequired = !!event.paymentRequired;
    event.cost = event.paymentRequired ? (event.cost || 0) : null;
    event.mandatoryFields = event.mandatoryFields || [];
    event.postedAt = event.postedAt || (new Date()).toISOString();

    list.push(event);
    await writeEvents(list);
    res.status(201).json(event);
  } catch (err) {
    console.error('POST /api/events error', err);
    res.status(500).json({ error: 'Failed to save event' });
  }
});

// PUT /api/events/:id - update event (admin protected)
app.put('/api/events/:id', requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });
    
    const list = await readEvents();
    const idx = list.findIndex(e => Number(e.id) === id);
    if (idx === -1) return res.status(404).json({ error: 'Event not found' });
    
    const updates = req.body || {};
    const event = list[idx];
    
    // Update only allowed fields
    if (updates.title) event.title = updates.title;
    if (updates.date) event.date = updates.date;
    if (updates.time) event.time = updates.time;
    if (updates.location) event.location = updates.location;
    if (updates.description) event.description = updates.description;
    if (updates.requirements) event.requirements = updates.requirements;
    if (updates.posterEmail) event.posterEmail = updates.posterEmail;
    if (typeof updates.paymentRequired === 'boolean') event.paymentRequired = updates.paymentRequired;
    if (updates.paymentRequired && updates.cost !== undefined) event.cost = updates.cost;
    if (Array.isArray(updates.mandatoryFields)) event.mandatoryFields = updates.mandatoryFields;
    
    list[idx] = event;
    await writeEvents(list);
    res.json(event);
  } catch (err) {
    console.error('PUT /api/events/:id error', err);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// DELETE /api/events/:id - delete event (admin protected)
app.delete('/api/events/:id', requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });
    
    const list = await readEvents();
    const idx = list.findIndex(e => Number(e.id) === id);
    if (idx === -1) return res.status(404).json({ error: 'Event not found' });
    
    const removed = list.splice(idx, 1)[0];
    await writeEvents(list);
    res.json({ removed });
  } catch (err) {
    console.error('DELETE /api/events/:id error', err);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// Serve static site from chamber/ (one level up)
app.use(express.static(ROOT));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
