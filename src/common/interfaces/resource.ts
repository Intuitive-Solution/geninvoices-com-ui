/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { User } from './user';
import { Company } from './company.interface';

export interface Resource {
  id: string;
  user_id: string;
  assigned_user_id: string;
  company_id: string;
  name: string;
  description: string;
  rate: number;
  custom_value1: string;
  custom_value2: string;
  custom_value3: string;
  custom_value4: string;
  is_deleted: boolean;
  created_at: number;
  updated_at: number;
  archived_at: number;
  entity_type: string;
  user?: User;
  assigned_user?: User;
  company?: Company;
} 