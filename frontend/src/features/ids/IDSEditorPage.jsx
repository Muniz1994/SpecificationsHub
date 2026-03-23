import { Card, CardContent } from '@/components/ui/card';
import { PenTool } from 'lucide-react';

export default function IDSEditorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Card className="max-w-md text-center">
        <CardContent className="pt-6 space-y-4">
          <PenTool className="mx-auto h-12 w-12 text-muted-foreground" />
          <h1 className="text-2xl font-bold">IDS Editor</h1>
          <p className="text-muted-foreground">
            The IDS editor is under development. Check back soon!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
