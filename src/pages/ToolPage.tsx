import { Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { findTool } from '@/tools/registry';
import { ToolShell } from '@/components/tool/ToolShell';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';

export function ToolPage() {
  const { toolId } = useParams();
  const tool = toolId ? findTool(toolId) : undefined;

  useDocumentMeta(
    tool ? tool.title : 'Tool not found',
    tool ? tool.description : 'The tool you are looking for was not found.',
    tool ? `/tool/${tool.id}` : '/',
  );

  if (!tool) return <div className="p-6">Tool not found.</div>;
  const { Component } = tool;
  return (
    <ToolShell title={tool.title} description={tool.description}>
      <Suspense fallback={<div className="text-sm">Loading…</div>}>
        <Component />
      </Suspense>
    </ToolShell>
  );
}
