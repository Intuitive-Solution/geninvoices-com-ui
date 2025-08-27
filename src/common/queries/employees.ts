import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { Employee } from '$app/common/interfaces/employee';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useQuery, useQueryClient } from 'react-query';
import { route } from '$app/common/helpers/route';

interface EmployeeQueryOptions {
  params?: {
    per_page?: string;
    page?: string;
  };
  reactQueryOptions?: any;
}

export function useEmployeesQuery(options?: EmployeeQueryOptions) {
  return useQuery(
    route('/api/v1/employees', options?.params),
    () =>
      request(
        'GET',
        endpoint('/api/v1/employees?per_page=:per_page&page=:page', {
          per_page: options?.params?.per_page || '100',
          page: options?.params?.page || '1',
        })
      ),
    {
      ...options?.reactQueryOptions,
    }
  );
}

export function useEmployeeQuery(params: { id: string | undefined }) {
  return useQuery(
    route('/api/v1/employees/:id', { id: params.id }),
    () =>
      request('GET', endpoint('/api/v1/employees/:id', { id: params.id })),
    {
      enabled: Boolean(params.id),
      staleTime: Infinity,
    }
  );
}

export function useBlankEmployeeQuery() {
  return useQuery(
    route('/api/v1/employees/create'),
    () => request('GET', endpoint('/api/v1/employees/create')),
    {
      staleTime: Infinity,
    }
  );
}

interface EmployeeSaveProps {
  setErrors: (errors: Record<string, any>) => unknown;
}

export function useEmployeeSave(props: EmployeeSaveProps) {
  const queryClient = useQueryClient();

  return {
    mutationFn: (employee: Employee) => {
      const endpointUrl = employee.id
        ? endpoint('/api/v1/employees/:id', { id: employee.id })
        : endpoint('/api/v1/employees');

      return request(employee.id ? 'PUT' : 'POST', endpointUrl, employee);
    },
    onSuccess: (response: GenericSingleResourceResponse<Employee>) => {
      const isUpdate = Boolean(response.data.data.id);
      
      toast.success(isUpdate ? 'updated_employee' : 'created_employee');

      // Invalidate the employees list query
      queryClient.invalidateQueries('/api/v1/employees');
      
      // Invalidate the specific employee query
      queryClient.invalidateQueries(
        route('/api/v1/employees/:id', { id: response.data.data.id })
      );
      
      // Invalidate any employees queries with different parameters
      queryClient.invalidateQueries({ queryKey: ['/api/v1/employees'] });
    },
    onError: (error: any) => {
      console.error(error);

      toast.error();

      if (error.response?.status === 422) {
        props.setErrors(error.response.data);
      }
    },
  };
}

export function useBulkAction() {
  const queryClient = useQueryClient();

  return {
    mutationFn: (data: { action: string; ids: string[] }) =>
      request('POST', endpoint('/api/v1/employees/bulk'), data),
    onSuccess: () => {
      toast.success('employee_updated');

      $refetch(['employees']);

      queryClient.invalidateQueries('/api/v1/employees');
    },
    onError: (error: any) => {
      console.error(error);
      toast.error();
    },
  };
}