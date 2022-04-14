/**
 * Return a pluralized string for a given count.
 * 
 * @param count The count to get the pluralized noun for.
 * @param noun The noun to pluralize.
 * @param suffix The pluralization suffix.
 * @returns A pluralized string.
 */
export const pluralize = (count: number, noun: string, suffix: string = 's'): string => `${count} ${noun}${count !== 1 ? suffix : ''}`