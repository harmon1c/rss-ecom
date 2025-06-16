import type { Customer, ErrorResponse } from '@commercetools/platform-sdk';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useCustomerClient } from '@/lib/customer-client';
import { type Dispatch, type SetStateAction, useEffect, useState } from 'react';
import { z } from 'zod';

type propsType = {
  customerData: Customer | null;
  modalOpen: boolean | undefined;
  setCustomerData: Dispatch<SetStateAction<Customer | null>>;
  setModalOpen: (value: SetStateAction<boolean>) => void;
};

function isError(error: unknown): error is ErrorResponse {
  return typeof error === 'object';
}

const isValidFirstName = (
  firstName: string | undefined,
): {
  errorMessage: string;
  result: z.SafeParseReturnType<string, string>;
} => {
  const errorMessage = 'First name can only contain letters, spaces, hyphens and apostrophes';
  const firstNameSchema = z
    .string()
    .trim()
    .min(1, 'First name is required')
    .refine((val) => /^[A-Za-zА-Яа-я\s'-]+$/.test(val), {
      message: errorMessage,
    });
  const result = firstNameSchema.safeParse(firstName);
  return { errorMessage, result };
};

const isValidLastName = (
  firstName: string | undefined,
): {
  errorMessage: string;
  result: z.SafeParseReturnType<string, string>;
} => {
  const errorMessage = 'Last name can only contain letters, spaces, hyphens and apostrophes';
  const firstNameSchema = z
    .string()
    .trim()
    .min(1, 'First name is required')
    .refine((val) => /^[A-Za-zА-Яа-я\s'-]+$/.test(val), {
      message: errorMessage,
    });
  const result = firstNameSchema.safeParse(firstName);
  return { errorMessage, result };
};

const isValidDate = (
  dateOfBirth: string | undefined,
): {
  errorMessage: string;
  result: z.SafeParseReturnType<Date, Date>;
} => {
  let errorMessage = '';
  const dateSchema = z
    .date()
    .refine(
      (date) => {
        const today = new Date();
        const minimumAge = 13;
        const cutoffDate = new Date(today.getFullYear() - minimumAge, today.getMonth(), today.getDate());
        if (date > cutoffDate) {
          errorMessage = 'You must be at least 13 years old!';
        }
        return date > cutoffDate;
      },
      { message: 'You must be at least 13 years old!' },
    )
    .refine(
      (date) => {
        const today = new Date();
        const maximumAge = 120;
        const cutoffDate = new Date(today.getFullYear() - maximumAge, today.getMonth(), today.getDate());
        if (date < cutoffDate) {
          errorMessage = 'You must be no older than 120 years old!';
        }
        return date < cutoffDate;
      },
      { message: 'You must be no older than 120 years old!' },
    );
  const result = dateSchema.safeParse(dateOfBirth ? new Date(dateOfBirth) : new Date('2000-01-01'));
  return { errorMessage, result };
};

const getValuesFromForm = (
  e: React.FormEvent<HTMLFormElement>,
): {
  dateOfBirth: string;
  email: string;
  firstName: string;
  lastName: string;
} => {
  e.preventDefault();
  const form = e.currentTarget;
  const nameInput = form.elements.namedItem('name');
  let firstName = '';
  let email = '';
  let lastName = '';
  let dateOfBirth = '';
  if (nameInput instanceof HTMLInputElement) {
    firstName = nameInput.value;
  }
  const emailInput = form.elements.namedItem('email');
  if (emailInput instanceof HTMLInputElement) {
    email = emailInput.value;
  }
  const lastNameInput = form.elements.namedItem('last-name');
  if (lastNameInput instanceof HTMLInputElement) {
    lastName = lastNameInput.value;
  }
  const dateOfBirthInput = form.elements.namedItem('date-of-birth');
  if (dateOfBirthInput instanceof HTMLInputElement) {
    dateOfBirth = dateOfBirthInput.value;
  }
  return { dateOfBirth, email, firstName, lastName };
};

export default function PersonalInfoForm(props: propsType): JSX.Element | null {
  const validateEmail = (email: string | undefined): void => {
    const errorMessage = 'Invalid email';
    const emailSchema = z.string().email(errorMessage);
    const result = emailSchema.safeParse(email);
    if (result.success && email) {
      setEmailError('');
    } else {
      setEmailError(errorMessage);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { value } = e.target;
    setEmail(value);
    validateEmail(value);
  };

  const validateDateOfBirth = (dateOfBirth: string | undefined): void => {
    const { errorMessage, result } = isValidDate(dateOfBirth);
    if (result.success && dateOfBirth) {
      setDateOfBirthError('');
    } else {
      setDateOfBirthError(errorMessage);
    }
  };

  const handleDateOfBirthChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { value } = e.target;
    setDateOfBirth(value);

    validateDateOfBirth(value);
  };

  const validateLastName = (lastName: string | undefined): void => {
    const { errorMessage, result } = isValidLastName(lastName);
    if (result.success && lastName) {
      setLastNameError('');
    } else {
      setLastNameError(errorMessage);
    }
  };

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { value } = e.target;
    setLastName(value);
    validateLastName(value);
  };

  const validateFirstName = (firstName: string | undefined): void => {
    const { errorMessage, result } = isValidFirstName(firstName);
    if (result.success && firstName) {
      setFirstNameError('');
    } else {
      setFirstNameError(errorMessage);
    }
  };

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { value } = e.target;
    setFirstName(value);

    validateFirstName(value);
  };

  const { toast } = useToast();
  const { customerClient } = useCustomerClient();
  const [email, setEmail] = useState(props.customerData?.email);
  const [emailError, setEmailError] = useState('');
  const [firstName, setFirstName] = useState(props.customerData?.firstName);
  const [firstNameError, setFirstNameError] = useState('');
  const [lastName, setLastName] = useState(props.customerData?.lastName);
  const [lastNameError, setLastNameError] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(props.customerData?.lastName);
  const [dateOfBirthError, setDateOfBirthError] = useState('');
  const [canBeSubmitted, setCanBeSubmitted] = useState(true);

  useEffect(() => {
    setEmail(props.customerData?.email);
    setFirstName(props.customerData?.firstName);
    setLastName(props.customerData?.lastName);
    setDateOfBirth(props.customerData?.dateOfBirth);
  }, [props]);

  useEffect(() => {
    const check = [emailError, firstNameError, lastNameError, dateOfBirthError].some((error) => error);
    if (check) {
      setCanBeSubmitted(false);
    } else {
      setCanBeSubmitted(true);
    }
  }, [emailError, firstNameError, lastNameError, dateOfBirthError, canBeSubmitted]);

  const handleOpenChange = (open: boolean): void => {
    props.setModalOpen(open);
    if (!open) {
      setEmailError('');
      setFirstNameError('');
      setLastNameError('');
      setDateOfBirthError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const formValues = getValuesFromForm(e);
    try {
      await customerClient.updatePersonalInfo(formValues);
      props.setCustomerData((prev) => (prev ? { ...prev, ...formValues } : null));
      toast({
        description: 'Customer updated!',
        title: 'Success',
      });
    } catch (error) {
      if (isError(error)) {
        toast({
          description: error.message,
          title: 'Error!',
          variant: 'destructive',
        });
      }
    }
  };
  return (
    <Dialog onOpenChange={handleOpenChange} open={props.modalOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Make changes to your profile here. Click save when you&apos;re done.</DialogDescription>
        </DialogHeader>
        {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
        <form className="grid gap-4 py-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="col-span-4" htmlFor="email">
              E-mail
            </Label>
            <div className="col-span-4">
              <Input id="email" name="email" onChange={handleEmailChange} value={email} />
              {emailError && props.customerData?.email !== email && (
                <p className="text-sm text-red-600">{emailError}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="col-span-4" htmlFor="name">
              Name
            </Label>
            <div className="col-span-4">
              <Input
                defaultValue={props.customerData?.firstName}
                id="name"
                name="name"
                onChange={handleFirstNameChange}
              />
              {firstNameError && props.customerData?.firstName !== firstName && (
                <p className="text-sm text-red-600">{firstNameError}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="col-span-4" htmlFor="last-name">
              Last name
            </Label>
            <div className="col-span-4">
              <Input
                className="col-span-3"
                defaultValue={props.customerData?.lastName}
                id="last-name"
                name="last-name"
                onChange={handleLastNameChange}
              />
              {lastNameError && props.customerData?.lastName !== lastName && (
                <p className="text-sm text-red-600">{lastNameError}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="col-span-4" htmlFor="date-of-birth">
              Date of birth
            </Label>
            <div className="col-span-4">
              <Input
                className="col-span-3"
                defaultValue={props.customerData?.dateOfBirth}
                name="date-of-birth"
                onChange={handleDateOfBirthChange}
                type="date"
              />
              {dateOfBirthError && props.customerData?.dateOfBirth !== dateOfBirth && (
                <p className="text-sm text-red-600">{dateOfBirthError}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button disabled={!canBeSubmitted} type="submit">
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
