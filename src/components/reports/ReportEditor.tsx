'use client';

import { useEffect, useRef } from 'react';
import { readReportDOM, reportHTML, type ReportNode } from '@/lib/patientReport';

export default function ReportEditor({ content, revision, onChange, disabled }: {
  disabled?: boolean; content: ReportNode[]; revision: number; onChange: (content: ReportNode[]) => void;
}) {
  const editor = useRef<HTMLDivElement>(null);
  const initialContent = useRef(content);
  initialContent.current = content;
  useEffect(() => {
    if (editor.current) editor.current.innerHTML = reportHTML(initialContent.current);
  }, [revision]);
  const update = () => { if (editor.current) onChange(readReportDOM(editor.current)); };
  const command = (name: string, value?: string) => {
    editor.current?.focus();
    document.execCommand(name, false, value);
    update();
  };
  const tools = [
    ['Bold', 'bold'], ['Italic', 'italic'], ['Underline', 'underline'],
    ['Bullets', 'insertUnorderedList'], ['Numbered list', 'insertOrderedList'],
    ['Undo', 'undo'], ['Redo', 'redo'],
  ];
  return (
    <div className="border border-primary-200 rounded-xl overflow-hidden">
      <div role="toolbar" aria-label="Report formatting" className="flex flex-wrap gap-2 p-3 bg-primary-50 border-b border-primary-100">
        {tools.map(([label, action]) => <button key={action} type="button" onMouseDown={event => event.preventDefault()} onClick={() => command(action)} className="px-3 py-1.5 bg-white border border-primary-100 rounded-lg text-sm text-primary-800 hover:bg-primary-100">{label}</button>)}
        {['Paragraph', 'Heading 1', 'Heading 2'].map((label, index) => <button key={label} type="button" onMouseDown={event => event.preventDefault()} onClick={() => command('formatBlock', ['p', 'h1', 'h2'][index])} className="px-3 py-1.5 bg-white border border-primary-100 rounded-lg text-sm text-primary-800 hover:bg-primary-100">{label}</button>)}
        <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => command('insertHTML', '<table><tbody><tr><th>Test / Finding</th><th>Result</th><th>Units / Notes</th></tr><tr><td>Enter test</td><td>Enter result</td><td>Enter notes</td></tr><tr><td>Enter test</td><td>Enter result</td><td>Enter notes</td></tr></tbody></table><p><br></p>')} className="px-3 py-1.5 bg-white border border-primary-100 rounded-lg text-sm text-primary-800 hover:bg-primary-100">Insert table</button>
      </div>
      <div ref={editor} contentEditable={!disabled} suppressContentEditableWarning role="textbox" aria-label="Patient report content" aria-multiline="true" onInput={update}
        onPaste={event => { event.preventDefault(); command('insertText', event.clipboardData.getData('text/plain')); }}
        onDrop={event => event.preventDefault()}
        className="report-document min-h-[440px] p-6 bg-white outline-none focus:ring-2 focus:ring-inset focus:ring-primary-400" />
      <style jsx global>{`
        .report-document { line-height: 1.6; color: #17251c; }
        .report-document h1 { font-size: 26px; font-weight: 700; }
        .report-document h2 { font-size: 20px; font-weight: 600; margin: 18px 0 8px; }
        .report-document h3 { font-size: 17px; font-weight: 600; }
        .report-document p, .report-document div { margin: 6px 0; }
        .report-document ul { list-style: disc; padding-left: 24px; }
        .report-document ol { list-style: decimal; padding-left: 24px; }
        .report-document table { border-collapse: collapse; width: 100%; }
        .report-document td, .report-document th { border: 1px solid #bbb; padding: 8px; }
      `}</style>
    </div>
  );
}
