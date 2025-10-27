import React, { useMemo, useRef, useState } from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  unitBodyShema,
  unitBodyType,
} from '@/app/ValidationSchemas/unit.model';
import { toast } from 'react-toastify';
import { handleErrorApi } from '@/lib/utils';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Avatar } from '@radix-ui/react-avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAddUnitMutation } from '@/app/queries/useUnit';

export default function DialogAddUnit({
  onOpenChange,
}: {
  onOpenChange?: (open: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const addUnitMutation = useAddUnitMutation();
  const form = useForm<unitBodyType>({
    resolver: zodResolver(unitBodyShema),
    defaultValues: {
      name: '',
      description: '',
    },
  });
  const reset = () => {
    form.reset();
  };
  const onSubmit = async (values: unitBodyType) => {
    if (addUnitMutation.isPending) return;
    try {
      await addUnitMutation.mutateAsync(values);
      setOpen(false);
      reset();
    } catch (error) {
      // handle error
    }
  };
  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (onOpenChange) onOpenChange(newOpen);
      }}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-10 h-10 p-0 flex items-center justify-center"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} id="add-unit-form">
            <DialogHeader>
              <DialogTitle className="mb-2">Thêm đơn vị mới</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên đơn vị</FormLabel>
                    <FormControl>
                      <Input placeholder="ml, g, kg..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Input placeholder="Millilitre, Gram, ..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={addUnitMutation.isPending}>
                {addUnitMutation.isPending ? 'Đang lưu...' : 'Lưu đơn vị'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
