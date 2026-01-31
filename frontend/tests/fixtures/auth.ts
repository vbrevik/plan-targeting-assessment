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

    // CSRF Handling
    let csrfToken = '';
    const cookies = response.headers()['set-cookie'];
    if (cookies) {
        const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
        for (const cookie of cookieArray) {
            const match = cookie.match(/csrf_token=([^;,\s]+)/);
            if (match) {
                csrfToken = match[1];
                break;
            }
        }
    }

    return { token, csrfToken };
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
