import { BookMarked } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="py-6 px-4 md:px-8 border-b border-border">
      <div className="container mx-auto flex items-center gap-3">
        <BookMarked className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-headline font-bold text-foreground">
          c0ff33 Leger
        </h1>
      </div>
    </header>
  );
}
