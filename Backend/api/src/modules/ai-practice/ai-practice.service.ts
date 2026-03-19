import { Injectable } from '@nestjs/common';
import OpenAI, { toFile } from 'openai';
import { ChatRequestDto, FeedbackRequestDto } from './dto/chat.dto';

@Injectable()
export class AIPracticeService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async chat(dto: ChatRequestDto): Promise<ReadableStream> {
    const systemPrompt = this.buildSystemPrompt(dto.level, dto.topic, dto.topicDescription, dto.speakingGoals);

    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...dto.messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ];

    const stream = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      stream: true,
      max_tokens: 500,
      temperature: 0.8,
    });

    return stream.toReadableStream();
  }

  async chatNonStream(dto: ChatRequestDto): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(dto.level, dto.topic, dto.topicDescription, dto.speakingGoals);

    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...dto.messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ];

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 500,
      temperature: 0.8,
    });

    return response.choices[0]?.message?.content || '';
  }

  private buildSystemPrompt(level: string, topic: string, topicDescription?: string, speakingGoals?: string[]): string {
    const levelDescriptions: Record<string, string> = {
      beginner: 'Use simple vocabulary and short sentences. Speak slowly and clearly. Avoid complex grammar.',
      intermediate: 'Use moderate vocabulary with some complex sentences. Include idioms occasionally.',
      advanced: 'Use rich vocabulary, complex grammar, and natural expressions like a native speaker.',
    };

    const levelGuide = levelDescriptions[level] || levelDescriptions.intermediate;

    const goalsSection = speakingGoals?.length
      ? `\n\nWEEKLY SPEAKING GOALS (set by the student's in-person teacher):\n${speakingGoals.map((g, i) => `${i + 1}. ${g}`).join('\n')}\nGently steer the conversation to help the student practice these specific goals. For example, if a goal is "speak for at least 60 seconds", encourage longer answers. If a goal is "expand ideas", ask follow-up questions that require elaboration.`
      : '';

    return `You are a friendly English conversation practice partner helping a Vietnamese student improve their English speaking skills.

Topic: ${topic}
${topicDescription ? `Topic Description: ${topicDescription}` : ''}
Student Level: ${level}${goalsSection}

CRITICAL CONVERSATION RULES:

1. STAY ON TOPIC - Never get sidetracked by follow-ups
   ❌ BAD Example:
   AI: "Let's talk about work and study. Do you work or study?"
   Student: "I'm a computer science student. I love computers."
   AI: "What do you like most about computers?" ← WRONG! This goes off-topic
   Student: "I love the CPU because it controls everything."
   AI: "Are there any other parts you love?" ← STILL OFF-TOPIC!
   
   ✅ GOOD Example:
   AI: "Let's talk about work and study. Do you work or study?"
   Student: "I'm a computer science student. I love computers."
   AI: "Do you think your major is hard or easy?" ← Back to main topic (work/study)
   
   Rule: Maximum 1 follow-up on side detail, then return to main topic immediately.

2. NO LENGTHY COMMENTARY - Ask questions, don't lecture
   ❌ BAD Example:
   Student: "I like the atmosphere in my country. It helps me relax after work."
   AI: "I know, relaxation is really important for your health. It helps us revitalize and be more productive. Also, it makes us love our lives more..." ← TOO MUCH COMMENTARY!
   
   ✅ GOOD Example:
   Student: "I like the atmosphere in my country. It helps me relax after work."
   AI: "What else do you like in your country?" ← Direct next question
   OR: "Is your hometown crowded?" ← New question, same topic
   
   Rule: Don't comment on or praise their answer. Just ask the next question.

3. SHORT RESPONSES (1-2 sentences maximum)
   - First message: Brief intro + 1 question
   - Follow-up: Just ask the next question (no commentary)
   - If you must acknowledge: 1 short word ("Nice!" / "Interesting!"), then question

4. QUESTION STRUCTURE:
   - Ask clear, direct questions
   - Vary question types (open/closed)
   - Stay within the main topic boundaries
   - ${levelGuide}

At the end of each response, provide 2-3 suggested responses the student can use. Format them like this:
---SUGGESTIONS---
{"suggestions": ["Suggested response 1", "Suggested response 2", "Suggested response 3"]}
---END---

Keep the suggestions appropriate for the student's level.`;
  }

  async generateFeedback(dto: FeedbackRequestDto): Promise<object> {
    const userTurns = dto.transcript
      .filter((t) => t.role === 'user')
      .map((t, idx) => ({
        index: idx + 1,
        text: (t.text || '').trim(),
        words: (t.words || [])
          .filter((w) => typeof w.start === 'number' && typeof w.end === 'number' && !!w.word)
          .sort((a, b) => a.start - b.start),
      }))
      .filter((t) => t.text.length > 0 || t.words.length > 0);

    // Lightweight speaking analytics without score grading
    const estimateDurationSec = (text: string) => {
      const words = text ? text.split(/\s+/).length : 0;
      // Average speaking speed estimate: ~2.2 words/sec
      return words > 0 ? Math.max(2, Math.round(words / 2.2)) : 0;
    };

    const pauseThresholdSec = 0.5;
    let totalPauseCount = 0;
    const pauseTurns = new Set<number>();

    const speechTurns: string[] = [];
    const perTurnDurations = userTurns.map((turn) => {
      if (!turn.words.length) {
        speechTurns.push(turn.text);
        return estimateDurationSec(turn.text);
      }

      const spokenParts: string[] = [];
      let turnPauseCount = 0;

      turn.words.forEach((word, wordIndex) => {
        if (wordIndex > 0) {
          const prev = turn.words[wordIndex - 1];
          const gap = word.start - prev.end;
          if (gap > pauseThresholdSec) {
            // Add hesitation markers to reflect real pauses in speech-to-text output.
            spokenParts.push('uhmmm');
            turnPauseCount += 1;
          }
        }
        spokenParts.push(word.word.trim());
      });

      if (turnPauseCount > 0) {
        totalPauseCount += turnPauseCount;
        pauseTurns.add(turn.index);
      }

      const spokenText = spokenParts.join(' ').replace(/\s+/g, ' ').trim();
      speechTurns.push(spokenText || turn.text);

      const firstWord = turn.words[0];
      const lastWord = turn.words[turn.words.length - 1];
      const measured = Math.max(0, Number((lastWord.end - firstWord.start).toFixed(1)));
      return measured > 0 ? measured : estimateDurationSec(spokenText || turn.text);
    });

    const allUserText = speechTurns.join(' ').trim();
    const responseDuration =
      perTurnDurations.length > 0
        ? Number(
            (
              perTurnDurations.reduce((sum, v) => sum + v, 0) /
              perTurnDurations.length
            ).toFixed(1),
          )
        : 0;

    const pauseDetection = {
      has_pause: totalPauseCount > 0,
      pause_count: totalPauseCount,
      pause_turns: Array.from(pauseTurns),
      summary:
        totalPauseCount > 0
          ? `Phát hiện ${totalPauseCount} khoảng ngập ngừng (khoảng cách > 0.5 giây giữa 2 từ).`
          : 'Nhịp trả lời ổn định, học sinh duy trì hội thoại khá tốt.',
    };

    const sessionLength = dto.transcript.filter((t) => (t.text || '').trim().length > 0).length;

    const shortPractice = userTurns.length < 3;

    return {
      speech_to_text: allUserText,
      response_duration: responseDuration,
      pause_detection: pauseDetection,
      session_length: sessionLength,
      insufficientData: shortPractice,
      suggestions: [
        'Mỗi lượt trả lời hãy cố gắng nói ít nhất 2-3 câu.',
        'Duy trì luyện tập hằng ngày 10-15 phút để tăng phản xạ nói.',
        'Khi bí ý, hãy dùng mẫu: "I think... because... for example..." để kéo dài câu trả lời.',
      ],
      highlights: [
        'Bạn đã hoàn thành một buổi luyện speaking rất tốt.',
        'Bạn có tinh thần chủ động nói tiếng Anh, đây là điểm quan trọng nhất.',
        'Bạn đang tiến bộ dần về độ tự tin khi giao tiếp.',
      ],
    };
  }

  async transcribeAudio(buffer: Buffer, filename: string, mimetype?: string): Promise<{ 
    text: string; 
    words?: Array<{ word: string; start: number; end: number }>;
    rawTranscription?: string;
  }> {
    const file = await toFile(buffer, filename, mimetype ? { type: mimetype } : undefined);

    // Use verbose_json to get word-level timestamps for pronunciation analysis
    const response = await this.openai.audio.transcriptions.create({
      model: 'whisper-1',
      file,
      response_format: 'verbose_json',
      language: 'en',
      // Prompt Whisper to transcribe verbatim without corrections
      // This helps preserve mispronunciations, missed endings, and pronunciation errors
      prompt: `Transcribe exactly what you hear, word by word. Do NOT correct pronunciation errors. Do NOT fix grammar. Do NOT auto-complete words. If the speaker says "tha" instead of "that", transcribe "tha". If they say "wok" instead of "work", transcribe "wok". If they miss the ending sound of a word like saying "goin" instead of "going", transcribe "goin". Preserve all pronunciation mistakes, incomplete words, and mispronounced words exactly as spoken. This is for pronunciation assessment purposes.`,
      timestamp_granularities: ['word'],
    });

    const text = response.text?.trim() || '';
    
    // Extract word-level data for pronunciation analysis
    const words = response.words?.map(w => ({
      word: w.word,
      start: w.start,
      end: w.end,
    })) || [];

    return { 
      text,
      words,
      rawTranscription: text, // Store original for error tracking
    };
  }

  async textToSpeech(text: string): Promise<Buffer> {
    const response = await this.openai.audio.speech.create({
      model: 'gpt-4o-mini-tts',
      voice: 'alloy',
      input: text,
      response_format: 'mp3',
    });

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}


