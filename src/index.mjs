import explicitRenderHtml from './explicit.html';
import implicitRenderHtml from './implicit.html';

// This is the demo secret key. In prod, we recommend you store
// your secret key(s) safely.
let SECRET_KEY ;

async function handlePost(request) {
    const body = await request.formData();
    // Turnstile injects a token in "cf-turnstile-response".
    const token = body.get('cf-turnstile-response');
    const ip = request.headers.get('CF-Connecting-IP');

    // Validate the token by calling the "/siteverify" API.
    let formData = new FormData();
    formData.append('secret', SECRET_KEY);
    formData.append('response', token);
    formData.append('remoteip', ip);

    const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        body: formData,
        method: 'POST',
    });

    const outcome = await result.json();
    if (!outcome.success) {
        return new Response('The provided Turnstile token was not valid! \n' + JSON.stringify(outcome));
    }
    // The Turnstile token was successfuly validated. Proceed with your application logic.
    // Validate login, redirect user, etc.
    // For this demo, we just echo the "/siteverify" response:
    return new Response('Turnstile token successfuly validated. \n' + JSON.stringify(outcome));
}

export default {
    async fetch(request, env) {
        SECRET_KEY = env.TURNSTILE_SECRET
        if (request.method === 'POST') {
            return await handlePost(request);
        }

        const url = new URL(request.url);
        let body = implicitRenderHtml;
        if (url.pathname === '/explicit') {
            body = explicitRenderHtml;
        }
        
        return new Response(body, {
            headers: {
                'Content-Type': 'text/html',
            },
        });
    },
};
