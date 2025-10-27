import TableManagementPage from '@/app/manage/setting-table/SettingTablePage';
import React from 'react';
import LowStockWarningDialog from '@/components/lowStockWarningDialog';

export default function Page() {
  return (
    <>
      <TableManagementPage />
      <LowStockWarningDialog />
    </>
  );
}
