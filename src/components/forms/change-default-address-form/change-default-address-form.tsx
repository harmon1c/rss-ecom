import type { Customer, ErrorResponse } from '@commercetools/platform-sdk';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useCustomerClient } from '@/lib/customer-client';
import { type Dispatch, type SetStateAction, useEffect, useState } from 'react';

const countrySwitch = (country: string): string => {
  switch (country) {
    case 'CA':
      return 'Canada';
    case 'DE':
      return 'Germany';
    case 'FR':
      return 'France';
    case 'GB':
      return 'Great Britain';
    case 'US':
      return 'United States';
    default:
      return 'No data';
  }
};
type propsType = {
  addressId?: string;
  customerData: Customer | null;
  modalOpen: boolean | undefined;
  setCustomerData: Dispatch<SetStateAction<Customer | null>>;
  setModalOpen: (value: SetStateAction<boolean>) => void;
};

function isError(error: unknown): error is ErrorResponse {
  return typeof error === 'object';
}

export default function ChangeDefaultAddressesForm(props: propsType): JSX.Element | null {
  const { toast } = useToast();
  const { customerClient } = useCustomerClient();
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [selectedAddress, setSelectedAddress] = useState(props.customerData?.addresses[0]);
  const [checkDefaultShippingAddress, setCheckDefaultShippingAddress] = useState(false);
  const [checkDefaultBillingAddress, setCheckDefaultBillingAddress] = useState(false);
  const [checkDisabledDefaultShippingAddress, setCheckDisabledDefaultShippingAddress] = useState(false);
  const [checkDisabledDefaultBillingAddress, setCheckDisabledDefaultBillingAddress] = useState(false);

  useEffect(() => {
    setSelectedAddress(props.customerData?.addresses.find((address) => address.id === selectedAddressId));
  }, [props.customerData?.addresses, selectedAddressId]);

  const handleOpenChange = (open: boolean): void => {
    props.setModalOpen(open);
    if (!open) {
      setSelectedAddressId('');
    }
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      if (checkDefaultShippingAddress) {
        const updatedClient = await customerClient.updateDefaultShippingAddress(selectedAddressId);
        props.setCustomerData(updatedClient);
      }
      if (checkDefaultBillingAddress) {
        const updatedClient = await customerClient.updateDefaultBillingAddress(selectedAddressId);
        props.setCustomerData(updatedClient);
      }
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
          <DialogTitle>Address defaults</DialogTitle>
          <DialogDescription>You can change addresses defaults here</DialogDescription>
        </DialogHeader>
        {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
        <form className="grid gap-4 py-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="col-span-4" htmlFor="current-password">
              Address defaults you want to change
            </Label>
            <div className="col-span-4">
              <Select
                defaultValue={selectedAddressId}
                onValueChange={(value) => {
                  setSelectedAddressId(value);
                  if (props.customerData?.defaultShippingAddressId === value) {
                    setCheckDefaultShippingAddress(true);
                    setCheckDisabledDefaultShippingAddress(true);
                  } else {
                    setCheckDefaultShippingAddress(false);
                    setCheckDisabledDefaultShippingAddress(false);
                  }
                  if (props.customerData?.defaultBillingAddressId === value) {
                    setCheckDefaultBillingAddress(true);
                    setCheckDisabledDefaultBillingAddress(true);
                  } else {
                    setCheckDefaultBillingAddress(false);
                    setCheckDisabledDefaultBillingAddress(false);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an address" />
                </SelectTrigger>

                <SelectContent>
                  {props.customerData?.addresses.map((address) => (
                    <SelectItem
                      key={address.id}
                      value={address.id ? address.id : ''}
                    >{`${address.city} - ${address.streetName}`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedAddressId ? (
                <div>
                  <Card className="group/editAddress relative w-full mb-8">
                    <CardHeader>
                      <CardTitle>Selected Address</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p>Country: {countrySwitch(selectedAddress?.country ? selectedAddress?.country : '')}</p>
                      <p>City: {selectedAddress?.city}</p>
                      <p>Postal Code: {selectedAddress?.postalCode}</p>
                      <p>Street: {selectedAddress?.streetName}</p>
                    </CardContent>
                  </Card>
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={checkDefaultShippingAddress}
                        disabled={checkDisabledDefaultShippingAddress}
                        id="default-shipping-address"
                        onCheckedChange={(val) => setCheckDefaultShippingAddress(!!val)}
                      ></Checkbox>
                      <Label htmlFor="default-shipping-address">Default shipping address</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={checkDefaultBillingAddress}
                        disabled={checkDisabledDefaultBillingAddress}
                        id="default-billing-address"
                        onCheckedChange={(val) => setCheckDefaultBillingAddress(!!val)}
                      ></Checkbox>
                      <Label htmlFor="default-billing-address">Default billing address</Label>
                    </div>
                  </div>
                </div>
              ) : (
                ''
              )}
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
