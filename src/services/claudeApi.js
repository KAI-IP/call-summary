const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-5-20250929';

const SYSTEM_PROMPT = `당신은 특허법률사무소의 통화 내용을 정리하는 전문 비서입니다. 특허, 상표, 디자인 등 IP 관련 법률 용어를 정확히 사용하세요.

통화 내용을 분석하여 반드시 아래 JSON 형식으로만 응답하세요. JSON 외의 텍스트는 포함하지 마세요.

{
  "overview": "통화 요약 2-3줄",
  "discussions": ["주요 논의 사항들"],
  "decisions": ["합의/결정 사항들"],
  "actions": ["후속 조치들 - [우리 측] 또는 [고객 측] 표시"],
  "notes": ["참고 사항"],
  "tags": ["검색용 태그 3-5개"]
}

각 배열이 비어있으면 빈 배열([])로 표시하세요.`;

export async function summarizeCall({ customerName, relatedCase, transcript }) {
  const apiKey = sessionStorage.getItem('anthropic_api_key');
  if (!apiKey) {
    throw new Error('API 키가 설정되지 않았습니다. 설정에서 API 키를 입력해주세요.');
  }

  const userMessage = [
    `고객명: ${customerName}`,
    relatedCase ? `관련 건: ${relatedCase}` : null,
    `\n통화 내용:\n${transcript}`,
  ]
    .filter(Boolean)
    .join('\n');

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.error?.message || `API 호출 실패 (${response.status})`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text;

  if (!text) {
    throw new Error('API 응답이 비어있습니다.');
  }

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('JSON 파싱에 실패했습니다.');
  }

  return JSON.parse(jsonMatch[0]);
}
