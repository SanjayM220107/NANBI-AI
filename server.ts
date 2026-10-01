import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize GoogleGenAI
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Load verified schemes dataset
let verifiedSchemes: any[] = [];
try {
  const dataPath = path.resolve(__dirname, 'data/schemes.json');
  if (fs.existsSync(dataPath)) {
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    verifiedSchemes = JSON.parse(rawData);
  }
} catch (e) {
  console.warn('Could not load schemes.json directly on server init:', e);
}

// System instruction prompt builder
function buildSystemInstruction(
  language: 'ta' | 'en',
  userProfile?: {
    name?: string;
    ageGroup?: string;
    state?: string;
    district?: string;
  },
  selectedScheme?: any
) {
  const profileInfo = userProfile
    ? `User Profile:
- Name: ${userProfile.name || 'Friend'}
- Age Group: ${userProfile.ageGroup || 'Unspecified'}
- State: ${userProfile.state || 'Tamil Nadu'}
- District: ${userProfile.district || 'Unspecified'}`
    : 'No profile specified.';

  const selectedSchemeInfo = selectedScheme
    ? `Currently Discussed Scheme:
Name (Tamil): ${selectedScheme.nameTamil}
Name (English): ${selectedScheme.nameEnglish}
Category: ${selectedScheme.category}
Scope: ${selectedScheme.scope} (${selectedScheme.state})
Department: ${selectedScheme.department?.english} / ${selectedScheme.department?.tamil}
Description: ${selectedScheme.descriptionEnglish} | ${selectedScheme.descriptionTamil}
Eligibility: ${selectedScheme.eligibility?.summaryEnglish} | ${selectedScheme.eligibility?.summaryTamil}
Benefits: ${selectedScheme.benefits?.summaryEnglish} | ${selectedScheme.benefits?.summaryTamil}
Documents: ${selectedScheme.documents?.map((d: any) => `${d.nameEnglish} (${d.nameTamil}) - ${d.whyRequiredEnglish}`).join(', ')}
Application Steps:
${selectedScheme.applicationStepsEnglish?.join('\n')}
Official Portal: ${selectedScheme.applicationPortalName} (${selectedScheme.officialApplyUrl || 'Not available'})`
    : 'No specific scheme currently opened.';

  const allSchemesSummary = verifiedSchemes
    .map(
      (s) =>
        `- ID: ${s.id} | ${s.nameEnglish} (${s.nameTamil}) | Category: ${s.category} | Scope: ${s.scope} (${s.state}) | Benefits: ${s.benefits?.summaryEnglish} | Eligibility: ${s.eligibility?.summaryEnglish}`
    )
    .join('\n');

  return `You are NANBI (நண்பி - "உங்கள் அரசு தோழி" / "Your Government Companion").
You are a warm, kind, patient female digital companion helping women discover and navigate Indian government schemes, especially in Tamil Nadu.
The user may have little or no digital literacy, has never used a government website, and may find government jargon intimidating.

${profileInfo}

${selectedSchemeInfo}

VERIFIED SCHEME DATABASE:
${allSchemesSummary}

CRITICAL RULES:
1. Primary Language: Respond in ${language === 'ta' ? 'simple, pure, spoken Tamil (தமிழ்)' : 'simple, clear, friendly English'}.
2. Conversational Style: Be patient, empathetic, respectful, and step-by-step. Speak like an educated, supportive elder sister or friend. Avoid bureaucratic or academic jargon.
3. DIGITAL ACCESSIBILITY: Explain actions one at a time. Never use terms like "navigate to the portal URL" or "upload multipart form data". Instead, say "கீழே உள்ள பொத்தானை அழுத்துங்கள், அரசு தளம் திறக்கும்" ("Press the button below, the official site will open") or "உங்கள் ஆவணத்தின் புகைப்படத்தை தேர்வு செய்யுங்கள்" ("Select the photo of your document").
4. STRICT TRUTH & SAFETY:
   - Ground all advice strictly in the VERIFIED SCHEME DATABASE above.
   - NEVER invent schemes, benefits, documents, eligibility conditions, deadlines, or websites.
   - NEVER make up an application URL.
   - If information is not in the verified data or is unknown, say:
     ${language === 'ta' ? '"இந்தத் தகவல் எனக்கு உறுதிப்படுத்தப்படவில்லை. அதிகாரப்பூர்வ அரசு இணையதளத்தைப் பார்க்கவும்."' : '"I could not verify this information. Please check the official government website."'}
   - NEVER ask for password, OTP, ATM PIN, UPI PIN, or bank credentials.
5. LENGTH: Keep responses concise, well-spaced, and easy to read on mobile or listen via speech synthesis. Use bullet points or numbered steps with emojis where helpful.`;
}

// Grounded fallback response generator using verified dataset
function generateGroundedSchemeResponse(
  prompt: string,
  language: 'ta' | 'en',
  userProfile?: any,
  selectedScheme?: any
): string {
  const isTamil = language === 'ta';
  const query = prompt.toLowerCase();

  // If a scheme was specifically selected in modal/card
  if (selectedScheme) {
    if (isTamil) {
      return `🌸 **${selectedScheme.nameTamil}** பற்றிய சரிபார்க்கப்பட்ட அரசு விவரம்:

💰 **முக்கிய பலன்**: ${selectedScheme.benefits?.summaryTamil}
📋 **தகுதி வரம்பு**: ${selectedScheme.eligibility?.summaryTamil}

📄 **தேவையான ஆவணங்கள்**:
${selectedScheme.documents?.map((d: any) => `• ${d.nameTamil} (${d.whyRequiredTamil})`).join('\n') || '• ஆதார் அட்டை, குடும்ப அட்டை, வங்கி கணக்கு புத்தகம்'}

🏛️ **விண்ணப்பிக்கும் முறை**:
${selectedScheme.applicationStepsTamil?.map((s: string, idx: number) => `${idx + 1}. ${s}`).join('\n') || 'அருகிலுள்ள இ-சேவை மையம் அல்லது அரசு போர்ட்டலில் விண்ணப்பிக்கலாம்.'}

🔗 அதிகாரப்பூர்வ தளம்: ${selectedScheme.applicationPortalName}`;
    } else {
      return `🌸 Verified information for **${selectedScheme.nameEnglish}**:

💰 **Key Benefit**: ${selectedScheme.benefits?.summaryEnglish}
📋 **Eligibility**: ${selectedScheme.eligibility?.summaryEnglish}

📄 **Required Documents**:
${selectedScheme.documents?.map((d: any) => `• ${d.nameEnglish} (${d.whyRequiredEnglish})`).join('\n')}

🏛️ **How to Apply**:
${selectedScheme.applicationStepsEnglish?.map((s: string, idx: number) => `${idx + 1}. ${s}`).join('\n')}

🔗 Official Portal: ${selectedScheme.applicationPortalName}`;
    }
  }

  // Kalaignar Magalir Urimai Thittam match
  if (
    query.includes('magalir') ||
    query.includes('மகளிர்') ||
    query.includes('உரிமை') ||
    query.includes('1000') ||
    query.includes('thousand')
  ) {
    const s = verifiedSchemes.find((item) => item.id === 'kalaignar-magalir-urimai');
    if (s) return generateGroundedSchemeResponse(prompt, language, userProfile, s);
  }

  // Pudhumai Penn match
  if (
    query.includes('pudhumai') ||
    query.includes('புதுமை') ||
    query.includes('college') ||
    query.includes('school') ||
    query.includes('மாணவி')
  ) {
    const s = verifiedSchemes.find((item) => item.id === 'pudhumai-penn');
    if (s) return generateGroundedSchemeResponse(prompt, language, userProfile, s);
  }

  // Widow Pension match
  if (
    query.includes('widow') ||
    query.includes('விதவை') ||
    query.includes('destitute')
  ) {
    const s = verifiedSchemes.find((item) => item.id === 'destitute-widow-pension');
    if (s) return generateGroundedSchemeResponse(prompt, language, userProfile, s);
  }

  // Document inquiry match
  if (
    query.includes('document') ||
    query.includes('ஆவணம்') ||
    query.includes('certificate') ||
    query.includes('சான்றிதழ்')
  ) {
    if (isTamil) {
      return `📄 **அரசு திட்டங்களுக்கு பொதுவாக தேவைப்படும் 4 முக்கிய ஆவணங்கள்**:

1. **ஆதார் அட்டை (Aadhaar Card)**: உங்கள் அடையாளத்தை உறுதிப்படுத்த.
2. **குடும்ப அட்டை (Ration Card)**: குடும்ப உறுப்பினர்கள் மற்றும் வசிப்பிடத்தை உறுதிப்படுத்த.
3. **வங்கி கணக்கு புத்தகம் (Bank Passbook)**: அரசின் நிதி உதவி உங்கள் வங்கிக் கணக்கில் நேரடியாக (DBT) வரவு வைக்கப்பட.
4. **வருமானச் சான்றிதழ் (Income Certificate)**: இ-சேவை மையத்தில் எளிதாக பெறலாம்.

💡 எந்த ஆவணத்திலும் இடைத்தரகர்களிடம் பணம் கொடுக்க வேண்டாம். இ-சேவை மையத்தில் மட்டுமே விண்ணப்பிக்கவும்.`;
    } else {
      return `📄 **4 Essential Documents Generally Required for Govt Schemes**:

1. **Aadhaar Card**: Confirms identity and links your profile.
2. **Ration Card / Smart Card**: Confirms family members and residence.
3. **Bank Passbook**: Required for Direct Benefit Transfer (DBT) into your personal account.
4. **Income Certificate**: Readily issued by Tamil Nadu e-Sevai centers.

💡 Never pay middlemen or share OTPs with anyone. Apply only via authorized e-Sevai centers or official portals.`;
    }
  }

  // How to apply inquiry match
  if (
    query.includes('apply') ||
    query.includes('எப்படி') ||
    query.includes('விண்ணப்ப') ||
    query.includes('esevai')
  ) {
    if (isTamil) {
      return `🏛️ **அரசு திட்டங்களுக்கு விண்ணப்பிக்கும் 3 எளிய வழிகள்**:

1. **அருகிலுள்ள இ-சேவை மையம் (e-Sevai Center)**:
   உங்கள் ஆதார், குடும்ப அட்டை, வங்கி கணக்கு புத்தகத்தை எடுத்துச் சென்று எளிதாக விண்ணப்பிக்கலாம்.
2. **அதிகாரப்பூர்வ தமிழ்நாடு அரசு தளம்**:
   https://tnesevai.tn.gov.in மூலம் உங்கள் சொந்த மொபைல் எண்ணை பதிவு செய்து விண்ணப்பிக்கலாம்.
3. **நண்பி ஆப் வழிகாட்டல்**:
   முகப்பு திரையில் உங்களுக்கு தேவையான திட்டத்தின் கீழ் உள்ள 'விண்ணப்பிப்பது எப்படி' பொத்தானைத் தொடுங்கள். படி படியாக வழிகாட்டுவேன்.`;
    } else {
      return `🏛️ **3 Simple Ways to Apply for Government Schemes**:

1. **Nearest e-Sevai Center (இ-சேவை மையம்)**:
   Bring your Aadhaar, Ration Card, and Bank Passbook to the nearest center for direct assisted application.
2. **Tamil Nadu e-Sevai Portal**:
   Visit https://tnesevai.tn.gov.in and log in with your mobile OTP to apply.
3. **NANBI Guidance**:
   Select any scheme on the home screen and tap "How to Apply" for step-by-step instructions.`;
    }
  }

  // General recommendation based on available schemes
  const tnTopSchemes = verifiedSchemes.filter((s) => s.scope === 'state').slice(0, 3);
  if (isTamil) {
    return `🌸 **${userProfile?.name ? userProfile.name + ' அவர்களுக்கு' : 'வணக்கம்'}!**

உங்கள் சுயவிவரம் (${userProfile?.ageGroup || 'அனைத்து வயது'}, ${userProfile?.district || 'தமிழ்நாடு'}) அடிப்படையில் பரிந்துரைக்கப்படும் முக்கிய திட்டங்கள்:

${tnTopSchemes.map((s) => `• **${s.nameTamil}**: ${s.benefits?.summaryTamil}`).join('\n\n')}

💡 ஏதேனும் ஒரு குறிப்பிட்ட திட்டத்தைப் பற்றி மேலும் தெரிந்துகொள்ள முகப்புத் திரையில் அதன் அட்டையைத் தொடவும் அல்லது இங்கே கேட்கவும்!`;
  } else {
    return `🌸 **Hello ${userProfile?.name ? userProfile.name : 'Friend'}!**

Based on your profile (${userProfile?.ageGroup || 'All Ages'}, ${userProfile?.district || 'Tamil Nadu'}), here are prioritized schemes for you:

${tnTopSchemes.map((s) => `• **${s.nameEnglish}**: ${s.benefits?.summaryEnglish}`).join('\n\n')}

💡 Tap on any scheme card on the home screen or ask me more details about any specific program!`;
  }
}

// POST /api/gemini/chat
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  const {
    prompt,
    language = 'ta',
    userProfile,
    selectedScheme,
    conversationHistory = [],
  } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    res.status(400).json({ success: false, error: 'Prompt is required' });
    return;
  }

  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set in environment. Using grounded fallback.');
    const fallbackText = generateGroundedSchemeResponse(
      prompt,
      language === 'ta' ? 'ta' : 'en',
      userProfile,
      selectedScheme
    );
    res.json({
      success: true,
      text: fallbackText,
      grounded: true,
    });
    return;
  }

  const systemInstruction = buildSystemInstruction(
    language === 'ta' ? 'ta' : 'en',
    userProfile,
    selectedScheme
  );

  // Format chat contents
  const contents: any[] = [];
  if (Array.isArray(conversationHistory)) {
    for (const msg of conversationHistory.slice(-6)) {
      contents.push({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.text }],
      });
    }
  }
  contents.push({
    role: 'user',
    parts: [{ text: prompt }],
  });

  // Attempt with primary model: gemini-3.8-flash
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.3,
      },
    });

    const generatedText = response.text || '';
    res.json({
      success: true,
      text: generatedText,
    });
    return;
  } catch (error: any) {
    console.warn('Primary model gemini-3.8-flash failed or rate limited:', error?.message);

    // Fallback attempt with secondary model: gemini-2.5-flash
    try {
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.3,
        },
      });

      const fallbackGeneratedText = fallbackResponse.text || '';
      res.json({
        success: true,
        text: fallbackGeneratedText,
      });
      return;
    } catch (secondaryError: any) {
      console.warn(
        'Secondary model gemini-2.5-flash failed or rate limited:',
        secondaryError?.message
      );

      // Quota exhausted on both: Use high-fidelity verified deterministic scheme knowledge engine
      const groundedText = generateGroundedSchemeResponse(
        prompt,
        language === 'ta' ? 'ta' : 'en',
        userProfile,
        selectedScheme
      );

      res.status(200).json({
        success: true,
        text: groundedText,
        quotaExceeded: true,
      });
    }
  }
});

// Setup Vite or Static File Serving
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌸 NANBI Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start NANBI server:', err);
  process.exit(1);
});
