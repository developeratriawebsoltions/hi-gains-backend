# AI Talking Fitness Coach - Requirements

## Overview

The AI coach takes a user question (text or voice), finds or generates the right exercise video, and returns a personalized spoken explanation automatically.

---

## Current Stack (Already Built)

- Backend: Node.js + Express + TypeScript
- Database: MySQL + Prisma ORM
- Auth: JWT
- Models: User, UserProfile, Workout

---

## What Needs to Be Built

### Phase 1 - AI Chat (Core)

**Goal:** User sends a message, AI parses it and responds with coaching advice.

**New API:** `POST /api/v1/ai/chat`

**AI parses the message and extracts:**
- Exercise name (e.g., dumbbell curl)
- Variation (standard, wide grip, etc.)
- Equipment (dumbbells, barbell, bodyweight)
- Difficulty (beginner / intermediate / advanced)
- Camera angle (front, side, top)

**Service needed:** OpenAI API (GPT-4o or GPT-4-turbo)

**New files to create:**
```
src/services/ai.service.ts       - OpenAI call + response parsing
src/controllers/ai.controller.ts - Handle /ai/chat route
src/routes/ai.routes.ts          - Register routes
src/schemas/ai.schema.ts         - Zod validation for chat input
```

---

### Phase 2 - Video Library (Database)

**Goal:** Store approved exercise videos. Before generating a new video, search the library first.

**New Prisma Model:**
```prisma
model ExerciseVideo {
  id           String   @id @default(uuid())
  exercise     String   // "dumbbell curl"
  variation    String   // "standard"
  equipment    String   // "dumbbells"
  difficulty   String   // "beginner"
  cameraAngle  String   // "front"
  videoUrl     String   // S3 / R2 URL
  thumbnailUrl String?
  captions     String?  @db.Text
  isApproved   Boolean  @default(false)
  createdAt    DateTime @default(now())
}
```

**Search logic:**
1. AI extracts exercise details from user message
2. Query DB: match exercise + equipment + variation + difficulty + cameraAngle
3. If match found → go to Phase 3a (Fetch and Personalize)
4. If no match → go to Phase 3b (Generate New Video)

---

### Phase 3a - Fetch and Personalize (Match Found)

**Goal:** Return the existing video with a personalized voice explanation.

**Steps:**
1. Retrieve video URL from storage (S3 / Cloudflare R2)
2. Generate personalized voice explanation using TTS
3. Add user-specific instructions (e.g., "slower for beginner")

**Service needed:** Text-to-Speech API
- Option A: OpenAI TTS (`tts-1` model)
- Option B: ElevenLabs (more natural voice)

**API Response:**
```json
{
  "videoUrl": "https://...",
  "audioUrl": "https://...",
  "captions": "Stand with feet shoulder-width apart...",
  "tips": ["Keep your back straight", "Core engaged"]
}
```

---

### Phase 3b - Generate New Video (No Match)

**Goal:** If no video exists, generate one using a Video Generation API.

**Steps:**
1. Create a generation job with a detailed prompt
2. Call Video Generation API
3. Save video to cloud storage (S3 / R2)
4. Save metadata to DB (ExerciseVideo model)
5. Send to Quality Check (Phase 4)

**Service options:**
- Runway ML Gen-3
- Pika Labs
- Kling AI

**New files:**
```
src/services/videoGeneration.service.ts
src/services/storage.service.ts          - S3 / R2 upload
```

---

### Phase 4 - Quality Check

**Goal:** Automatically verify the generated video before showing to user.

**Checks:**
- Video integrity (not corrupted)
- Correct exercise and equipment visible
- Movement accuracy (AI vision analysis)
- Safety check (no risky form)

**Pass:** Save and index the video (Phase 5)
**Fail:** Flag for human review OR regenerate

**Service needed:** OpenAI Vision API (GPT-4o with image frames)

---

### Phase 5 - Store and Index

**Goal:** Save approved video for future reuse.

**Steps:**
1. Upload video to S3 / Cloudflare R2
2. Save metadata to MySQL (ExerciseVideo model)
3. Add tags, thumbnails, captions, searchable details

**New files:**
```
src/services/storage.service.ts   - Upload to S3/R2
src/jobs/videoIndex.job.ts        - Background indexing job
```

---

### Phase 6 - AI Coach Response

**Goal:** Return video + spoken explanation to the user.

**Response includes:**
- Video URL (from storage)
- Audio URL (TTS explanation)
- Step-by-step captions
- Coaching tips

**Frontend plays:**
- Video with avatar trainer
- Voice explanation audio
- Interactive options (Repeat, Slower, Beginner version, Side view)

---

### Phase 7 - Follow-up Questions

**Goal:** User can ask follow-up questions after watching.

**Examples:**
- "Show me the side view"
- "Slower version"
- "Beginner version"
- "More details"

**Implementation:**
- Pass `conversationHistory` array in each request
- OpenAI maintains context across messages
- Each follow-up re-runs the search/generate flow with new params

---

## New Prisma Models Needed

```prisma
model ExerciseVideo {
  id           String   @id @default(uuid())
  exercise     String
  variation    String   @default("standard")
  equipment    String
  difficulty   String   @default("beginner")
  cameraAngle  String   @default("front")
  videoUrl     String
  thumbnailUrl String?
  captions     String?  @db.Text
  isApproved   Boolean  @default(false)
  createdAt    DateTime @default(now())
}

model AIChatSession {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  messages  Json     // [{role, content}]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## New Environment Variables Needed

```env
OPENAI_API_KEY=
OPENAI_TTS_MODEL=tts-1
OPENAI_CHAT_MODEL=gpt-4o

# Cloud Storage (pick one)
CLOUDFLARE_R2_BUCKET=
CLOUDFLARE_R2_ACCESS_KEY=
CLOUDFLARE_R2_SECRET_KEY=
CLOUDFLARE_R2_ENDPOINT=

# OR AWS S3
AWS_S3_BUCKET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=

# Video Generation (pick one)
RUNWAY_API_KEY=
# OR
PIKA_API_KEY=

# Optional: ElevenLabs for better TTS
ELEVENLABS_API_KEY=
```

---

## New npm Packages Needed

```bash
npm install openai          # AI chat + TTS + vision
npm install @aws-sdk/client-s3  # S3 / R2 storage
npm install bull             # Background job queue (Redis)
npm install ioredis          # Redis client
```

---

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/ai/chat` | Send message, get video + audio response |
| GET | `/api/v1/ai/sessions` | Get user's chat history |
| GET | `/api/v1/videos` | Browse exercise video library |
| GET | `/api/v1/videos/search` | Search videos by exercise/equipment |
| POST | `/api/v1/videos/generate` | Manually trigger video generation (admin) |

---

## Build Order

1. Phase 1 - AI Chat (OpenAI text response, no video yet)
2. Phase 2 - Video Library (DB model + search)
3. Phase 3a - TTS voice explanation
4. Phase 5 - Cloud storage setup (S3 / R2)
5. Phase 3b - Video generation
6. Phase 4 - Quality check
7. Phase 7 - Follow-up conversation

---

## Current Progress

- [x] User Auth (register, login, JWT)
- [x] User Profile (age, weight, height, fitnessGoal)
- [x] Workout CRUD
- [ ] AI Chat (Phase 1)
- [ ] Video Library (Phase 2)
- [ ] TTS Voice (Phase 3a)
- [ ] Video Generation (Phase 3b)
- [ ] Quality Check (Phase 4)
- [ ] Cloud Storage (Phase 5)
- [ ] Follow-up Questions (Phase 7)
