/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import Tippy from '@tippyjs/react';
import { endpoint, isSelfHosted } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useCurrentAccount } from '$app/common/hooks/useCurrentAccount';
import { updateCompanyUsers } from '$app/common/stores/slices/company-users';
import { useEffect, useState } from 'react';
import {
  Info,
  Mail,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'react-feather';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Button } from './forms';
import { Modal } from './Modal';
import { useColorScheme } from '$app/common/colors';
import { useInjectUserChanges } from '$app/common/hooks/useInjectUserChanges';
import { useHandleCurrentUserChangeProperty } from '$app/common/hooks/useHandleCurrentUserChange';
import { useUpdateCompanyUser } from '$app/pages/settings/user/common/hooks/useUpdateCompanyUser';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import classNames from 'classnames';
import { AboutModal } from './AboutModal';
import { Icon } from './icons/Icon';
import { useQuery } from 'react-query';

interface Props {
  mobileNavbar?: boolean;
}

export function HelpSidebarIcons(props: Props) {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const user = useInjectUserChanges();
  const account = useCurrentAccount();
  const currentUser = useCurrentUser();

  const { mobileNavbar } = props;

  const dispatch = useDispatch();
  const updateCompanyUser = useUpdateCompanyUser();
  const handleUserChange = useHandleCurrentUserChangeProperty();

  const { data: currentSystemInfo } = useQuery({
    queryKey: ['/api/v1/health_check'],
    queryFn: () =>
      request('GET', endpoint('/api/v1/health_check')).then(
        (response) => response.data
      ),
    staleTime: Infinity,
    enabled: isSelfHosted(),
  });

  const [isAboutVisible, setIsAboutVisible] = useState<boolean>(false);
  const [cronsNotEnabledModal, setCronsNotEnabledModal] =
    useState<boolean>(false);
  const [disabledButton, setDisabledButton] = useState<boolean>(false);
  const isMiniSidebar = Boolean(
    user?.company_user?.react_settings.show_mini_sidebar
  );


  const refreshData = () => {
    setDisabledButton(true);

    request('POST', endpoint('/api/v1/refresh')).then((data) => {
      dispatch(updateCompanyUsers(data.data.data));
      setDisabledButton(false);
      setCronsNotEnabledModal(false);
    });
  };

  useEffect(() => {
    const showMiniSidebar =
      user?.company_user?.react_settings?.show_mini_sidebar;

    if (
      user &&
      typeof showMiniSidebar !== 'undefined' &&
      currentUser?.company_user?.react_settings?.show_mini_sidebar !==
        showMiniSidebar
    ) {
      updateCompanyUser(user);
    }
  }, [user?.company_user?.react_settings.show_mini_sidebar]);

  return (
    <>

      <Modal
        title={t('crons_not_enabled')}
        visible={cronsNotEnabledModal}
        onClose={setCronsNotEnabledModal}
      >
        <Button
          onClick={() => {
            window.open(
              'https://geninvoices.com',
              '_blank'
            );
          }}
        >
          {t('learn_more')}
        </Button>
        <Button disabled={disabledButton} onClick={refreshData}>
          {t('refresh_data')}
        </Button>
        <Button
          onClick={() => {
            setCronsNotEnabledModal(false);
          }}
        >
          {t('dismiss')}
        </Button>
      </Modal>


      <AboutModal
        isAboutVisible={isAboutVisible}
        setIsAboutVisible={setIsAboutVisible}
        currentSystemInfo={currentSystemInfo}
      />

      <nav
        style={{ borderColor: colors.$5 }}
        className={classNames('flex py-4 text-white border-t', {
          'justify-end': mobileNavbar,
          'justify-around': !mobileNavbar,
        })}
      >
        {!isMiniSidebar && !mobileNavbar && (
          <>

            {isSelfHosted() && account && !account.is_scheduler_running && (
              <button
                className="hover:bg-ninja-gray-darker rounded-full"
                onClick={() => setCronsNotEnabledModal(true)}
              >
                <Tippy
                  duration={0}
                  content={t('error')}
                  className="text-white rounded text-xs mb-2"
                >
                  <AlertCircle />
                </Tippy>
              </button>
            )}

            <div className="flex">
              <Tippy
                duration={0}
                content={t('contact_us')}
                className="text-white rounded text-xs mb-2"
              >
                <a
                  href="mailto:admin@geninvoices.com"
                  className="cursor-pointer"
                >
                  <Mail />
                </a>
              </Tippy>
            </div>



            <button
              className="hover:bg-ninja-gray-darker rounded-full overflow-visible"
              onClick={() => setIsAboutVisible(true)}
            >
              <Tippy
                duration={0}
                content={t('about')}
                className="text-white rounded text-xs mb-2"
              >
                <Info />
              </Tippy>
            </button>
          </>
        )}

        <button
          className="rounded-full"
          onClick={() =>
            handleUserChange(
              'company_user.react_settings.show_mini_sidebar',
              !isMiniSidebar
            )
          }
        >
          <Tippy
            duration={0}
            content={
              <span style={{ fontSize: isMiniSidebar ? '0.6rem' : '0.75rem' }}>
                {isMiniSidebar ? t('show_menu') : t('hide_menu')}
              </span>
            }
            className="text-white rounded mb-1.5"
          >
            {isMiniSidebar ? <ChevronRight /> : <ChevronLeft />}
          </Tippy>
        </button>
      </nav>
    </>
  );
}
