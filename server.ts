import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import { db } from './server-db.js';
import { User, ArtistProfile, Demo, Target, Outreach, Label } from './src/types.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Stripe Client with lazy/safe-check to avoid startup crash if key is undefined
let stripeClient: Stripe | null = null;
function getStripe(): Stripe | null {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return null;
  }
  if (!stripeClient) {
    stripeClient = new Stripe(stripeKey);
  }
  return stripeClient;
}

// Initialize Gemini client lazy/safe-check
let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY environment variable is not defined.');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || 'dummy-key',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Custom Helper to build base64url raw MIME messages for Gmail API
function buildMimeMessage({ to, subject, body }: { to: string; subject: string; body: string }) {
  const str = [
    `To: ${to}`,
    `Subject: =?utf-8?B?${Buffer.from(subject).toString('base64')}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset="utf-8"',
    'Content-Transfer-Encoding: base64',
    '',
    body
  ].join('\r\n');
  
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Middleware to extract UserId from Headers
function resolveUser(req: Request): string {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) {
    throw new Error('Missing x-user-id header');
  }
  return userId;
}

// Verification Middleware for Administrator Access
function verifyAdmin(req: Request, res: Response, next: any) {
  try {
    const userId = resolveUser(req);
    if (userId === 'admin_nicholas') {
      next();
    } else {
      res.status(403).json({ error: 'Administrative access restricted. Credentials required.' });
    }
  } catch (err: any) {
    res.status(401).json({ error: 'Authentication required' });
  }
}

// --- ADMIN API ENDPOINTS ---

app.get('/api/admin/users', verifyAdmin, (req: Request, res: Response) => {
  try {
    const users = db.getAllUsers();
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/users/:uid', verifyAdmin, (req: Request, res: Response) => {
  try {
    const deleted = db.deleteUser(req.params.uid);
    res.json({ success: deleted });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/stats', verifyAdmin, (req: Request, res: Response) => {
  try {
    const stats = db.getAdminStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- API ROUTES ---

// Health & Config Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGemini: !!process.env.GEMINI_API_KEY,
    time: new Date().toISOString()
  });
});

// User Check / Creation
app.post('/api/user', (req: Request, res: Response) => {
  try {
    const { id, email, name } = req.body;
    if (!id || !email) {
      res.status(400).json({ error: 'Missing required user fields' });
      return;
    }
    const user: User = {
      id,
      email,
      name: name || email.split('@')[0],
      createdAt: new Date().toISOString(),
      plan: 'free_trial',
      planStartDate: new Date().toISOString()
    };
    const saved = db.createUser(user);
    res.json(saved);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Upgrade Subscription Plan
app.post('/api/user/upgrade', (req: Request, res: Response) => {
  try {
    const userId = resolveUser(req);
    const { plan } = req.body; // 'free_trial' | 'starter' | 'pro'
    if (!plan || !['free_trial', 'starter', 'pro'].includes(plan)) {
      res.status(400).json({ error: 'Invalid plan choice' });
      return;
    }
    const upgraded = db.upgradeUser(userId, plan);
    res.json(upgraded);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create Stripe Checkout Session
app.post('/api/stripe/create-checkout-session', async (req: Request, res: Response) => {
  try {
    const userId = resolveUser(req);
    const { plan, interval } = req.body; // plan: 'starter' | 'pro', interval: 'monthly' | 'quarterly' | 'yearly'

    if (!plan || !['starter', 'pro'].includes(plan)) {
      res.status(400).json({ error: 'Invalid plan selected. Only Starter and Pro plans support paid billing.' });
      return;
    }

    const billingInterval = interval || 'monthly';
    if (!['monthly', 'quarterly', 'yearly'].includes(billingInterval)) {
      res.status(400).json({ error: 'Invalid billing interval choice.' });
      return;
    }

    const stripe = getStripe();
    if (!stripe) {
      res.status(400).json({ 
        error: 'Stripe Secret Key is missing from the environment. Please add STRIPE_SECRET_KEY to your Secrets configuration in the AI Studio Settings menu to configure Stripe payments.' 
      });
      return;
    }

    // Determine invoice pricing and product descriptions matching the client UI
    let amount = 0;
    let description = '';

    if (plan === 'starter') {
      if (billingInterval === 'monthly') {
        amount = 1500; // $15.00
        description = 'Starter Plan (Month-to-month subscription)';
      } else if (billingInterval === 'quarterly') {
        amount = 3600; // $36.00 total
        description = 'Starter Plan (3-Months upfront discount)';
      } else {
        amount = 10800; // $108.00 total
        description = 'Starter Plan (Annual upfront discount)';
      }
    } else { // pro
      if (billingInterval === 'monthly') {
        amount = 3900; // $39.00
        description = 'Pro Plan (Month-to-month subscription)';
      } else if (billingInterval === 'quarterly') {
        amount = 9600; // $96.00 total
        description = 'Pro Plan (3-Months upfront discount)';
      } else {
        amount = 28800; // $288.00 total
        description = 'Pro Plan (Annual upfront discount)';
      }
    }

    // Capture the app's root URL automatically
    const appUrl = process.env.APP_URL || req.headers.origin || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Promo Flow ${plan.toUpperCase()} Plan`,
              description: description,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${appUrl}/?session_id={CHECKOUT_SESSION_ID}&plan=${plan}`,
      cancel_url: `${appUrl}/`,
      metadata: {
        userId,
        plan,
        interval: billingInterval,
      },
    });

    res.json({ url: session.url });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Verify completed Stripe Checkout session
app.post('/api/stripe/verify-session', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      res.status(400).json({ error: 'Missing session ID to verify' });
      return;
    }

    const stripe = getStripe();
    if (!stripe) {
      res.status(400).json({ error: 'Stripe is not configured in this applet environment.' });
      return;
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session) {
      res.status(404).json({ error: 'Checkout session not found.' });
      return;
    }

    if (session.payment_status === 'paid') {
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan as 'free_trial' | 'starter' | 'pro' | undefined;

      if (userId && plan) {
        db.upgradeUser(userId, plan);
        res.json({ success: true, plan });
      } else {
        res.status(400).json({ error: 'Invalid checkout session metadata.' });
      }
    } else {
      res.status(400).json({ error: 'Payment has not been completed.' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Profile endpoints
app.get('/api/profile', (req: Request, res: Response) => {
  try {
    const userId = resolveUser(req);
    const profile = db.getArtistProfile(userId);
    res.json(profile || null);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/profile', (req: Request, res: Response) => {
  try {
    const userId = resolveUser(req);
    const { bio, genres, targetTone, artistName, defaultSignature, customToneInstruction, defaultLength } = req.body;
    const existing = db.getArtistProfile(userId);
    const profile: ArtistProfile = {
      id: existing?.id || Math.random().toString(36).substr(2, 9),
      userId,
      artistName: artistName || '',
      bio: bio || '',
      genres: Array.isArray(genres) ? genres : [],
      targetTone: targetTone || 'Professional & Humble',
      defaultSignature: defaultSignature || '',
      customToneInstruction: customToneInstruction || '',
      defaultLength: defaultLength || 'medium',
      createdAt: existing?.createdAt || new Date().toISOString(),
    };
    const saved = db.saveArtistProfile(profile);
    res.json(saved);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Demos endpoints
app.get('/api/demos', (req: Request, res: Response) => {
  try {
    const userId = resolveUser(req);
    const list = db.getDemos(userId);
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/demos', (req: Request, res: Response) => {
  try {
    const userId = resolveUser(req);
    const { title, link, description, mood, genre } = req.body;
    if (!title || !link) {
      res.status(400).json({ error: 'Title and streaming link are required.' });
      return;
    }
    const demo: Demo = {
      id: 'demo_' + Math.random().toString(36).substr(2, 9),
      userId,
      title,
      link,
      description: description || '',
      mood: mood || 'Energetic',
      genre: genre || 'Electronic',
      createdAt: new Date().toISOString(),
    };
    const saved = db.createDemo(demo);
    res.json(saved);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/demos/:id', (req: Request, res: Response) => {
  try {
    const success = db.deleteDemo(req.params.id);
    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/demos/:id', (req: Request, res: Response) => {
  try {
    const userId = resolveUser(req);
    const { title, link, description, mood, genre } = req.body;
    if (!title || !link) {
      res.status(400).json({ error: 'Title and streaming link are required.' });
      return;
    }
    const updated = db.updateDemo(req.params.id, { title, link, description, mood, genre });
    if (!updated) {
      res.status(404).json({ error: 'Demo not found.' });
      return;
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Custom direct targets endpoints
app.get('/api/targets', (req: Request, res: Response) => {
  try {
    const userId = resolveUser(req);
    let list = db.getTargets(userId);
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/targets', (req: Request, res: Response) => {
  try {
    const userId = resolveUser(req);
    const { name, email, type, details } = req.body;
    if (!name || !email || !type) {
      res.status(400).json({ error: 'Name, email and type are required fields.' });
      return;
    }
    const target: Target = {
      id: 'target_' + Math.random().toString(36).substr(2, 9),
      userId,
      name,
      email,
      type,
      details: details || '',
      createdAt: new Date().toISOString(),
    };
    const saved = db.createTarget(target);
    res.json(saved);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/targets/:id', (req: Request, res: Response) => {
  try {
    const success = db.deleteTarget(req.params.id);
    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Labels from Seed/Global Bank
app.get('/api/labels', (req: Request, res: Response) => {
  try {
    const userId = resolveUser(req);
    const list = db.getLabels(userId);
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle Favorite status on Label
app.post('/api/labels/:id/favorite', (req: Request, res: Response) => {
  try {
    const userId = resolveUser(req);
    const labelId = req.params.id;
    const isFav = db.toggleFavoriteLabel(userId, labelId);
    res.json({ success: true, isFavorite: isFav });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Outreaches log / stats
app.get('/api/outreach', (req: Request, res: Response) => {
  try {
    const userId = resolveUser(req);
    const list = db.getOutreaches(userId);
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/outreach/stats', (req: Request, res: Response) => {
  try {
    const userId = resolveUser(req);
    const outreaches = db.getOutreaches(userId);
    const todayCount = db.getTodayOutreachCount(userId);
    
    // Plan calculation
    const user = db.getUser(userId);
    const plan = user?.plan || 'free_trial';
    const startDate = user?.planStartDate ? new Date(user.planStartDate) : (user?.createdAt ? new Date(user.createdAt) : new Date());
    
    // trial countdown calculation
    const diffMs = (startDate.getTime() + 14 * 24 * 60 * 60 * 1000) - Date.now();
    const planDaysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    let dailyPitchLimit = 1;
    if (plan === 'starter') dailyPitchLimit = 3;
    if (plan === 'pro') dailyPitchLimit = 999;

    res.json({
      totalOutreach: outreaches.length,
      draftsCount: outreaches.filter(o => o.status === 'draft').length,
      sentCount: outreaches.filter(o => o.status === 'sent').length,
      outreachToday: todayCount,
      plan,
      planDaysRemaining,
      dailyPitchLimit
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Gemini Outreach Strategy & Email Generation Endpoint
app.post('/api/gemini/generate', async (req: Request, res: Response) => {
  try {
    const userId = resolveUser(req);
    const { demoId, targetId } = req.body;

    if (!demoId || !targetId) {
      res.status(400).json({ error: 'Missing demoId or targetId' });
      return;
    }

    const demo = db.getDemo(demoId);
    const profile = db.getArtistProfile(userId);

    // Dynamic target metadata loading
    let targetName = '';
    let targetEmail = '';
    let targetDetails = '';
    let targetType = 'label';

    if (targetId.startsWith('label_')) {
      const allLabels = db.getLabels(userId);
      const matched = allLabels.find(l => l.id === targetId);
      if (matched) {
        targetName = matched.name;
        targetEmail = matched.email;
        targetDetails = `Prominent record label specializing in ${matched.genre} based in ${matched.region}. Background details: ${matched.notes}. Suggested fit match: ${matched.bestFitDescription}`;
        targetType = 'label';
      }
    } else {
      const target = db.getTarget(targetId);
      if (target) {
        targetName = target.name;
        targetEmail = target.email;
        targetDetails = target.details;
        targetType = target.type;
      }
    }

    if (!demo || !targetName) {
      res.status(400).json({ error: 'Could not locate Demo or Target context in storage' });
      return;
    }

    const artistName = profile?.artistName || 'Independent Artist';
    const artistBio = profile?.bio || 'An up-and-coming musical artist expressing high fidelity acoustics.';
    const genres = [demo.genre, ...(profile?.genres || [])].filter(Boolean).join(', ');
    const signatureTone = profile?.targetTone || 'Professional & Humble';
    const customSignature = profile?.defaultSignature || artistName;

    const customInstruction = profile?.customToneInstruction ? `\nAdditional custom AI writing / tone style instruction from artist: "${profile.customToneInstruction}".` : '';
    const lengthGuide = profile?.defaultLength || 'medium';
    const lengthPrompt = lengthGuide === 'small' 
      ? 'Ensure the email content is extremely brief, compact and to-the-point—maximum of 1 very short paragraph of around 80-100 words.' 
      : lengthGuide === 'larger' 
        ? 'Allow the pitch to be slightly more detailed and descriptive—around 3 paragraphs of around 200-240 words.' 
        : 'Keep the paragraph structure highly structured and clean—around 2 paragraphs totaling around 140-170 words.';

    const systemPrompt = `You are an elite music publicist, A&R partner, and copywriter representing professional musicians submitting high quality demo music.
Your goal is to write a highly compelling, personalized, concise pitch email.

Guidelines for pitching:
1. Subject line must be extremely modern, sleek, and capture A&R attention without sounding like spam (e.g. Include: DEMO Submission, Track Genre/Vibe, and Artist Name: "${artistName}").
2. Human-written tone: No cheesy sales pitches, no "I hope this email finds you well," and no generic, boilerplate marketing slogans.
3. Length requirement: ${lengthPrompt}
4. Keep the streaming link highlighted clearly.
5. Personalize by directly mentioning Curator/Label details. Do not say "Dear Curator/A&R", write to the specific company name ("${targetName}") or their focus and explain why this demo fits them.
6. Match the requested artist outreach signature tone: "${signatureTone}"${customInstruction}.
7. Integrate the artist signature at the very end: "Regards, ${customSignature}" or "Best, ${customSignature}".

Return the output formatted strictly as a JSON object with:
"subject": string (clean, striking),
"body": string (complete, friendly, formatted with appropriate line breaks),
"strategy": string (a short, single-sentence annotation explaining why this personalized pitch is strategically effective for this curator).`;

    const instructions = `
    Artist Info:
    - Artist / Group Name: "${artistName}"
    - Bio is: ${artistBio}
    - Preset Signature: ${customSignature}
    - Aesthetic / Genres: ${genres}
    
    Track Details:
    - Title: "${demo.title}"
    - Sound URL: ${demo.link}
    - Mood / Vibe: ${demo.mood}
    - Musical Description: ${demo.description}
    
    Target Contact:
    - Receiver Name: ${targetName}
    - Contact Email: ${targetEmail}
    - Category / Focus: ${targetType}
    - Context details: ${targetDetails}
    `;

    const ai = getGemini();
    const result = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: instructions,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: {
              type: Type.STRING,
              description: "A clean, striking, modern A&R-focused email subject line."
            },
            body: {
              type: Type.STRING,
              description: "The complete, formatted email draft body containing paragraph breaks."
            },
            strategy: {
              type: Type.STRING,
              description: "A single-sentence analysis explanation of the curator connection strategy."
            }
          },
          required: ["subject", "body", "strategy"]
        },
        temperature: 0.75,
      }
    });

    const parsed = JSON.parse(result.text || '{}');
    
    // Save generated outreach draft to local database to respect limits
    const outreach: Outreach = {
      id: 'outreach_' + Math.random().toString(36).substr(2, 9),
      userId,
      demoId,
      targetId,
      targetName,
      targetEmail,
      status: 'draft',
      emailSubject: parsed.subject || `DEMO: ${demo.title} - Submission for ${targetName}`,
      emailBody: parsed.body || `Hey ${targetName},\n\nCheck out my new demo "${demo.title}" here: ${demo.link}\n\nBest,\n${customSignature}`,
      createdAt: new Date().toISOString(),
    };
    db.createOutreach(outreach);

    res.json({
      outreach,
      strategy: parsed.strategy || 'Custom personalized submission pitch alignment.'
    });

  } catch (error: any) {
    console.error('Error in email intelligence generator:', error);
    res.status(500).json({ error: error.message });
  }
});

// Gemini Alter/Revise Email Pitch endpoint
app.post('/api/gemini/alter', async (req: Request, res: Response) => {
  try {
    const userId = resolveUser(req);
    const { originalSubject, originalBody, instruction, length, outreachId } = req.body;

    if (!originalSubject || !originalBody || !instruction) {
      res.status(400).json({ error: 'Missing originalSubject, originalBody, or instruction' });
      return;
    }

    const systemPrompt = `You are an elite music industry publicist and copywriter helping an artist revise, polish, and alter their curated email pitch.
Your goal is to alter the provided email subject and body contents based on the user's instructions while keeping the essential elements intact (especially the streaming music URL link!).

The length / text amount category specified is: "${length || 'medium'}".
Strictly adhere to these word count size limits based on the requested length selection:
- "small": extremely concise, fast-to-read, absolute point-blank pitch. Max 1-2 short paragraphs, totaling less than 100 words.
- "medium": standard balanced pitch size. Richer than 'small' but still concise. Max 2 short paragraphs, totaling 120-170 words.
- "larger": detailed, elegant, informative storytelling style. Expanded track detail/concept where appropriate. Max 3 paragraphs, totaling 180-260 words.

User Instruction to modify the pitch:
"${instruction}"

Output format must be strictly a JSON object matching this schema:
{
  "subject": "revised email subject line",
  "body": "revised email body containing line breaks and paragraph separations",
  "strategy": "a single-sentence concise explanation analyzing the effectiveness of the updated strategy"
}`;

    const contents = `
    Original Email Subject: "${originalSubject}"
    Original Email Body:
    -----------------
    ${originalBody}
    -----------------
    
    Revision Directive: "${instruction}"
    Requested Size Guideline: "${length || 'medium'}"
    `;

    const ai = getGemini();
    const result = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: {
              type: Type.STRING,
              description: "A clean, striking, modern revised A&R-focused email subject line."
            },
            body: {
              type: Type.STRING,
              description: "The complete, formatted revised email draft body containing paragraph breaks."
            },
            strategy: {
              type: Type.STRING,
              description: "A single-sentence analysis explanation of the updated curator connection strategy."
            }
          },
          required: ["subject", "body", "strategy"]
        },
        temperature: 0.75,
      }
    });

    const parsed = JSON.parse(result.text || '{}');
    
    // Update local database if outreachId is supplied and exists
    if (outreachId) {
      const outreachCountObj = db.getOutreach(outreachId);
      if (outreachCountObj) {
        if (parsed.subject) outreachCountObj.emailSubject = parsed.subject;
        if (parsed.body) outreachCountObj.emailBody = parsed.body;
        db.updateOutreach(outreachCountObj);
      }
    }

    res.json({
      subject: parsed.subject || originalSubject,
      body: parsed.body || originalBody,
      strategy: parsed.strategy || 'Custom modified and aligned pitch.'
    });

  } catch (error: any) {
    console.error('Error in email pitch alteration generator:', error);
    res.status(500).json({ error: error.message });
  }
});

// GUARDRAIL check helper
app.get('/api/outreach/limit-check', (req: Request, res: Response) => {
  try {
    const userId = resolveUser(req);
    const user = db.getUser(userId);
    const plan = user?.plan || 'free_trial';
    const count = db.getTodayOutreachCount(userId);
    
    let limit = 1;
    if (plan === 'starter') limit = 3;
    if (plan === 'pro') limit = 999;

    res.json({
      todayCount: count,
      limit,
      plan,
      limitReached: count >= limit,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Gmail Draft API (Acts as proxy with end user token)
app.post('/api/gmail/draft', async (req: Request, res: Response) => {
  try {
    const userId = resolveUser(req);
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing explicit Google OAuth Access Token in headers' });
      return;
    }
    const token = authHeader.substring(7);

    const { outreachId, emailSubject, emailBody } = req.body;
    const outreach = db.getOutreach(outreachId);
    if (!outreach) {
      res.status(404).json({ error: 'Outreach not found' });
      return;
    }

    if (emailSubject !== undefined) outreach.emailSubject = emailSubject;
    if (emailBody !== undefined) outreach.emailBody = emailBody;
    db.updateOutreach(outreach);

    if (token === 'email-password-offline-token') {
      outreach.gmailDraftId = 'simulated_draft_' + Math.random().toString(36).substr(2, 9);
      db.updateOutreach(outreach);
      res.json({
        success: true,
        draftId: outreach.gmailDraftId,
        outreach
      });
      return;
    }

    // Resolve email address from either custom target or label bank
    let recipientEmail = outreach.targetEmail || '';
    if (!recipientEmail) {
      if (outreach.targetId.startsWith('label_')) {
        const allL = db.getLabels(userId);
        const match = allL.find(l => l.id === outreach.targetId);
        if (match) recipientEmail = match.email;
      } else {
        const match = db.getTarget(outreach.targetId);
        if (match) recipientEmail = match.email;
      }
    }

    if (!recipientEmail) {
      res.status(404).json({ error: 'Target recipient contact not found in Database' });
      return;
    }

    const rawMime = buildMimeMessage({
      to: recipientEmail,
      subject: outreach.emailSubject,
      body: outreach.emailBody
    });

    // Request Gmail drafts endpoint
    const gmailRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/drafts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: {
          raw: rawMime
        }
      })
    });

    if (!gmailRes.ok) {
      const errText = await gmailRes.text();
      console.error('Failed to create Gmail draft:', errText);
      res.status(gmailRes.status).json({ error: `Gmail draft creation failed: ${errText}` });
      return;
    }

    const draftData = await gmailRes.json();
    outreach.gmailDraftId = draftData.id;
    db.updateOutreach(outreach);

    res.json({
      success: true,
      draftId: draftData.id,
      outreach
    });

  } catch (error: any) {
    console.error('Error creating Gmail draft:', error);
    res.status(500).json({ error: error.message });
  }
});

// Gmail SEND API (Uses the draftId or creates and sends directly)
app.post('/api/gmail/send', async (req: Request, res: Response) => {
  try {
    const userId = resolveUser(req);
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing explicit Google OAuth Access Token in headers' });
      return;
    }
    const token = authHeader.substring(7);

    // Plan check guardrail
    const user = db.getUser(userId);
    const plan = user?.plan || 'free_trial';
    const limit = plan === 'free_trial' ? 1 : (plan === 'starter' ? 3 : 999);
    const count = db.getTodayOutreachCount(userId);

    if (count >= limit) {
      res.status(400).json({ 
        error: `Guardrail Limit Reached: Under your ${plan.replace('_', ' ')} plan, you have hit your limit of ${limit} sent outreach(es) for today. Upgrade to the Pro Plan for unlimited pitching and priority database access.` 
      });
      return;
    }

    const { outreachId, emailSubject, emailBody } = req.body;
    const outreach = db.getOutreach(outreachId);
    if (!outreach) {
      res.status(404).json({ error: 'Outreach not found' });
      return;
    }

    if (emailSubject !== undefined) outreach.emailSubject = emailSubject;
    if (emailBody !== undefined) outreach.emailBody = emailBody;
    db.updateOutreach(outreach);

    if (token === 'email-password-offline-token') {
      outreach.status = 'sent';
      outreach.sentAt = new Date().toISOString();
      db.updateOutreach(outreach);
      res.json({
        success: true,
        outreach
      });
      return;
    }

    let recipientEmail = outreach.targetEmail || '';
    if (!recipientEmail) {
      if (outreach.targetId.startsWith('label_')) {
        const allL = db.getLabels(userId);
        const match = allL.find(l => l.id === outreach.targetId);
        if (match) recipientEmail = match.email;
      } else {
        const match = db.getTarget(outreach.targetId);
        if (match) recipientEmail = match.email;
      }
    }

    if (!recipientEmail) {
      res.status(404).json({ error: 'Recipient target not found' });
      return;
    }

    let gmailSendRes;

    // Is there a draft we can send directly?
    if (outreach.gmailDraftId) {
      // Send draft via gmail v1 me/drafts/send
      gmailSendRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/drafts/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: outreach.gmailDraftId
        })
      });
    } else {
      // Create and send immediately
      const rawMime = buildMimeMessage({
        to: recipientEmail,
        subject: outreach.emailSubject,
        body: outreach.emailBody
      });
      gmailSendRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          raw: rawMime
        })
      });
    }

    if (!gmailSendRes.ok) {
      const errText = await gmailSendRes.text();
      console.error('Gmail send call failed:', errText);
      res.status(gmailSendRes.status).json({ error: `Gmail transmission failed: ${errText}` });
      return;
    }

    const sendData = await gmailSendRes.json();
    
    // Log / update outreach send status successfully
    outreach.status = 'sent';
    outreach.sentAt = new Date().toISOString();
    db.updateOutreach(outreach);

    res.json({
      success: true,
      messageId: sendData.id,
      outreach
    });

  } catch (error: any) {
    console.error('Error sending Gmail submission:', error);
    res.status(500).json({ error: error.message });
  }
});

// App fallback and Vite developer middlewares
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server successfully started. Listening on http://localhost:${PORT}`);
  });
}

startServer();
