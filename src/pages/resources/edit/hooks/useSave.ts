/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosError } from 'axios';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { Resource } from '$app/common/interfaces/resource';
import { ValidationBag } from '$app/common/interfaces/validation-bag';

import { $refetch } from '$app/common/hooks/useRefetch';

interface Props {
  setErrors?: (errors: ValidationBag | undefined) => unknown;
}

export function useSave(params: Props) {
  const { setErrors } = params;

  return (resource: Resource) => {
    toast.processing();

    setErrors?.(undefined);

    request(
      'PUT',
      endpoint('/api/v1/resources/:id', { id: resource.id }),
      resource
    )
      .then(() => {
        toast.success('updated_resource');

        $refetch(['resources']);
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 422) {
          setErrors?.(error.response.data);
          toast.dismiss();
        }
      });
  };
} 