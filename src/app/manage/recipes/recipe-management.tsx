'use client';
import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useGetProducts } from '@/app/queries/useProducts';
import { useGetUnits } from '@/app/queries/useUnit';
import {
  useCreateRecipeMutation,
  useUpdateRecipeMutation,
  useDeleteRecipeMutation,
  useGetRecipeDetail,
} from '@/app/queries/useRecipe';
import { SkuRecipeIngredientBodyType } from '@/app/ValidationSchemas/recipe.schema';
import { z } from 'zod';
import { Plus, Trash2, Save } from 'lucide-react';
import { handleErrorApi } from '@/lib/utils';
import AddIngredient from '@/app/manage/ingredients/add-ingredient';
import { useGetListIngredientMutation } from '@/app/queries/useIngredient';
import { toast } from 'react-toastify';

const recipeSchema = z.object({
  skuId: z.number().min(1, 'Vui lòng chọn SKU'),
  ingredients: z
    .array(
      z.object({
        ingredientId: z.number().min(1, 'Vui lòng chọn nguyên liệu'),
        quantity: z.number().min(0.01, 'Số lượng phải lớn hơn 0'),
        unitId: z.string().min(1, 'Vui lòng chọn đơn vị'),
      }),
    )
    .min(1, 'Phải có ít nhất 1 nguyên liệu'),
});

type RecipeFormType = z.infer<typeof recipeSchema>;

export default function RecipeManagement() {
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null,
  );
  const [selectedSkuId, setSelectedSkuId] = useState<number | null>(null);
  const [refreshIngredients, setRefreshIngredients] = useState(0);

  const { data: productsData } = useGetProducts();
  const { data: ingredientsData, refetch: refetchIngredients } =
    useGetListIngredientMutation();
  const { data: unitsData } = useGetUnits();
  const { data: recipeData } = useGetRecipeDetail(
    selectedSkuId || 0,
    !!selectedSkuId,
  );
  const createRecipeMutation = useCreateRecipeMutation();
  const updateRecipeMutation = useUpdateRecipeMutation();
  const deleteRecipeMutation = useDeleteRecipeMutation();

  const products = productsData?.payload?.data || [];
  const ingredients = ingredientsData?.payload?.data || [];
  const units = unitsData?.payload?.data || [];
  const recipe = recipeData?.payload;

  const form = useForm<RecipeFormType>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      skuId: 0,
      ingredients: [{ ingredientId: 0, quantity: 0, unitId: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'ingredients',
  });

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const skus = selectedProduct?.skus || [];

  const onSubmit = async (data: RecipeFormType) => {
    try {
      if (
        recipe &&
        recipe.skuRecipeIngredients &&
        recipe.skuRecipeIngredients.length > 0
      ) {
        // Update existing recipe - include skuId for backend compatibility
        await updateRecipeMutation.mutateAsync({
          skuId: data.skuId,
          ingredients: data.ingredients,
        });
        toast.success('Cập nhật công thức thành công!');
      } else {
        // Create new recipe
        await createRecipeMutation.mutateAsync(data);
        toast.success('Tạo công thức mới thành công!');
      }
      form.reset();
      setSelectedProductId(null);
      setSelectedSkuId(null);
    } catch (error) {
      handleErrorApi({ error, setError: form.setError });
    }
  };

  const handleDeleteRecipe = async () => {
    if (
      recipe &&
      recipe.skuRecipeIngredients &&
      recipe.skuRecipeIngredients.length > 0 &&
      confirm('Bạn có chắc chắn muốn xóa công thức này?')
    ) {
      try {
        const recipeId = recipe.skuRecipeIngredients[0].skuRecipeIngredientsId;
        await deleteRecipeMutation.mutateAsync(recipeId);
        toast.success('Xóa công thức thành công!');
        setSelectedSkuId(null);
        form.reset();
      } catch (error) {
        handleErrorApi({ error });
      }
    }
  };

  const addIngredient = () => {
    append({ ingredientId: 0, quantity: 0, unitId: '' });
    toast.success('Đã thêm nguyên liệu mới!');
  };

  const removeIngredient = (index: number) => {
    remove(index);
    toast.success('Đã xóa nguyên liệu!');
  };

  const handleIngredientCreated = () => {
    refetchIngredients();
    setRefreshIngredients((prev) => prev + 1);
  };

  // Effect to handle form reset when switching SKUs
  React.useEffect(() => {
    if (selectedSkuId) {
      form.setValue('skuId', selectedSkuId);

      // If no recipe data, reset to default empty form
      if (
        !recipe ||
        !recipe.skuRecipeIngredients ||
        recipe.skuRecipeIngredients.length === 0
      ) {
        console.log('Resetting form for SKU without recipe:', selectedSkuId);
        form.reset({
          skuId: selectedSkuId,
          ingredients: [{ ingredientId: 0, quantity: 0, unitId: '' }],
        });
      }
    }
  }, [selectedSkuId, form]);

  // Effect to populate form when recipe data is available
  React.useEffect(() => {
    if (
      recipe &&
      recipe.skuRecipeIngredients &&
      recipe.skuRecipeIngredients.length > 0
    ) {
      console.log('Recipe data:', recipe);
      console.log('SKU Recipe Ingredients:', recipe.skuRecipeIngredients);

      const ingredients = recipe.skuRecipeIngredients.map(
        (ingredient: any) => ({
          ingredientId: ingredient.ingredientId,
          quantity: ingredient.quantity,
          unitId: ingredient.unit, // Sử dụng unit thay vì unitId
        }),
      );

      console.log('Mapped ingredients for form:', ingredients);
      form.setValue('ingredients', ingredients);
    }
  }, [recipe, form]);

  // Get ingredient name from recipe data
  const getRecipeIngredientName = (ingredientId: number) => {
    if (recipe && recipe.skuRecipeIngredients) {
      const recipeIngredient = recipe.skuRecipeIngredients.find(
        (ing: any) => ing.ingredientId === ingredientId,
      );
      return recipeIngredient?.name || 'Không tìm thấy';
    }
    return 'Không tìm thấy';
  };

  // Get unit name from recipe data
  const getRecipeUnitName = (unitId: string) => {
    console.log('getRecipeUnitName called with unitId:', unitId);
    console.log('Recipe:', recipe);

    if (recipe && recipe.skuRecipeIngredients) {
      console.log('SKU Recipe Ingredients:', recipe.skuRecipeIngredients);

      // Tìm ingredient có unitId trùng khớp
      const recipeIngredient = recipe.skuRecipeIngredients.find(
        (ing: any) => ing.unitId === unitId,
      );

      console.log('Found recipeIngredient by unitId:', recipeIngredient);

      if (recipeIngredient) {
        // Trả về unit từ recipe data (đã là tên đơn vị)
        const result = recipeIngredient.unit || 'Không tìm thấy';
        console.log('Returning unit from recipeIngredient:', result);
        return result;
      }

      // Nếu không tìm thấy theo unitId, thử tìm theo unit name
      const recipeIngredientByUnit = recipe.skuRecipeIngredients.find(
        (ing: any) => ing.unit === unitId,
      );

      console.log(
        'Found recipeIngredient by unit name:',
        recipeIngredientByUnit,
      );
      const result = recipeIngredientByUnit?.unit || 'Không tìm thấy';
      console.log('Returning unit from recipeIngredientByUnit:', result);
      return result;
    }
    return 'Không tìm thấy';
  };

  // Helper function to get ingredient name by ID
  const getIngredientName = (ingredientId: number) => {
    const ingredient = ingredients.find((ing) => ing.id === ingredientId);
    return ingredient?.name || 'Không tìm thấy';
  };

  // Helper function to get unit name by ID
  const getUnitName = (unitId: string) => {
    const unit = units.find((u) => u.name === unitId);
    return unit?.name || 'Không tìm thấy';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý định lượng</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-md font-bold">
              Danh sách sản phẩm
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedProductId === product.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedProductId(product.id)}
                >
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-gray-600">
                    {product.skus?.length || 0} Sản phầm
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SKU Selection */}
        {selectedProduct && (
          <Card>
            <CardHeader>
              <CardTitle>{selectedProduct.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {skus.map((sku) => (
                  <div
                    key={sku.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedSkuId === sku.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      setSelectedSkuId(sku.id);
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{sku.value}</span>
                      <span className="text-sm text-gray-600">
                        {sku.price.toLocaleString()}₫
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recipe Display/Form */}
      {selectedSkuId && (
        <Card>
          <CardHeader>
            <CardTitle>
              {recipe ? 'Chỉnh sửa công thức' : 'Tạo công thức mới'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg"
                    >
                      <FormField
                        control={form.control}
                        name={`ingredients.${index}.ingredientId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nguyên liệu</FormLabel>
                            <div className="flex gap-2">
                              <Select
                                value={field.value?.toString() || ''}
                                onValueChange={(value) =>
                                  field.onChange(Number(value))
                                }
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Chọn nguyên liệu">
                                      {field.value
                                        ? recipe
                                          ? getRecipeIngredientName(field.value)
                                          : getIngredientName(field.value)
                                        : 'Chọn nguyên liệu'}
                                    </SelectValue>
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {ingredients.map((ingredient) => (
                                    <SelectItem
                                      key={ingredient.id}
                                      value={ingredient.id.toString()}
                                    >
                                      {ingredient.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <AddIngredient />
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`ingredients.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Số lượng</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`ingredients.${index}.unitId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Đơn vị</FormLabel>
                            <Select
                              value={field.value || ''}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn đơn vị">
                                    {field.value
                                      ? recipe
                                        ? getRecipeUnitName(field.value)
                                        : getUnitName(field.value)
                                      : 'Chọn đơn vị'}
                                  </SelectValue>
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {units.map((unit) => (
                                  <SelectItem key={unit.name} value={unit.name}>
                                    {unit.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeIngredient(index)}
                          disabled={fields.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addIngredient}
                    className="flex items-center gap-2"
                    title="Thêm nguyên liệu"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Thêm nguyên liệu</span>
                  </Button>

                  <Button
                    type="submit"
                    disabled={
                      createRecipeMutation.isPending ||
                      updateRecipeMutation.isPending
                    }
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {createRecipeMutation.isPending ||
                    updateRecipeMutation.isPending
                      ? 'Đang lưu...'
                      : recipe
                        ? 'Cập nhật công thức'
                        : 'Lưu công thức'}
                  </Button>

                  {recipe && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleDeleteRecipe}
                      disabled={deleteRecipeMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      {deleteRecipeMutation.isPending
                        ? 'Đang xóa...'
                        : 'Xóa công thức'}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
