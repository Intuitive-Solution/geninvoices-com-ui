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
import { useQuery } from 'react-query';
import { route } from '$app/common/helpers/route';
import { Resource } from '$app/common/interfaces/resource';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { AxiosError } from 'axios';
import { $refetch } from '$app/common/hooks/useRefetch';

export function useResourceQuery(params: { id: string | undefined }) {
  return useQuery<Resource>(
    route('/api/v1/resources/:id', { id: params.id }),
    () =>
      request('GET', endpoint('/api/v1/resources/:id', { id: params.id })).then(
        (response: GenericSingleResourceResponse<Resource>) =>
          response.data.data
      ),
    { 
      staleTime: Infinity,
      enabled: !!params.id,
      refetchOnMount: 'always'
    }
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

const successMessages = {
  bulk_update: 'updated_records',
};

export function useBulk() {
  return (ids: string[], action: 'archive' | 'restore' | 'delete') => {
    toast.processing();

    return request('POST', endpoint('/api/v1/resources/bulk'), {
      action,
      ids,
    })
      .then(() => {
        const message =
          successMessages[action as keyof typeof successMessages] ||
          `${action}d_resource`;

        toast.success(message);

        $refetch(['resources']);
      })
      .catch((error: AxiosError) => {
        console.error(error);

        toast.error();
      });
  };
} 