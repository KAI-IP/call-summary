export function formatSummaryText(summary) {
  const lines = [];
  lines.push(`[통화 요약]\n${summary.overview}\n`);
  if (summary.discussions?.length) {
    lines.push(`[논의 사항]\n${summary.discussions.map((d) => `• ${d}`).join('\n')}\n`);
  }
  if (summary.decisions?.length) {
    lines.push(`[결정 사항]\n${summary.decisions.map((d) => `• ${d}`).join('\n')}\n`);
  }
  if (summary.actions?.length) {
    lines.push(`[후속 조치]\n${summary.actions.map((a) => `• ${a}`).join('\n')}\n`);
  }
  if (summary.notes?.length) {
    lines.push(`[참고 사항]\n${summary.notes.map((n) => `• ${n}`).join('\n')}\n`);
  }
  if (summary.tags?.length) {
    lines.push(`[태그] ${summary.tags.join(', ')}`);
  }
  return lines.join('\n');
}

export function formatEmailText(summary, customerName) {
  const body = formatSummaryText(summary);
  return `${customerName}님 안녕하세요,\n\n금일 통화 내용을 정리하여 보내드립니다.\n\n${body}\n\n추가 문의 사항이 있으시면 말씀해 주시기 바랍니다.\n감사합니다.`;
}
