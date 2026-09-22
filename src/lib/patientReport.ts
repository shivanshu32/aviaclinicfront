export const REPORT_TAGS = ['p', 'div', 'br', 'h1', 'h2', 'h3', 'b', 'strong', 'i', 'em', 'u', 'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'th', 'td'] as const;
export interface ReportNode { text?: string; tag?: typeof REPORT_TAGS[number]; children?: ReportNode[] }
export interface PatientReport { _id: string; title: string; date: string; author: string; content: ReportNode[]; updatedAt: string }
export const reportTemplates = [
  { name: 'Consultation Report', sections: ['Presenting complaints', 'History', 'Examination', 'Assessment', 'Plan', 'Follow-up'] },
  { name: 'Follow-up Report', sections: ['Reason for follow-up', 'Progress since last visit', 'Current findings', 'Assessment', 'Updated plan', 'Next review'] },
  { name: 'Laboratory Report', sections: ['Tests requested', 'Specimen and collection details', 'Results (test / result / units / reference range)', 'Comments', 'Reviewed by'] },
  { name: 'Radiology Report', sections: ['Examination', 'Clinical indication', 'Technique', 'Comparison', 'Findings', 'Impression'] },
  { name: 'Ultrasound Report', sections: ['Examination and clinical indication', 'Technique', 'Findings and measurements', 'Limitations', 'Impression'] },
  { name: 'Procedure Report', sections: ['Procedure', 'Indication', 'Consent', 'Procedure details', 'Findings', 'Complications', 'Aftercare and follow-up'] },
  { name: 'Discharge Summary', sections: ['Admission and discharge dates', 'Reason for admission', 'Diagnosis', 'Investigations', 'Treatment and hospital course', 'Condition at discharge', 'Discharge instructions and follow-up'] },
];
export function templateContent(sections: string[]): ReportNode[] {
  return sections.flatMap(section => [{ tag: 'h2', children: [{ text: section }] }, { tag: 'p', children: [{ text: '[Enter details]' }] }] as ReportNode[]);
}
export function escapeReportText(text: string) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
export function reportHTML(nodes: ReportNode[]): string {
  return nodes.map(node => {
    if (typeof node.text === 'string') return escapeReportText(node.text);
    if (!node.tag || !REPORT_TAGS.includes(node.tag)) return '';
    if (node.tag === 'br') return '<br>';
    return `<${node.tag}>${reportHTML(node.children || [])}</${node.tag}>`;
  }).join('');
}
export function readReportDOM(element: HTMLElement): ReportNode[] {
  const read = (node: Node): ReportNode[] => {
    if (node.nodeType === Node.TEXT_NODE) return [{ text: node.textContent || '' }];
    if (!(node instanceof HTMLElement)) return [];
    const children = Array.from(node.childNodes).flatMap(read);
    const tag = node.tagName.toLowerCase() as typeof REPORT_TAGS[number];
    return REPORT_TAGS.includes(tag) ? [{ tag, children }] : children;
  };
  return Array.from(element.childNodes).flatMap(read);
}
export const reportStyles = 'body{font-family:Arial,sans-serif;color:#17251c;line-height:1.6;padding:24px}h1{font-size:26px}h2{font-size:20px;margin:18px 0 8px}h3{font-size:17px}p,div{margin:6px 0}ul{list-style:disc;padding-left:24px}ol{list-style:decimal;padding-left:24px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #bbb;padding:8px}@media print{body{padding:0}}';
