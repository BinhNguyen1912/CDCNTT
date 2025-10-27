import RecipeManagement from './recipe-management';
import LowStockWarningDialog from '@/components/lowStockWarningDialog';

export default function RecipeManagementPage() {
  return (
    <>
      <RecipeManagement />
      <LowStockWarningDialog />
    </>
  );
}
