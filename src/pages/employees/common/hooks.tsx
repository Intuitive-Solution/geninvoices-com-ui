import { Link } from '$app/components/forms';
import { getEntityState } from '$app/common/helpers';
import { route } from '$app/common/helpers/route';
import { Employee } from '$app/common/interfaces/employee';
import { Divider } from '$app/components/cards/Divider';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { Action } from '$app/components/ResourceActions';
import { useTranslation } from 'react-i18next';
import { MdArchive, MdDelete, MdRestore } from 'react-icons/md';
import { useBulkAction } from '$app/common/queries/employees';
import { Badge } from '$app/components/Badge';
import { useMutation } from 'react-query';

export const defaultColumns = [
  'name',
  'emp_id',
  'department',
  'designation',
  'status',
];

export function useEmployeeColumns() {
  const { t } = useTranslation();

  const columns = [
    {
      id: 'name',
      label: t('name'),
      format: (value: any, employee: Employee) => (
        <Link to={route('/employees/:id/edit', { id: employee.id })}>
          {employee.name}
        </Link>
      ),
    },
    {
      id: 'emp_id',
      label: t('employee_id'),
      format: (value: any, employee: Employee) => employee.emp_id,
    },
    {
      id: 'department',
      label: t('department'),
      format: (value: any, employee: Employee) => employee.department,
    },
    {
      id: 'designation',
      label: t('designation'),
      format: (value: any, employee: Employee) => employee.designation,
    },
    {
      id: 'status',
      label: t('status'),
      format: (value: any, employee: Employee) => (
        <Badge
          variant={employee.status === 'active' ? 'green' : 'yellow'}
        >
          {t(employee.status)}
        </Badge>
      ),
    },
  ];

  return columns;
}

export function useActions() {
  const { t } = useTranslation();
  const bulkActionConfig = useBulkAction();
  const bulk = useMutation(bulkActionConfig);

  const actions: Action<Employee>[] = [
    (employee) => (
      <DropdownElement
        onClick={() => {
          bulk.mutate({
            action: employee.status === 'active' ? 'deactivate' : 'activate',
            ids: [employee.id],
          });
        }}
        icon={<Icon element={MdArchive} />}
      >
        {employee.status === 'active' ? t('deactivate') : t('activate')}
      </DropdownElement>
    ),
    () => <Divider withoutPadding />,
    (employee) => (
      <DropdownElement
        onClick={() => {
          bulk.mutate({
            action: getEntityState(employee) === 'archived' ? 'restore' : 'archive',
            ids: [employee.id],
          });
        }}
        icon={<Icon element={getEntityState(employee) === 'archived' ? MdRestore : MdArchive} />}
      >
        {getEntityState(employee) === 'archived' ? t('restore') : t('archive')}
      </DropdownElement>
    ),
    (employee) => (
      <DropdownElement
        onClick={() => {
          bulk.mutate({
            action: 'delete',
            ids: [employee.id],
          });
        }}
        icon={<Icon element={MdDelete} />}
      >
        {t('delete')}
      </DropdownElement>
    ),
  ];

  return actions;
}

export function useEmployeeFilters() {
  const { t } = useTranslation();

  const filters = [
    {
      label: t('status'),
      column: 'status',
      type: 'select',
      options: [
        { label: t('active'), value: 'active' },
        { label: t('inactive'), value: 'inactive' },
      ],
    },
    {
      label: t('department'),
      column: 'department',
      type: 'text',
    },
    {
      label: t('designation'),
      column: 'designation',
      type: 'text',
    },
  ];

  return filters;
}