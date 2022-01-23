export const queryString = (object: { [x: string]: any; }) => Object.keys(object).map(key => `${key}=${object[key]}`).join('&');
