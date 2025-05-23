/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { useQuery, useQueryClient } from 'react-query';
import { route } from '$app/common/helpers/route';
import { Resource } from '$app/common/interfaces/resource';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { AxiosError } from 'axios';

export function useResourceQuery(params: { id: string | undefined }) {
  return useQuery<Resource>(
    route('/api/v1/resources/:id', { id: params.id }),
    () =>
      request('GET', endpoint('/api/v1/resources/:id', { id: params.id })).then(
        (response: GenericSingleResourceResponse<Resource>) =>
          response.data.data
      ),
    { staleTime: Infinity }
  );
}

export function useResourcesQuery(params: { perPage?: number } = {}) {
  return useQuery<Resource[]>(
    ['/api/v1/resources', params.perPage],
    () =>
      request(
        'GET',
        endpoint('/api/v1/resources?per_page=:perPage', {
          perPage: params.perPage || 100,
        })
      ).then((response) => response.data.data),
    { staleTime: Infinity }
  );
}

export function useBulk() {
  const queryClient = useQueryClient();

  return (id: string[], action: 'archive' | 'restore' | 'delete') => {
    toast.processing();

    request('POST', endpoint('/api/v1/resources/bulk'), {
      action,
      ids: id,
    })
      .then(() => {
        toast.success(`${action}d_resource`);

        queryClient.invalidateQueries('/api/v1/resources');
      })
      .catch((error: AxiosError) => {
        console.error(error);

        toast.error();
      });
  };
} 