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
    const systemPrompt = this.buildSystemPrompt(dto.level, dto.topic, dto.topicDescription);

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
    const systemPrompt = this.buildSystemPrompt(dto.level, dto.topic, dto.topicDescription);

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

  private buildSystemPrompt(level: string, topic: string, topicDescription?: string): string {
    const levelDescriptions: Record<string, string> = {
      beginner: 'Use simple vocabulary and short sentences. Speak slowly and clearly. Avoid complex grammar.',
      intermediate: 'Use moderate vocabulary with some complex sentences. Include idioms occasionally.',
      advanced: 'Use rich vocabulary, complex grammar, and natural expressions like a native speaker.',
    };

    const levelGuide = levelDescriptions[level] || levelDescriptions.intermediate;

    return `You are a friendly English conversation practice partner helping a Vietnamese student improve their English speaking skills.

Topic: ${topic}
${topicDescription ? `Topic Description: ${topicDescription}` : ''}
Student Level: ${level}

Guidelines:
- ${levelGuide}
- Be encouraging and supportive
- Ask follow-up questions to keep the conversation going
- Gently correct major errors by rephrasing naturally (don't be too critical)
- Keep responses concise (2-4 sentences)
- If this is the first message, introduce the topic and ask an opening question

At the end of each response, provide 2-3 suggested responses the student can use. Format them like this:
---SUGGESTIONS---
{"suggestions": ["Suggested response 1", "Suggested response 2", "Suggested response 3"]}
---END---

Keep the suggestions appropriate for the student's level.`;
  }

  async generateFeedback(dto: FeedbackRequestDto): Promise<object> {
    // Count user messages (student turns)
    const userMessages = dto.transcript.filter((t) => t.role === 'user');
    
    // Check if student spoke enough (need at least 3 turns for meaningful assessment)
    if (userMessages.length < 3) {
      return {
        overall: 0,
        pronunciation: 0,
        grammar: 0,
        vocabulary: 0,
        fluency: 0,
        coherence: 0,
        cohesion: 0,
        insufficientData: true,
        pronunciationIssues: ['Bạn cần luyện tập thêm (tối thiểu 3 lượt hội thoại) để có đủ dữ liệu đánh giá chính xác.'],
        grammarIssues: ['Chưa đủ dữ liệu để đánh giá ngữ pháp. Hãy nói nhiều hơn!'],
        vocabularyNotes: ['Cần nhiều hội thoại hơn để đánh giá vốn từ vựng của bạn.'],
        fluencyNotes: ['Cần thêm dữ liệu để đánh giá độ trưu loát.'],
        coherenceNotes: ['Cần thêm dữ liệu để đánh giá tính mạch lạc.'],
        cohesionNotes: ['Cần thêm dữ liệu để đánh giá tính liên kết.'],
        suggestions: ['Tiếp tục luyện tập và trả lời đầy đủ hơn trong các buổi sau', 'Cố gắng nói ít nhất 2-3 câu mỗi lượt'],
        highlights: ['Bạn đã bắt đầu luyện tập - đó là bước đầu tiên quan trọng!'],
      };
    }

    // Check for empty/very short responses (hesitation/unclear speech)
    const shortOrEmptyResponses = userMessages.filter((msg) => !msg.text || msg.text.trim().length < 5);
    const hasHesitation = shortOrEmptyResponses.length > 0;

    const transcriptText = dto.transcript
      .map((t) => `${t.role === 'user' ? 'Student' : 'AI'}: ${t.text || '[No clear speech detected - possible hesitation or unclear pronunciation]'}`)
      .join('\n');

    const prompt = `You are an expert English language assessor following IELTS Speaking Band Descriptors. Analyze this practice conversation step-by-step.

Topic: ${dto.topic}
Level: ${dto.level}

Conversation:
${transcriptText}

${hasHesitation ? `\n⚠️ CRITICAL: Student had ${shortOrEmptyResponses.length} turn(s) with no clear speech detected (empty or very short text). This indicates hesitation, unclear pronunciation, or speech-to-text failure. DO NOT GUESS what they said - evaluate these moments as hesitation/fluency issues.\n` : ''}

ASSESSMENT PROCESS (Follow this order strictly):

STEP 1: ANALYZE ERRORS FIRST (Before giving scores)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CRITICAL: For EACH criterion below, you MUST provide AT LEAST 3 specific observations/comments. If there aren't enough errors, also note what was done well.

1.1 PRONUNCIATION ANALYSIS (Minimum 3 observations):
- Identify specific mispronounced words with IPA notation and quote them
- Note word stress errors with examples (e.g., "comfortable" stressed on wrong syllable)
- Point out intonation issues (rising/falling patterns)
${hasHesitation ? '- Note unclear speech/hesitation moments: "In turn X, no clear speech was detected - this suggests pronunciation difficulties or hesitation"' : ''}
- Comment on consonant/vowel accuracy
- Note rhythm and connected speech
- Be VERY SPECIFIC with quoted words from conversation

1.2 GRAMMAR ANALYSIS (Minimum 3 observations):
- Quote exact sentences with errors and explain what's wrong
- Provide corrections with explanations
- Note patterns of errors (e.g., consistent tense mistakes, subject-verb agreement)
- Comment on sentence structure complexity
- Note article usage (a/an/the)
- Assess word order and syntax

1.3 VOCABULARY ANALYSIS (Minimum 3 observations):
- Assess range and appropriateness for topic and level
- Note repetition or limited vocabulary with examples
- Suggest better alternatives with context
- Comment on collocation usage
- Note idiomatic expressions (or lack thereof)
- Assess precision of word choice

1.4 FLUENCY ANALYSIS (Minimum 3 observations):
- Note hesitation patterns, pauses, self-corrections with specific examples
${hasHesitation ? '- CRITICAL: "In turn(s) X, no clear speech was detected - this is a major fluency issue indicating hesitation or inability to express thoughts"' : ''}
- Comment on speaking pace (too fast/slow/appropriate)
- Note use of fillers (um, uh, well) - appropriate or excessive?
- Assess self-correction frequency and effectiveness
- Comment on natural flow and rhythm
- Note ability to maintain speech without long pauses

1.5 COHERENCE ANALYSIS (Minimum 3 observations):
**Coherence = Logic & Relevance (Tính mạch lạc)**
- Does student stay on topic? Give specific examples
- Are ideas logically organized? Comment on structure
- Do responses directly answer questions? Note any off-topic moments
- Is there clear progression of ideas? Assess development
- Can listener follow the train of thought easily?
- Are ideas relevant to the topic and context?

1.6 COHESION ANALYSIS (Minimum 3 observations):
**Cohesion = Linking & Flow (Tính liên kết)**
- Use of linking words (however, therefore, because, although, etc.) - give examples
- Pronoun references (he, she, it, this, that) - are they clear and correct?
- Use of discourse markers (well, you know, I mean, actually) - appropriate?
- Sentence-to-sentence connections - smooth or abrupt?
- Use of conjunctions (and, but, so, because) - variety or repetition?
- Paragraph-level organization and transitions

STEP 2: SCORING (After analysis)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Based on your detailed error analysis above, assign scores 1-10:
- 1-3: Serious issues preventing communication
- 4-5: Multiple errors, basic communication possible
- 6-7: Some errors, but generally clear communication
- 8-9: Minor errors, good proficiency
- 10: Near-native level

CRITICAL RULES:
1. If student had unclear speech moments (no text detected), fluency ≤ 5 and pronunciation ≤ 6
2. Provide SPECIFIC EXAMPLES from conversation - quote actual words/sentences
3. Each array (pronunciationIssues, grammarIssues, etc.) MUST have AT LEAST 3 items
4. Be encouraging but honest
5. Analysis MUST come before scores in your thinking
6. If there aren't enough errors, also include positive observations

Respond in JSON format (ALL TEXT IN VIETNAMESE ONLY):
{
  "overall": <score 1-10>,
  "pronunciation": <score 1-10>,
  "grammar": <score 1-10>,
  "vocabulary": <score 1-10>,
  "fluency": <score 1-10>,
  "coherence": <score 1-10>,
  "cohesion": <score 1-10>,
  "pronunciationIssues": ["Chi tiết 1 với từ được trích dẫn", "Chi tiết 2 với ví dụ cụ thể", "Chi tiết 3 về một khía cạnh khác"],
  "grammarIssues": ["Trích dẫn câu cụ thể + giải thích + sửa", "Lỗi thứ 2 với ví dụ", "Lỗi thứ 3 hoặc điểm tốt"],
  "vocabularyNotes": ["Phân tích 1 về từ vựng cụ thể", "Phân tích 2 về range/appropriateness", "Phân tích 3 về collocation/idioms"],
  "fluencyNotes": ["Mô tả 1 về sự ngập ngừng/tự tin", "Mô tả 2 về pace/pauses", "Mô tả 3 về flow/self-correction"],
  "coherenceNotes": ["Đánh giá 1: on-topic? logic?", "Đánh giá 2: trả lời đúng câu hỏi?", "Đánh giá 3: progression of ideas?"],
  "cohesionNotes": ["Đánh giá 1: từ nối?", "Đánh giá 2: đại từ?", "Đánh giá 3: discourse markers/sentence connections?"],
  "suggestions": ["Gợi ý CỤ THỂ 1 bằng tiếng Việt với ví dụ", "Gợi ý 2", "Gợi ý 3"],
  "highlights": ["Điểm mạnh CỤ THỂ 1 bằng tiếng Việt", "Điểm mạnh 2", "Điểm mạnh 3"]
}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2500,
      temperature: 0.5,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content || '{}';
    try {
      const parsedFeedback = JSON.parse(content);
      
      // Ensure all arrays have at least 3 items, pad with generic messages if needed
      const ensureMinItems = (arr: string[], defaultItems: string[]) => {
        if (!arr || arr.length === 0) return defaultItems;
        while (arr.length < 3) {
          arr.push(defaultItems[arr.length % defaultItems.length] || defaultItems[0]);
        }
        return arr;
      };

      const defaultPronunciation = [
        'Cần luyện tập thêm để đánh giá chi tiết về phát âm',
        'Hãy chú ý đến trọng âm và ngữ điệu',
        'Luyện nghe và nhại lại để cải thiện'
      ];
      
      const defaultGrammar = [
        'Cần luyện tập thêm để đánh giá chi tiết về ngữ pháp',
        'Hãy chú ý đến thì của động từ',
        'Luyện tập cấu trúc câu phức tạp hơn'
      ];
      
      const defaultVocabulary = [
        'Cần luyện tập thêm để đánh giá từ vựng',
        'Hãy mở rộng vốn từ vựng theo chủ đề',
        'Sử dụng từ đồng nghĩa để tránh lặp lại'
      ];
      
      const defaultFluency = [
        'Cần luyện tập thêm để đánh giá độ lưu loát',
        'Hãy giảm sự ngập ngừng và tạm dừng',
        'Luyện tập nói tự nhiên và trôi chảy hơn'
      ];
      
      const defaultCoherence = [
        'Cần luyện tập thêm để đánh giá tính mạch lạc',
        'Hãy đảm bảo trả lời đúng câu hỏi',
        'Sắp xếp ý tưởng một cách logic'
      ];
      
      const defaultCohesion = [
        'Cần luyện tập thêm để đánh giá tính liên kết',
        'Sử dụng từ nối để kết nối các ý',
        'Sử dụng đại từ và từ thay thế một cách chính xác'
      ];

      // Remove any English fields from parsed feedback
      const { pronunciationIssuesEn, grammarIssuesEn, vocabularyNotesEn, fluencyNotesEn, coherenceNotesEn, cohesionNotesEn, suggestionsEn, highlightsEn, ...cleanFeedback } = parsedFeedback;

      return {
        ...cleanFeedback,
        pronunciationIssues: ensureMinItems(parsedFeedback.pronunciationIssues || [], defaultPronunciation),
        grammarIssues: ensureMinItems(parsedFeedback.grammarIssues || [], defaultGrammar),
        vocabularyNotes: ensureMinItems(parsedFeedback.vocabularyNotes || [], defaultVocabulary),
        fluencyNotes: ensureMinItems(parsedFeedback.fluencyNotes || [], defaultFluency),
        coherenceNotes: ensureMinItems(parsedFeedback.coherenceNotes || [], defaultCoherence),
        cohesionNotes: ensureMinItems(parsedFeedback.cohesionNotes || [], defaultCohesion),
        suggestions: parsedFeedback.suggestions || ['Tiếp tục luyện tập để cải thiện'],
        highlights: parsedFeedback.highlights || ['Bạn đã hoàn thành buổi luyện tập'],
      };
    } catch {
      return {
        overall: 6,
        pronunciation: 6,
        grammar: 6,
        vocabulary: 6,
        fluency: 6,
        coherence: 6,
        cohesion: 6,
        pronunciationIssues: [
          'Cần luyện tập thêm để đánh giá chi tiết về phát âm',
          'Hãy chú ý đến trọng âm và ngữ điệu',
          'Luyện nghe và nhại lại để cải thiện'
        ],
        grammarIssues: [
          'Cần luyện tập thêm để đánh giá chi tiết về ngữ pháp',
          'Hãy chú ý đến thì của động từ',
          'Luyện tập cấu trúc câu phức tạp hơn'
        ],
        vocabularyNotes: [
          'Cần luyện tập thêm để đánh giá từ vựng',
          'Hãy mở rộng vốn từ vựng theo chủ đề',
          'Sử dụng từ đồng nghĩa để tránh lặp lại'
        ],
        fluencyNotes: [
          'Cần luyện tập thêm để đánh giá độ lưu loát',
          'Hãy giảm sự ngập ngừng và tạm dừng',
          'Luyện tập nói tự nhiên và trôi chảy hơn'
        ],
        coherenceNotes: [
          'Cần luyện tập thêm để đánh giá tính mạch lạc',
          'Hãy đảm bảo trả lời đúng câu hỏi',
          'Sắp xếp ý tưởng một cách logic'
        ],
        cohesionNotes: [
          'Cần luyện tập thêm để đánh giá tính liên kết',
          'Sử dụng từ nối để kết nối các ý',
          'Sử dụng đại từ và từ thay thế một cách chính xác'
        ],
        suggestions: ['Tiếp tục luyện tập để cải thiện'],
        highlights: ['Bạn đã hoàn thành buổi luyện tập'],
      };
    }
  }

  async transcribeAudio(buffer: Buffer, filename: string, mimetype?: string): Promise<{ text: string }> {
    const file = await toFile(buffer, filename, mimetype ? { type: mimetype } : undefined);

    const response = await this.openai.audio.transcriptions.create({
      model: 'whisper-1',
      file,
      response_format: 'json',
    });

    const text = response.text?.trim() || '';
    return { text };
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


