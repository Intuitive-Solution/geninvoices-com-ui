import { Card, Element } from '$app/components/cards';
import { InputField } from '$app/components/forms';
import { useTitle } from '$app/common/hooks/useTitle';
import { Employee } from '$app/common/interfaces/employee';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useEmployeeQuery, useEmployeeSave } from '$app/common/queries/employees';
import { Page } from '$app/components/Breadcrumbs';
import { Default } from '$app/components/layouts/Default';
import { Spinner } from '$app/components/Spinner';
import { EntityStatus } from '$app/components/EntityStatus';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { ResourceActions } from '$app/components/ResourceActions';
import { useActions } from '../common/hooks';

export default function Edit() {
  const { documentTitle } = useTitle('edit_employee');
  const { t } = useTranslation();

  const { id } = useParams();

  const pages: Page[] = [
    { name: t('employees'), href: '/employees' },
    { name: t('edit_employee'), href: `/employees/${id}/edit` },
  ];

  const { data } = useEmployeeQuery({ id });

  const [employee, setEmployee] = useState<Employee>();
  const [errors, setErrors] = useState<ValidationBag>();
  const [saveChanges, setSaveChanges] = useState<boolean>(false);
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const actions = useActions();
  
  const employeeSave = useEmployeeSave({
    setErrors: (validationErrors: Record<string, any>) => setErrors(validationErrors as ValidationBag),
  });

  useEffect(() => {
    if (data) {
      setEmployee(data.data.data);
    }
  }, [data]);

  const handleChange = (property: keyof Employee, value: string) => {
    setEmployee((current) => current && { ...current, [property]: value });
  };

  const handleSave = () => {
    if (!employee) {
      return;
    }

    setErrors(undefined);
    setIsFormBusy(true);
    
    employeeSave.mutationFn(employee)
      .then((response) => {
        employeeSave.onSuccess(response);
        setIsFormBusy(false);
      })
      .catch((error) => {
        employeeSave.onError(error);
        setIsFormBusy(false);
      });
  };

  useEffect(() => {
    if (saveChanges && employee) {
      handleSave();
      setSaveChanges(false);
    }
  }, [saveChanges, employee]);





  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      navigationTopRight={
        employee && (
          <ResourceActions
            resource={employee}
            actions={actions}
            onSaveClick={() => setSaveChanges(true)}
            disableSaveButton={isFormBusy}
            cypressRef="employeeActionDropdown"
          />
        )
      }
    >
      {employee ? (
        <div className="grid grid-cols-12 gap-4">
          <Card className="col-span-12 xl:col-span-8 h-max" withScrollableBody>
            <Element leftSide={t('name')}>
              <InputField
                value={employee.name}
                onValueChange={(value) => handleChange('name', value)}
                errorMessage={errors?.errors.name}
              />
            </Element>

            <Element leftSide={t('employee_id')}>
              <InputField
                value={employee.emp_id}
                onValueChange={(value) => handleChange('emp_id', value)}
                errorMessage={errors?.errors.emp_id}
              />
            </Element>

            <Element leftSide={t('department')}>
              <InputField
                value={employee.department}
                onValueChange={(value) => handleChange('department', value)}
                errorMessage={errors?.errors.department}
              />
            </Element>

            <Element leftSide={t('designation')}>
              <InputField
                value={employee.designation}
                onValueChange={(value) => handleChange('designation', value)}
                errorMessage={errors?.errors.designation}
              />
            </Element>

            <Element leftSide={t('email')}>
              <InputField
                value={employee.email}
                onValueChange={(value) => handleChange('email', value)}
                errorMessage={errors?.errors.email}
              />
            </Element>

            <Element leftSide={t('status')}>
              <EntityStatus entity={employee} />
            </Element>


          </Card>
        </div>
      ) : (
        <div className="flex justify-center">
          <Spinner />
        </div>
      )}
    </Default>
  );
}
