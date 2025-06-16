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
import { useCustomer } from '@/hooks/use-customer';
import { useToast } from '@/hooks/use-toast';
import { useCustomerClient } from '@/lib/customer-client';
import { type Dispatch, type SetStateAction, useState } from 'react';
import { z } from 'zod';

type propsType = {
  customerData: Customer | null;
  modalOpen: boolean | undefined;
  setCustomerData: Dispatch<SetStateAction<Customer | null>>;
  setModalOpen: (value: SetStateAction<boolean>) => void;
};

const isValidNewPassword = (
  firstName: string | undefined,
): {
  errorMessage: string;
  result: z.SafeParseReturnType<string, string>;
} => {
  const firstNameSchema = z
    .string()
    .trim()
    .min(8, 'Password must be at least 8 characters!')
    .refine((val) => /[a-z]/.test(val), {
      message: 'Password must contain at least one lowercase letter',
    })
    .refine((val) => /[A-Z]/.test(val), {
      message: 'Password must contain at least one uppercase letter',
    })
    .refine((val) => /\d/.test(val), {
      message: 'Password must contain at least one number',
    })
    .refine((val) => !/\s/.test(val), {
      message: 'Password cannot contain spaces',
    });
  const result = firstNameSchema.safeParse(firstName);
  const errorMessage = result.error?.issues[0].message ? result.error?.issues[0].message : '';
  return { errorMessage, result };
};

function isError(error: unknown): error is ErrorResponse {
  return typeof error === 'object';
}

const getValuesFromForm = (
  e: React.FormEvent<HTMLFormElement>,
): {
  confirmNewPassword: string;
  currentPassword: string;
  newPassword: string;
} => {
  e.preventDefault();
  const form = e.currentTarget;
  let currentPassword = '';
  let newPassword = '';
  let confirmNewPassword = '';
  const currentPasswordInput = form.elements.namedItem('current-password');
  if (currentPasswordInput instanceof HTMLInputElement) {
    currentPassword = currentPasswordInput.value;
  }
  const newPasswordInput = form.elements.namedItem('new-password');
  if (newPasswordInput instanceof HTMLInputElement) {
    newPassword = newPasswordInput.value;
  }
  const confirmNewPasswordInput = form.elements.namedItem('confirm-new-password');
  if (confirmNewPasswordInput instanceof HTMLInputElement) {
    confirmNewPassword = confirmNewPasswordInput.value;
  }
  return { confirmNewPassword, currentPassword, newPassword };
};

export default function ChangePasswordForm(props: propsType): JSX.Element | null {
  const { toast } = useToast();
  const { customerClient } = useCustomerClient();

  const [isPasswordEqual, setIsPasswordEqual] = useState(true);
  const [newPasswordError, setNewPasswordError] = useState('');
  const { reLogin } = useCustomer();

  const handleOpenChange = (open: boolean): void => {
    props.setModalOpen(open);
    if (!open) {
      setIsPasswordEqual(true);
      setNewPasswordError('');
    }
  };

  const validateNewPassword = (newPassword: string | undefined): void => {
    const { errorMessage, result } = isValidNewPassword(newPassword);
    if (result.success && newPassword) {
      setNewPasswordError('');
    } else {
      setNewPasswordError(errorMessage);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const formValues = getValuesFromForm(e);
    validateNewPassword(formValues.newPassword);
    if (formValues.newPassword !== formValues.confirmNewPassword) {
      setIsPasswordEqual(false);
    } else {
      setIsPasswordEqual(true);
      if (newPasswordError || !formValues.newPassword) {
        return;
      }
      try {
        const email = props.customerData?.email;
        await customerClient.changePassword(formValues.currentPassword, formValues.newPassword);
        if (email) {
          reLogin({ email, password: formValues.newPassword });
        }
        toast({
          description: 'Password changed',
          title: 'Success!',
          variant: 'default',
        });
        handleOpenChange(false);
      } catch (error) {
        if (isError(error)) {
          toast({
            description: error.message,
            title: 'Error!',
            variant: 'destructive',
          });
        }
      }
    }
  };
  return (
    <Dialog onOpenChange={handleOpenChange} open={props.modalOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
          <DialogDescription>You can change password here</DialogDescription>
        </DialogHeader>
        {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
        <form className="grid gap-4 py-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="col-span-4" htmlFor="current-password">
              Current Password
            </Label>
            <div className="col-span-4">
              <Input id="current-password" name="current-password" type="password"></Input>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="col-span-4" htmlFor="name">
              New password
            </Label>
            <div className="col-span-4">
              <Input id="new-password" name="new-password" type="password"></Input>
              {newPasswordError && <p className="text-sm text-red-600">{newPasswordError}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="col-span-4" htmlFor="last-name">
              Confirm new password
            </Label>
            <div className="col-span-4">
              <Input id="confirm-new-password" name="confirm-new-password" type="password"></Input>
              {!isPasswordEqual && <p className="text-sm text-red-600">{"Passwords don't match"}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
