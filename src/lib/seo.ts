export const SITE_ORIGIN = 'https://contextvm.org';

function stripBasePath(pathname: string, basePath: string): string {
	if (!basePath) return pathname;
	if (pathname === basePath) return '/';
	if (pathname.startsWith(`${basePath}/`)) return pathname.slice(basePath.length);
	return pathname;
}

export function canonicalUrl(pathname: string, basePath = ''): string {
	const path = stripBasePath(pathname, basePath);
	return new URL(path.startsWith('/') ? path : `/${path}`, SITE_ORIGIN).href;
}

export function absoluteSiteUrl(value: string, basePath = ''): string {
	if (/^https?:\/\//.test(value)) return value;

	const path = value.startsWith('./') ? `/${value.slice(2)}` : value;
	return canonicalUrl(path, basePath);
}
