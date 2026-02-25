"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PromptDialog } from "./PromptDialog";

interface PromptDialogTriggerProps {
  mode: "create";
}

export function PromptDialogTrigger({ mode }: PromptDialogTriggerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">
        <Plus className="h-4 w-4" />
        Новый промт
      </Button>
      <PromptDialog open={open} onOpenChange={setOpen} mode="create" />
    </>
  );
}
