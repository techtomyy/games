// pages/game/[id].tsx
import { useParams } from "wouter";
import PhaserGame from "@/components/PhaserGame";

export default function GamePage() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-semibold text-muted-foreground">
          Loading game...
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-4xl h-[600px] border rounded-lg shadow-md overflow-hidden">
        <PhaserGame gameId={id} />
      </div>
    </div>
  );
}
