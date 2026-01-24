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
    const transcriptText = dto.transcript
      .map((t) => `${t.role === 'user' ? 'Student' : 'AI'}: ${t.text}`)
      .join('\n');

    const prompt = `You are an expert English language assessor. Analyze this practice conversation and provide HIGHLY DETAILED, SPECIFIC feedback.

Topic: ${dto.topic}
Level: ${dto.level}

Conversation:
${transcriptText}

CRITICAL: Provide VERY SPECIFIC feedback with CONCRETE EXAMPLES from the conversation:

For pronunciationIssues: Quote exact words/phrases the student mispronounced and explain how to fix them.
  Example: "Phát âm chữ 'tourists' bị thiếu âm cuối /s/. Cần kéo âm 's' dài hơn."
  Example: "Từ 'comfortable' cần nhấn trọng âm ở âm tiết đầu: /ˈkʌmftəbl/"

For grammarIssues: Quote exact sentences with grammar errors and provide corrections.
  Example: "Câu 'I go there yesterday' sai thì, cần sửa thành 'I went there yesterday'"

For vocabularyNotes: Point out vocabulary gaps with specific topic contexts.
  Example: "Thiếu từ vựng về chủ đề du lịch - chỉ dùng được 'beautiful'. Có thể dùng: picturesque, scenic"

For fluencyNotes: Describe specific hesitation patterns or confidence issues.
  Example: "Chưa nói lưu loát được khi dùng cấu trúc ngữ pháp phức tạp"

Be encouraging but VERY SPECIFIC. Generic feedback is NOT acceptable.

Provide feedback in JSON format:
{
  "overall": <score 1-10>,
  "pronunciation": <score 1-10>,
  "grammar": <score 1-10>,
  "vocabulary": <score 1-10>,
  "fluency": <score 1-10>,
  "coherence": <score 1-10>,
  "pronunciationIssues": ["Chi tiết lỗi phát âm cụ thể với từ/cụm từ"],
  "pronunciationIssuesEn": ["Specific pronunciation error with word/phrase"],
  "grammarIssues": ["Chi tiết lỗi ngữ pháp cụ thể với câu ví dụ"],
  "grammarIssuesEn": ["Specific grammar error with example sentence"],
  "vocabularyNotes": ["Ghi chú về từ vựng với ví dụ cụ thể"],
  "vocabularyNotesEn": ["Vocabulary note with specific examples"],
  "fluencyNotes": ["Ghi chú về sự lưu loát/tự tin"],
  "fluencyNotesEn": ["Fluency/confidence note"],
  "suggestions": ["Gợi ý cải thiện CỤ THỂ bằng tiếng Việt", "suggestion 2"],
  "suggestionsEn": ["SPECIFIC improvement suggestion in English", "suggestion 2"],
  "highlights": ["Điểm mạnh CỤ THỂ bằng tiếng Việt", "highlight 2"],
  "highlightsEn": ["SPECIFIC strength in English", "highlight 2"]
}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500,
      temperature: 0.5,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content || '{}';
    try {
      return JSON.parse(content);
    } catch {
      return {
        overall: 6,
        pronunciation: 6,
        grammar: 6,
        vocabulary: 6,
        fluency: 6,
        coherence: 6,
        pronunciationIssues: ['Cần luyện tập thêm để đánh giá chi tiết'],
        pronunciationIssuesEn: ['Need more practice for detailed assessment'],
        grammarIssues: ['Cần luyện tập thêm để đánh giá chi tiết'],
        grammarIssuesEn: ['Need more practice for detailed assessment'],
        vocabularyNotes: ['Cần luyện tập thêm để đánh giá từ vựng'],
        vocabularyNotesEn: ['Need more practice for vocabulary assessment'],
        fluencyNotes: ['Cần luyện tập thêm để đánh giá độ lưu loát'],
        fluencyNotesEn: ['Need more practice for fluency assessment'],
        suggestions: ['Tiếp tục luyện tập để cải thiện'],
        suggestionsEn: ['Keep practicing to improve'],
        highlights: ['Bạn đã hoàn thành buổi luyện tập'],
        highlightsEn: ['You completed the practice session'],
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


