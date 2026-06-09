import { Suspense } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { findTool } from '@/tools/registry';
import { CATEGORIES } from '@/tools/categories';
import { ToolShell } from '@/components/tool/ToolShell';
import { ToolContent } from '@/components/tool/ToolContent';
import { RelatedTools } from '@/components/tool/RelatedTools';
import { StructuredData } from '@/components/seo/StructuredData';
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
  const category = CATEGORIES[tool.category];

  return (
    <div className="flex min-h-full flex-col">
      <StructuredData tool={tool} />

      <nav aria-label="Breadcrumb" className="px-6 pt-4 text-xs text-muted-foreground">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link to="/" className="transition-colors hover:text-foreground">Home</Link>
          </li>
          <ChevronRight className="size-3 opacity-60" />
          <li>{category.label}</li>
          <ChevronRight className="size-3 opacity-60" />
          <li className="text-foreground">{tool.title}</li>
        </ol>
      </nav>

      <div className="min-h-[70vh] flex-1">
        <ToolShell title={tool.title} description={tool.description}>
          <Suspense fallback={<div className="text-sm">Loading…</div>}>
            <Component />
          </Suspense>
        </ToolShell>
      </div>

      <ToolContent tool={tool} />
      <RelatedTools tool={tool} />
    </div>
  );
}
