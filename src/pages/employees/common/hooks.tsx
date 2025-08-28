import { Link } from '$app/components/forms';
import { getEntityState } from '$app/common/helpers';
import { route } from '$app/common/helpers/route';
import { Employee } from '$app/common/interfaces/employee';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { Action } from '$app/components/ResourceActions';
import { useTranslation } from 'react-i18next';
import { MdArchive, MdDelete, MdRestore } from 'react-icons/md';
import { useBulkAction } from '$app/common/queries/employees';
import { EntityStatus } from '$app/components/EntityStatus';
import { useMutation } from 'react-query';

export const defaultColumns = [
  'name',
  'emp_id',
  'department',
  'designation',
  'entity_state',
];

export function useEmployeeColumns() {
  const { t } = useTranslation();

  const columns = [
    {
      id: 'name',
      label: t('name'),
      format: (_: any, employee: Employee) => (
        <Link to={route('/employees/:id/edit', { id: employee.id })}>
          {employee.name}
        </Link>
      ),
    },
    {
      id: 'emp_id',
      label: t('employee_id'),
      format: (_: any, employee: Employee) => employee.emp_id,
    },
    {
      id: 'department',
      label: t('department'),
      format: (_: any, employee: Employee) => employee.department,
    },
    {
      id: 'designation',
      label: t('designation'),
      format: (_: any, employee: Employee) => employee.designation,
    },
    {
      id: 'entity_state',
      label: t('entity_state'),
      format: (_: any, employee: Employee) => <EntityStatus entity={employee} />,
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
      label: t('entity_state'),
      column: 'entity_state',
      type: 'select',
      options: [
        { label: t('active'), value: 'active' },
        { label: t('archived'), value: 'archived' },
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