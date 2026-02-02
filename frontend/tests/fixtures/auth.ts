import { test as base, type APIRequestContext, type Page } from '@playwright/test';

// Define custom fixture for User Auth
export type AuthFixtures = {
    authenticatedPage: Page;
    authenticatedRequest: APIRequestContext;
};

// Robust login helper with CSRF
export async function loginUser(request: APIRequestContext, identifier = 'im@test.mil', password = 'Password123!') {
    const response = await request.post('http://localhost:3000/api/auth/login', {
        data: { identifier, password }
    });

    if (!response.ok()) {
        throw new Error(`Failed to login as ${identifier}. Status: ${response.status()}.`);
    }

    const body = await response.json();
    const token = body.access_token;

    // Capture cookies to transfer to browser context
    const cookies: { name: string, value: string, domain: string, path: string }[] = [];
    const setCookieHeader = response.headers()['set-cookie'];

    if (setCookieHeader) {
        const rawCookies = Array.isArray(setCookieHeader) ? setCookieHeader : setCookieHeader.split('\n');
        rawCookies.forEach(raw => {
            const parts = raw.split(';');
            const [name, value] = parts[0].split('=');
            if (name && value) {
                cookies.push({
                    name: name.trim(),
                    value: value.trim(),
                    domain: 'localhost',
                    path: '/'
                });
            }
        });
    }

    // CSRF Handling
    let csrfToken = '';
    const csrfCookie = cookies.find(c => c.name === 'csrf_token');
    if (csrfCookie) {
        csrfToken = csrfCookie.value;
    }

    return { token, csrfToken, cookies };
}

async function useAuthContext(playwright: any, auth: any, use: any) {
    const extraHTTPHeaders: Record<string, string> = {
        'Authorization': `Bearer ${auth.token}`,
    };
    if (auth.csrfToken) {
        extraHTTPHeaders['X-CSRF-Token'] = auth.csrfToken;
        extraHTTPHeaders['Cookie'] = `csrf_token=${auth.csrfToken}`;
    }
    const apiContext = await playwright.request.newContext({
        baseURL: 'http://localhost:3000',
        extraHTTPHeaders,
    });
    await use(apiContext);
    await apiContext.dispose();
}

async function useAuthPage(page: Page, auth: any, use: any, role: string) {
    // CRITICAL: Set cookies in the browser context so fetch/XHR requests are authenticated
    if (auth.cookies && auth.cookies.length > 0) {
        await page.context().addCookies(auth.cookies);
    }

    await page.addInitScript((data: { token: string, role: string }) => {
        window.localStorage.setItem('auth_token', data.token);
        window.localStorage.setItem('user_role', data.role);
    }, { ...auth, role });
    await use(page);
}

export const authenticatedTest = base.extend<AuthFixtures>({
    authenticatedRequest: async ({ playwright }, use) => {
        const loginContext = await playwright.request.newContext({ baseURL: 'http://localhost:3000' });
        const auth = await loginUser(loginContext, 'im@test.mil');
        await loginContext.dispose();
        await useAuthContext(playwright, auth, use);
    },
    authenticatedPage: async ({ page, request }, use) => {
        const auth = await loginUser(request, 'im@test.mil');
        await useAuthPage(page, auth, use, 'Information Manager');
    }
});

export const targetingUserTest = base.extend<AuthFixtures>({
    authenticatedRequest: async ({ playwright }, use) => {
        const loginContext = await playwright.request.newContext({ baseURL: 'http://localhost:3000' });
        const auth = await loginUser(loginContext, 'targeting@test.mil');
        await loginContext.dispose();
        await useAuthContext(playwright, auth, use);
    },
    authenticatedPage: async ({ page, request }, use) => {
        const auth = await loginUser(request, 'targeting@test.mil');
        await useAuthPage(page, auth, use, 'Targeting Officer');
    }
});

export const superAdminTest = base.extend<AuthFixtures>({
    authenticatedRequest: async ({ playwright }, use) => {
        const loginContext = await playwright.request.newContext({ baseURL: 'http://localhost:3000' });
        const auth = await loginUser(loginContext, 'vidar@brevik.net', 'Password123!');
        await loginContext.dispose();
        await useAuthContext(playwright, auth, use);
    },
    authenticatedPage: async ({ page, request }, use) => {
        const auth = await loginUser(request, 'vidar@brevik.net', 'Password123!');
        await useAuthPage(page, auth, use, 'superadmin');
    }
});

