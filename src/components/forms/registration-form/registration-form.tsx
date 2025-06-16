'use client';

import type { ControllerRenderProps, FieldPath } from 'react-hook-form';

import { StyledInput } from '@/components/ui/StyledInput';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useCustomer } from '@/hooks/use-customer';
import { useResponsiveToast } from '@/hooks/use-responsive-toast';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Eye, EyeOff } from 'lucide-react';
import { forwardRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export type PasswordInputProps<TFieldValues extends Record<string, unknown> = Record<string, unknown>> = {
  field: ControllerRenderProps<TFieldValues, FieldPath<TFieldValues>>;
  placeholder?: string;
};

type FormData = z.infer<typeof FormSchema>;

function validatePostalCode(postalCode: string, country: string): { format: string; isValid: boolean } {
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

  const countryPattern = postalCodePatterns[country];
  if (!countryPattern) {
    return { format: '', isValid: true };
  }

  return {
    format: countryPattern.format,
    isValid: countryPattern.pattern.test(postalCode),
  };
}

export const PasswordInput = forwardRef<
  HTMLInputElement,
  {
    field: {
      name: string;
      onBlur: () => void;
      onChange: (value: string) => void;
      value: string;
    };
    placeholder?: string;
  }
>(({ field, placeholder = 'password' }, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  const safeField = {
    ...field,
    value: String(field.value || ''),
  };

  const containsSpaces = /\s/.test(safeField.value);
  const tooShort = safeField.value.length > 0 && safeField.value.length < 8;
  const noLowerCase = safeField.value.length > 0 && !/[a-z]/.test(safeField.value);
  const noUpperCase = safeField.value.length > 0 && !/[A-Z]/.test(safeField.value);
  const noDigit = safeField.value.length > 0 && !/\d/.test(safeField.value);

  const hasError = containsSpaces || tooShort || noLowerCase || noUpperCase || noDigit;
  const errorClass = hasError ? 'border-red-500 focus:border-red-500 bg-red-50/30' : '';

  let errorMessage = null;
  if (containsSpaces) {
    errorMessage = 'Password cannot contain spaces!';
  } else if (tooShort) {
    errorMessage = 'Password must be at least 8 characters';
  } else if (noUpperCase) {
    errorMessage = 'Password must contain an uppercase letter';
  } else if (noLowerCase) {
    errorMessage = 'Password must contain a lowercase letter';
  } else if (noDigit) {
    errorMessage = 'Password must contain a number';
  }

  return (
    <div className="relative w-full">
      <StyledInput
        placeholder={placeholder}
        type={showPassword ? 'text' : 'password'}
        {...safeField}
        className={errorClass}
        onChange={(e) => {
          const { value } = e.target;
          safeField.onChange(value);

          // visual on input
          const inputHasError =
            /\s/.test(value) ||
            (value.length > 0 && value.length < 8) ||
            (value.length > 0 && !/[a-z]/.test(value)) ||
            (value.length > 0 && !/[A-Z]/.test(value)) ||
            (value.length > 0 && !/\d/.test(value));

          if (inputHasError) {
            e.target.classList.add('border-red-500');
            e.target.classList.add('bg-red-50/30');
          } else {
            e.target.classList.remove('border-red-500');
            e.target.classList.remove('bg-red-50/30');
          }
        }}
        ref={ref}
      />
      <button
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 z-10 flex items-center justify-center sm:top-[23px]"
        onClick={(e) => {
          e.preventDefault();
          setShowPassword(!showPassword);
        }}
        type="button"
      >
        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>

      {errorMessage && <p className="text-xs font-medium text-red-500 mt-1">{errorMessage}</p>}
    </div>
  );
});

PasswordInput.displayName = 'PasswordInput';

const FormSchemaBase = z.object({
  billCity: z
    .string()
    .trim()
    .min(1, 'Your bill city is required')
    .refine((val) => /^[A-Za-zА-Яа-я\s'-]+$/.test(val), {
      message: 'City can only contain letters, spaces, hyphens and apostrophes',
    }),
  billCountry: z.string().min(1, 'Country is required'),
  billPostalCode: z
    .string()
    .min(1, 'Your bill postal code is required')
    .refine((val) => val.trim() === val, {
      message: 'Postal code cannot start or end with whitespace',
    }),
  billSetDefault: z.boolean(),
  billStreet: z.string().trim().min(1, 'Your bill street is required'),
  confirmPassword: z.string(),
  dateOfBirth: z.date({
    invalid_type_error: 'Choose a valid date',
    required_error: 'Choose your birthday',
  }),
  email: z
    .string()
    .email('Write a valid email address')
    .refine((val) => !/\s/.test(val), {
      message: 'Email address must not contain whitespace',
    }),
  firstName: z
    .string()
    .trim()
    .min(1, 'First name is required')
    .refine((val) => /^[A-Za-zА-Яа-я\s'-]+$/.test(val), {
      message: 'First name can only contain letters, spaces, hyphens and apostrophes',
    }),
  lastName: z
    .string()
    .trim()
    .min(1, 'Last name is required')
    .refine((val) => /^[A-Za-zА-Яа-я\s'-]+$/.test(val), {
      message: 'Last name can only contain letters, spaces, hyphens and apostrophes',
    }),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
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
    }),
  sameBillShip: z.boolean(),
  shipCity: z.string().optional(),
  shipCountry: z.string().optional(),
  shipPostalCode: z.string().optional(),
  shipSetDefault: z.boolean(),
  shipStreet: z.string().optional(),
});

const FormSchema = FormSchemaBase.superRefine((data, ctx) => {
  const billPostalValidation = validatePostalCode(data.billPostalCode, data.billCountry);
  if (!billPostalValidation.isValid) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Invalid postal code format for ${data.billCountry}. Expected format: ${billPostalValidation.format}`,
      path: ['billPostalCode'],
    });
  }

  if (!data.sameBillShip && data.shipPostalCode) {
    const country = data.shipCountry || data.billCountry;
    const shipPostalValidation = validatePostalCode(data.shipPostalCode, country);
    if (!shipPostalValidation.isValid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Invalid postal code format for ${country}. Expected format: ${shipPostalValidation.format}`,
        path: ['shipPostalCode'],
      });
    }
  }

  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Passwords don't match",
      path: ['confirmPassword'],
    });
  }

  const today = new Date();
  const minimumAge = 13;
  const cutoffDate = new Date(today.getFullYear() - minimumAge, today.getMonth(), today.getDate());

  if (data.dateOfBirth > cutoffDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'You must be at least 13 years old to register',
      path: ['dateOfBirth'],
    });
  }

  if (!data.sameBillShip) {
    if (!data.shipCity || data.shipCity.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Shipping city is required when using different addresses',
        path: ['shipCity'],
      });
    }

    if (!data.shipCountry || data.shipCountry.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Shipping country is required when using different addresses',
        path: ['shipCountry'],
      });
    }

    if (!data.shipPostalCode || data.shipPostalCode.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Shipping postal code is required when using different addresses',
        path: ['shipPostalCode'],
      });
    }

    if (!data.shipStreet || data.shipStreet.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Shipping street is required when using different addresses',
        path: ['shipStreet'],
      });
    }
  }
});

// eslint-disable-next-line max-lines-per-function
export default function RegistrationForm(): JSX.Element {
  const { toast } = useResponsiveToast();
  const { isRegisterLoading, register } = useCustomer();
  const form = useForm<z.infer<typeof FormSchema>>({
    defaultValues: {
      billCity: '',
      billCountry: 'US',
      billPostalCode: '',
      billSetDefault: true,
      billStreet: '',
      confirmPassword: '',
      dateOfBirth: new Date('2000-01-01'),
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      sameBillShip: true,
      shipCity: '',
      shipCountry: 'US',
      shipPostalCode: '',
      shipSetDefault: true,
      shipStreet: '',
    },
    resolver: zodResolver(FormSchema),
  });

  function onSubmit(data: FormData): void {
    if (/\s/.test(data.email)) {
      toast({
        description: 'Email address contains whitespace. Please remove all spaces.',
        title: 'Validation Error',
        variant: 'destructive',
      });
      return;
    }

    if (/\s/.test(data.password) || /\s/.test(data.confirmPassword)) {
      toast({
        description: 'Passwords cannot contain spaces. Please remove all spaces.',
        title: 'Validation Error',
        variant: 'destructive',
      });
      return;
    }

    const customerParams = {
      addresses: [
        {
          city: data.billCity,
          country: data.billCountry,
          postalCode: data.billPostalCode,
          streetName: data.billStreet,
        },
      ],
      dateOfBirth: format(data.dateOfBirth, 'yyyy-MM-dd'),
      defaultBillingAddress: data.billSetDefault ? 0 : undefined,
      defaultShippingAddress: data.sameBillShip ? 0 : 1,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      password: data.password,
    };

    if (!data.sameBillShip && data.shipCity && data.shipCountry && data.shipPostalCode && data.shipStreet) {
      customerParams.addresses.push({
        city: data.shipCity,
        country: data.shipCountry,
        postalCode: data.shipPostalCode,
        streetName: data.shipStreet,
      });
    }

    register(customerParams);
  }

  return (
    <Form {...form}>
      <form
        className="border border-border mb-6 p-6 md:p-8 rounded-xl w-full max-w-[800px] flex flex-wrap gap-x-4 gap-y-3 items-start justify-center bg-card/50 shadow-md dark:shadow-black/10"
        onSubmit={(e) => {
          form
            .handleSubmit(onSubmit)(e)
            .catch((error) => {
              console.error('Form submission error:', error);
              toast({
                description: 'An error occurred during registration',
                title: 'Error',
                variant: 'destructive',
              });
            });
        }}
      >
        <div className="w-full">
          <h3 className="text-lg font-merriweather text-foreground/90 mb-3 h-accent">Personal Information</h3>
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="grow basis-full sm:basis-2/5">
              <FormLabel>Email</FormLabel>
              <FormControl>
                <StyledInput
                  placeholder="your.email@gmail.com"
                  type="text"
                  {...field}
                  className={/\s/.test(field.value || '') ? 'border-red-500 focus:border-red-500 bg-red-50/30' : ''}
                  // MANUAL WAY, DO NOT USE, ONLY FOR COMPLETE CROSS-CHECK!
                  onChange={(e) => {
                    const originalValue = e.target.value;
                    field.onChange(originalValue);

                    if (/\s/.test(originalValue)) {
                      e.target.classList.add('border-red-500');
                    } else {
                      e.target.classList.remove('border-red-500');
                    }
                  }}
                  value={field.value || ''}
                />
              </FormControl>
              {/\s/.test(field.value || '') && (
                <p className="text-xs font-medium text-red-500 mt-1">Email contains spaces! Please remove them.</p>
              )}
              {/* <FormMessage /> */}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem className="grow basis-full sm:basis-2/5">
              <FormLabel>First name</FormLabel>
              <FormControl>
                <StyledInput placeholder="First name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem className="grow basis-full sm:basis-2/5">
              <FormLabel>Last name</FormLabel>
              <FormControl>
                <StyledInput placeholder="Last name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem className="flex flex-col grow basis-full sm:basis-2/5">
              <FormLabel className="mb-2.5">Date of birth</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      className={cn(
                        'w-full sm:w-[240px] pl-3 text-left font-normal border-input bg-background/50 hover:bg-accent/10',
                        !field.value && 'text-muted-foreground',
                      )}
                      variant={'outline'}
                    >
                      {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                  <div className="p-3 border-b flex justify-between">
                    <select
                      className="text-sm border rounded px-2 py-1"
                      onChange={(e) => {
                        const newYear = parseInt(e.target.value, 10);
                        const currentDate = field.value || new Date();
                        const newDate = new Date(currentDate);
                        newDate.setFullYear(newYear);

                        const today = new Date();
                        const minimumAge = 13;
                        const cutoffDate = new Date(
                          today.getFullYear() - minimumAge,
                          today.getMonth(),
                          today.getDate(),
                        );

                        if (newDate > cutoffDate) {
                          newDate.setFullYear(cutoffDate.getFullYear());
                        }

                        field.onChange(newDate);

                        const calendarElement = document.querySelector('.react-calendar');
                        if (calendarElement) {
                          calendarElement.dispatchEvent(new Event('yearchange', { bubbles: true }));
                        }
                      }}
                      value={field.value ? new Date(field.value).getFullYear() : 2000}
                    >
                      {Array.from({ length: 100 }, (_, i) => {
                        const currentYear = new Date().getFullYear();
                        const minimumAge = 13;
                        const maxYear = currentYear - minimumAge;
                        const year = maxYear - i;
                        return (
                          <option key={i} value={year}>
                            {year}
                          </option>
                        );
                      })}
                    </select>
                    <select
                      className="text-sm border rounded px-2 py-1"
                      onChange={(e) => {
                        const newMonth = parseInt(e.target.value, 10);
                        const currentDate = field.value || new Date();
                        const newDate = new Date(currentDate);
                        newDate.setMonth(newMonth);
                        field.onChange(newDate);

                        const calendarElement = document.querySelector('.react-calendar');
                        if (calendarElement) {
                          calendarElement.dispatchEvent(new Event('monthchange', { bubbles: true }));
                        }
                      }}
                      value={field.value ? new Date(field.value).getMonth() : 0}
                    >
                      {[
                        'January',
                        'February',
                        'March',
                        'April',
                        'May',
                        'June',
                        'July',
                        'August',
                        'September',
                        'October',
                        'November',
                        'December',
                      ].map((month, i) => (
                        <option key={i} value={i}>
                          {month}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Calendar
                    className="bg-background border rounded-md"
                    defaultMonth={field.value}
                    disabled={(date) => {
                      const today = new Date();
                      const minimumAge = 13;
                      const cutoffDate = new Date(today.getFullYear() - minimumAge, today.getMonth(), today.getDate());
                      return date > cutoffDate || date < new Date('1900-01-01');
                    }}
                    initialFocus
                    mode="single"
                    month={field.value || undefined}
                    onSelect={(date) => {
                      if (date) {
                        const today = new Date();
                        const minimumAge = 13;
                        const cutoffDate = new Date(
                          today.getFullYear() - minimumAge,
                          today.getMonth(),
                          today.getDate(),
                        );

                        if (date > cutoffDate) {
                          field.onChange(cutoffDate);
                        } else {
                          field.onChange(date);
                        }
                      }
                    }}
                    selected={field.value || undefined}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="w-full mt-4">
          <h3 className="text-lg font-merriweather text-foreground/90 mb-3 h-accent">Billing Address</h3>
        </div>

        <FormField
          control={form.control}
          name="billCountry"
          render={({ field }) => (
            <FormItem className="grow basis-full sm:basis-2/5">
              <FormLabel>Billing Country</FormLabel>
              <Select defaultValue={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="GB">United Kingdom</SelectItem>
                  <SelectItem value="FR">France</SelectItem>
                  <SelectItem value="DE">Germany</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="billCity"
          render={({ field }) => (
            <FormItem className="grow basis-full sm:basis-2/5">
              <FormLabel>Billing city</FormLabel>
              <FormControl>
                <StyledInput placeholder="city" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="billPostalCode"
          render={({ field }) => (
            <FormItem className="grow basis-full sm:basis-2/5">
              <FormLabel>Billing postal code</FormLabel>
              <FormControl>
                <StyledInput
                  placeholder="postal code"
                  {...field}
                  className={
                    form.formState.errors.billPostalCode ? 'border-red-500 focus:border-red-500 bg-red-50/30' : ''
                  }
                  onChange={(e) => {
                    field.onChange(e);

                    const { value } = e.target;
                    const country = form.getValues('billCountry');
                    const validation = validatePostalCode(value, country);

                    if (!validation.isValid && value) {
                      e.target.classList.add('border-red-500');
                      e.target.classList.add('bg-red-50/30');
                    } else {
                      e.target.classList.remove('border-red-500');
                      e.target.classList.remove('bg-red-50/30');
                    }
                  }}
                />
              </FormControl>
              <FormMessage />

              {((): JSX.Element => {
                const country = form.watch('billCountry');
                let formatMessage = '';
                switch (country) {
                  case 'US':
                    formatMessage = 'Format: 12345 or 12345-6789';
                    break;
                  case 'CA':
                    formatMessage = 'Format: A1A 1A1 (e.g., M5V 3L9)';
                    break;
                  case 'GB':
                    formatMessage = 'Format: AA1 1AA or A1 1AA';
                    break;
                  case 'DE':
                  case 'FR':
                    formatMessage = 'Format: 12345';
                    break;
                  default:
                    formatMessage = 'Format: postal code';
                    break;
                }

                const postalCode = field.value || '';
                const validation = validatePostalCode(postalCode, country);

                if (postalCode && !validation.isValid) {
                  return (
                    <p className="text-xs font-medium text-red-500 mt-1">
                      Invalid format for {country}. Expected: {validation.format}
                    </p>
                  );
                }

                return <p className="text-xs text-muted-foreground mt-1">{formatMessage}</p>;
              })()}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="billStreet"
          render={({ field }) => (
            <FormItem className="grow basis-full sm:basis-2/5">
              <FormLabel>Billing street</FormLabel>
              <FormControl>
                <StyledInput placeholder="street" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sameBillShip"
          render={({ field }) => (
            <FormItem className="grow basis-full flex flex-row items-end gap-1">
              <FormLabel>Use the same address as a billing and a shipping</FormLabel>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    const value = Boolean(checked);
                    field.onChange(value);

                    if (value) {
                      const billCity = form.getValues('billCity');
                      const billCountry = form.getValues('billCountry');
                      const billStreet = form.getValues('billStreet');
                      const billPostalCode = form.getValues('billPostalCode');

                      form.setValue('shipCity', billCity);
                      form.setValue('shipCountry', billCountry);
                      form.setValue('shipStreet', billStreet);
                      form.setValue('shipPostalCode', billPostalCode);
                    } else {
                      form.setValue('shipCity', '');
                      form.setValue('shipCountry', '');
                      form.setValue('shipStreet', '');
                      form.setValue('shipPostalCode', '');
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="billSetDefault"
          render={({ field }) => (
            <FormItem className="grow basis-full flex flex-row items-end gap-1">
              <FormLabel>
                {form.watch('sameBillShip')
                  ? 'Set as default billing & shipping address'
                  : 'Set as default billing address'}
              </FormLabel>
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator className="w-full my-6 bg-primary/20" />

        {!form.watch('sameBillShip') && (
          <>
            <FormField
              control={form.control}
              name="shipCountry"
              render={({ field }) => (
                <FormItem className="grow basis-full sm:basis-2/5">
                  <FormLabel>Shipping Country</FormLabel>
                  <Select defaultValue={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="GB">United Kingdom</SelectItem>
                      <SelectItem value="FR">France</SelectItem>
                      <SelectItem value="DE">Germany</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="shipCity"
              render={({ field }) => (
                <FormItem className="grow basis-full sm:basis-2/5">
                  <FormLabel>Shipping city</FormLabel>
                  <FormControl>
                    <StyledInput placeholder="city" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shipPostalCode"
              render={({ field }) => (
                <FormItem className="grow basis-full sm:basis-2/5">
                  <FormLabel>Shipping postal code</FormLabel>
                  <FormControl>
                    <StyledInput
                      placeholder="postal code"
                      {...field}
                      className={
                        form.formState.errors.shipPostalCode ? 'border-red-500 focus:border-red-500 bg-red-50/30' : ''
                      }
                      onChange={(e) => {
                        field.onChange(e);

                        const { value } = e.target;
                        const country = form.getValues('shipCountry') || form.getValues('billCountry');
                        const validation = validatePostalCode(value, country);

                        if (!validation.isValid && value) {
                          e.target.classList.add('border-red-500');
                          e.target.classList.add('bg-red-50/30');
                        } else {
                          e.target.classList.remove('border-red-500');
                          e.target.classList.remove('bg-red-50/30');
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />

                  {((): JSX.Element => {
                    const country = form.watch('shipCountry') || form.watch('billCountry');
                    let formatMessage = '';
                    switch (country) {
                      case 'US':
                        formatMessage = 'Format: 12345 or 12345-6789';
                        break;
                      case 'CA':
                        formatMessage = 'Format: A1A 1A1 (e.g., M5V 3L9)';
                        break;
                      case 'GB':
                        formatMessage = 'Format: AA1 1AA or A1 1AA';
                        break;
                      case 'DE':
                      case 'FR':
                        formatMessage = 'Format: 12345';
                        break;
                      default:
                        formatMessage = 'Format: postal code';
                        break;
                    }

                    const postalCode = field.value || '';
                    const validation = validatePostalCode(postalCode, country);

                    if (postalCode && !validation.isValid) {
                      return (
                        <p className="text-xs font-medium text-red-500 mt-1">
                          Invalid format for {country}. Expected: {validation.format}
                        </p>
                      );
                    }

                    return <p className="text-xs text-muted-foreground mt-1">{formatMessage}</p>;
                  })()}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shipStreet"
              render={({ field }) => (
                <FormItem className="grow basis-full sm:basis-2/5">
                  <FormLabel>Shipping street</FormLabel>
                  <FormControl>
                    <StyledInput placeholder="street" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shipSetDefault"
              render={({ field }) => (
                <FormItem className="grow basis-2/5 flex flex-row items-end gap-1">
                  <FormLabel>Set as default shipping address</FormLabel>
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <div className="w-full mt-4">
          <h3 className="text-lg font-merriweather text-foreground/90 mb-3 h-accent">Security</h3>
        </div>

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="grow basis-full sm:basis-2/5">
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput field={field} placeholder="password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem className="grow basis-full sm:basis-2/5">
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <PasswordInput field={field} placeholder="confirm password" />
              </FormControl>
              {form.getValues('password') !== field.value && field.value && (
                <p className="text-xs font-medium text-red-500 mt-1">Passwords don&apos;t match</p>
              )}
              {/* <FormMessage /> */}
            </FormItem>
          )}
        />

        <Separator className="w-full my-6 bg-primary/20" />

        <Button
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 text-lg transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60"
          disabled={
            isRegisterLoading ||
            /\s/.test(form.watch('password') || '') ||
            /\s/.test(form.watch('email') || '') ||
            form.watch('password') !== form.watch('confirmPassword') ||
            !form.formState.isValid ||
            !!form.formState.errors.email ||
            !!form.formState.errors.password ||
            !!form.formState.errors.confirmPassword
          }
          type="submit"
        >
          {isRegisterLoading ? (
            <span className="flex items-center justify-center">
              <span className="bee-loader mr-2 w-5 h-5 inline-block"></span>
              Creating account...
            </span>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>
    </Form>
  );
}
