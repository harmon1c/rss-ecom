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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useCustomerClient } from '@/lib/customer-client';
import { type ChangeEvent, type Dispatch, type SetStateAction, useEffect, useState } from 'react';
import { z } from 'zod';

type propsType = {
  addressId?: string;
  customerData: Customer | null;
  modalOpen: boolean | undefined;
  setCustomerData: Dispatch<SetStateAction<Customer | null>>;
  setModalOpen: (value: SetStateAction<boolean>) => void;
};

const isValidCity = (
  city: string | undefined,
): {
  errorMessage: string;
  result: z.SafeParseReturnType<string, string>;
} => {
  const citySchema = z
    .string()
    .min(1, 'City is required')
    .refine((val) => /^[A-Za-zА-Яа-я\s'-]+$/.test(val), {
      message: 'City can only contain letters, spaces, hyphens and apostrophes',
    })
    .refine((val) => val.trim() === val, {
      message: 'City cannot start or end with whitespace',
    });
  const result = citySchema.safeParse(city);
  const errorMessage = result.error?.issues[0].message ? result.error?.issues[0].message : '';
  return { errorMessage, result };
};

const isValidPostalCode = (
  postalCode: string | undefined,
  country: string,
): {
  errorMessage: string;
  result: z.SafeParseReturnType<string, string>;
} => {
  const postalCodePatterns: Record<string, { format: string; pattern: RegExp }> = {
    CA: {
      format: 'A1A 1A1 (e.g., M5V 3L9)',
      pattern: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
    },
    DE: {
      format: '12345',
      pattern: /^\d{5}$/,
    },
    FR: {
      format: '12345',
      pattern: /^\d{5}$/,
    },
    GB: {
      format: 'AA1 1AA, A1 1AA, etc.',
      pattern: /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i,
    },
    US: {
      format: '12345 or 12345-6789',
      pattern: /^\d{5}(-\d{4})?$/,
    },
  };
  const postalCodeSchema = z
    .string()
    .refine(() => postalCodePatterns[country], {
      message: 'Select country',
    })
    .refine(
      (val) => {
        if (postalCodePatterns[country]) {
          return postalCodePatterns[country].pattern.test(val);
        }
        return true;
      },
      {
        message: postalCodePatterns[country] ? `Change format to ${postalCodePatterns[country].format}` : '',
      },
    )
    .refine((val) => val.trim() === val, {
      message: 'Postal code cannot start or end with whitespace',
    });
  const result = postalCodeSchema.safeParse(postalCode);
  const errorMessage = result.error?.issues[0].message ? result.error?.issues[0].message : '';
  return { errorMessage, result };
};

const isValidStreet = (
  street: string | undefined,
): {
  errorMessage: string;
  result: z.SafeParseReturnType<string, string>;
} => {
  const streetSchema = z
    .string()
    .min(1, 'Street is required')
    .refine((val) => val.trim() === val, {
      message: 'Street cannot start or end with whitespace',
    });
  const result = streetSchema.safeParse(street);
  const errorMessage = result.error?.issues[0].message ? result.error?.issues[0].message : '';
  return { errorMessage, result };
};

function isError(error: unknown): error is ErrorResponse {
  return typeof error === 'object';
}

export default function AddressForm(props: propsType): JSX.Element | null {
  const { toast } = useToast();
  const { customerClient } = useCustomerClient();

  const [cityError, setCityError] = useState('');
  const [city, setCity] = useState('');
  const [postalCodeError, setPostalCodeError] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [street, setStreet] = useState('');
  const [streetError, setStreetError] = useState('');
  const [canBeSubmitted, setCanBeSubmitted] = useState(true);

  useEffect(() => {
    const check = [cityError, postalCodeError, streetError].some((error) => error);
    const checkIfBlank = [city, postalCode, street, selectedCountry].some((value) => !value);
    if (check || checkIfBlank) {
      setCanBeSubmitted(false);
    } else {
      setCanBeSubmitted(true);
    }
  }, [cityError, postalCodeError, streetError, city, street, selectedCountry, postalCode]);

  useEffect(() => {
    const selectedAddress = props.customerData?.addresses.find((address) => address.id === props.addressId);
    if (selectedAddress?.city) {
      setCity(selectedAddress?.city);
    }
    if (selectedAddress?.country) {
      setSelectedCountry(selectedAddress?.country);
    }
    if (selectedAddress?.postalCode) {
      setPostalCode(selectedAddress?.postalCode);
    }
    if (selectedAddress?.streetName) {
      setStreet(selectedAddress.streetName);
    }
  }, [props]);

  const handleOpenChange = (open: boolean): void => {
    props.setModalOpen(open);
    if (!open) {
      setCityError('');
      setStreetError('');
      setPostalCodeError('');
      setCity('');
      setStreet('');
      setPostalCode('');
      setSelectedCountry('');
    }
  };

  const validateField = (
    isValidField: (field: string | undefined) => {
      errorMessage: string;
      result: z.SafeParseReturnType<string, string>;
    },
    setFieldError: (value: SetStateAction<string>) => void,
    field: string,
  ): void => {
    const { errorMessage, result } = isValidField(field);
    if (result.success && city) {
      setFieldError('');
    } else {
      setFieldError(errorMessage);
    }
  };

  const handleFieldChange = (e: ChangeEvent<HTMLInputElement>, field: 'city' | 'postal-code' | 'street'): void => {
    const newValue = e.target.value;
    switch (field) {
      case 'city':
        setCity(newValue);
        validateField(isValidCity, setCityError, newValue);
        break;
      case 'postal-code':
        setPostalCode(newValue);
        validateField(() => isValidPostalCode(newValue, selectedCountry), setPostalCodeError, newValue);
        break;
      case 'street':
        setStreet(newValue);
        validateField(isValidStreet, setStreetError, newValue);
        break;
      default:
        throw new TypeError('Wrong field type');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      const address = {
        city,
        country: selectedCountry,
        postalCode,
        streetName: street,
      };
      if (props.addressId) {
        props.setCustomerData(await customerClient.updateAddress(address, props.addressId));
      } else {
        props.setCustomerData(await customerClient.addAddress(address));
      }
      toast({
        description: props.addressId ? 'Address updated!' : 'Address added!',
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
          <DialogTitle>{props.addressId ? 'Edit Address' : 'Add Address'}</DialogTitle>
          <DialogDescription>
            {props.addressId ? 'You can edit address here' : 'You can add address here'}
          </DialogDescription>
        </DialogHeader>
        {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
        <form className="grid gap-4 py-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="col-span-4" htmlFor="current-password">
              Country
            </Label>
            <div className="col-span-4">
              <Select
                defaultValue={selectedCountry}
                onValueChange={(value) => {
                  setSelectedCountry(value);
                  validateField(() => isValidPostalCode(postalCode, value), setPostalCodeError, postalCode);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="GB">United Kingdom</SelectItem>
                  <SelectItem value="FR">France</SelectItem>
                  <SelectItem value="DE">Germany</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="col-span-4" htmlFor="name">
              City
            </Label>
            <div className="col-span-4">
              <Input id="city" name="city" onChange={(e) => handleFieldChange(e, 'city')} value={city}></Input>
              {cityError && <p className="text-sm text-red-600">{cityError}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="col-span-4" htmlFor="last-name">
              Postal Code
            </Label>
            <div className="col-span-4">
              <Input
                id="postal-code"
                name="postal-code"
                onChange={(e) => handleFieldChange(e, 'postal-code')}
                value={postalCode}
              ></Input>
              {postalCodeError && <p className="text-sm text-red-600">{postalCodeError}</p>}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="col-span-4" htmlFor="last-name">
              Street
            </Label>
            <div className="col-span-4">
              <Input id="street" name="street" onChange={(e) => handleFieldChange(e, 'street')} value={street}></Input>
              {streetError && <p className="text-sm text-red-600">{streetError}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button disabled={!canBeSubmitted} type="submit">
              {props.addressId ? 'Save changes' : 'Add address'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
