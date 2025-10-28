import { AddressDto } from "../dto/user.dto";

// utils/address.utils.ts
export function hasAddressChanged(
  newAddress?: AddressDto,
  oldAddress?: AddressDto,
): boolean {
  if (!newAddress) return false;
  return ['city', 'brgy', 'street'].some(
    key => newAddress[key] !== oldAddress?.[key],
  );
}
