/**
 * Get the webpage title.
 * 
 * @param title Page title.
 * @returns A title suitable for the webpage.
 */
export const getTitle = (title: string): string => `camp · ${title}`;

/**
 * Get the title for the metadata field.
 * 
 * @param title Page title.
 * @returns A title suitable for the webpage.
 */
export const getMetadataTitle = (title: string): string => `Berry ${getTitle(title)}`;