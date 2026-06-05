import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog, CommandInput, CommandList, CommandItem, CommandEmpty, CommandGroup,
} from '@/components/ui/command';
import { tools } from '@/tools/registry';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Search tools"
      description="Search for a tool to open"
    >
      <CommandInput placeholder="Search tools… (Cmd/Ctrl + K)" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Tools">
          {tools.map((t) => (
            <CommandItem
              key={t.id}
              value={`${t.title} ${t.keywords.join(' ')}`}
              onSelect={() => { navigate(`/tool/${t.id}`); setOpen(false); }}
            >
              <t.icon className="mr-2 size-4" />
              {t.title}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
