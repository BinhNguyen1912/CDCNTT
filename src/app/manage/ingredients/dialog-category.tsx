'use client';
import DialogAddCategory from '@/app/manage/products/add-category';
import { useGetCategories } from '@/app/queries/useCategory';
import { CategoryType } from '@/app/ValidationSchemas/category.schema';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
} from '@/components/ui/command';
import React, { useMemo, useRef, useEffect } from 'react';

interface DialogCategoryProps {
  selectedCategories: number[];
  setSelectedCategories: (vals: number[]) => void;
  showCategoryDropdown: boolean;
  setShowCategoryDropdown: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function DialogCategory({
  selectedCategories,
  setSelectedCategories,
  showCategoryDropdown,
  setShowCategoryDropdown,
}: DialogCategoryProps) {
  const { data: initialCategories, isLoading, error } = useGetCategories();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter categories thành cha/con
  const categories = useMemo(
    () => initialCategories?.payload?.data || [],
    [initialCategories],
  );
  const parentCategories = categories.filter((c) => !c.parentCategoryId);

  const childCategories = categories.filter((c) => c.parentCategoryId);

  // Xử lý click outside để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowCategoryDropdown(false);
      }
    };

    if (showCategoryDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCategoryDropdown, setShowCategoryDropdown]);

  const handleSelectCategory = (id: number) => {
    if (selectedCategories.includes(id)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== id));
    } else {
      setSelectedCategories([...selectedCategories, id]);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading categories</div>;

  return (
    <div className="relative w-fit">
      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant="outline"
          className="w-40 justify-between"
          onClick={() => setShowCategoryDropdown((prev) => !prev)}
        >
          {selectedCategories.length
            ? `${selectedCategories.length} danh mục đã chọn`
            : 'Chọn danh mục'}
        </Button>

        {showCategoryDropdown && (
          <div
            ref={dropdownRef} // Thêm ref here
            className="absolute z-50 mt-8 w-72 bg-white border rounded-md shadow-lg max-h-80 overflow-auto"
          >
            <Command>
              <CommandInput placeholder="Tìm danh mục..." />
              <CommandList>
                {parentCategories.map((parent) => {
                  const children = childCategories.filter(
                    (c) => c.parentCategoryId === parent.id,
                  );

                  return (
                    <div key={parent.id}>
                      <CommandItem
                        onSelect={() => handleSelectCategory(parent.id)}
                        className="cursor-pointer flex justify-between items-center"
                      >
                        <span>{parent.name}</span>
                        <span>
                          {selectedCategories.includes(parent.id) && '✓'}
                        </span>
                      </CommandItem>

                      {/* Hiển thị danh mục con ngay bên dưới */}
                      {children.length > 0 && (
                        <div className="ml-4 pl-2 border-l">
                          {children.map((child) => (
                            <CommandItem
                              key={child.id}
                              onSelect={() => handleSelectCategory(child.id)}
                              className="cursor-pointer text-sm"
                            >
                              <span className="ml-2">- {child.name}</span>
                              <span className="ml-auto">
                                {selectedCategories.includes(child.id) && '✓'}
                              </span>
                            </CommandItem>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </CommandList>
            </Command>
          </div>
        )}

        <DialogAddCategory categories={categories} setCategories={() => {}} />
      </div>
    </div>
  );
}
