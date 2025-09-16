'use client';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';

import React, { useEffect, useState } from 'react';

export default function Modal({ children }: { children: React.ReactNode }) {
  const route = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    setIsOpen(true);
  }, []);
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) route.back();
      }}
    >
      <DialogContent className="max-h-full overflow-auto">
        {children}
      </DialogContent>
    </Dialog>
  );
}
