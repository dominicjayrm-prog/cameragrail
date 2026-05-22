import { cookies } from 'next/headers';
import { CURRENCY_COOKIE, isCurrency, type Currency } from './currency';

export function readCurrencyCookie(): Currency {
  const value = cookies().get(CURRENCY_COOKIE)?.value;
  return isCurrency(value) ? value : 'GBP';
}
