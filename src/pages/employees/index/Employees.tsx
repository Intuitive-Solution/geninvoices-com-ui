import { useTitle } from '$app/common/hooks/useTitle';
import { Page } from '$app/components/Breadcrumbs';
import { DataTable } from '$app/components/DataTable';
import { Default } from '$app/components/layouts/Default';
import { useTranslation } from 'react-i18next';
import {
  defaultColumns,
  useActions,
  useEmployeeColumns,
  useEmployeeFilters,
} from '../common/hooks';
import { DataTableColumnsPicker } from '$app/components/DataTableColumnsPicker';
import { ImportButton } from '$app/components/import/ImportButton';
import { Guard } from '$app/common/guards/Guard';
import { permission } from '$app/common/guards/guards/permission';

export default function Employees() {
  const { documentTitle } = useTitle('employees');
  const { t } = useTranslation();

  const pages: Page[] = [{ name: t('employees'), href: '/employees' }];

  const columns = useEmployeeColumns();
  const actions = useActions();
  const filters = useEmployeeFilters();

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      docsLink="docs/employees/"
      withoutBackButton
    >
      <DataTable
        resource="employee"
        endpoint="/api/v1/employees?include=company"
        columns={columns}
        bulkRoute="/api/v1/employees/bulk"
        linkToCreate="/employees/create"
        linkToEdit="/employees/:id/edit"
        withResourcefulActions
        customActions={actions}
        customFilters={filters}
        rightSide={
          <Guard
            guards={[permission('create_employee')]}
            component={<ImportButton route="/employees/import" />}
          />
        }
      />

      <DataTableColumnsPicker
        columns={columns as unknown as string[]}
        defaultColumns={defaultColumns}
        table="employee"
      />
    </Default>
  );
}