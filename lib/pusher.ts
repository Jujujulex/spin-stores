import PusherServer from 'pusher';
import PusherClient from 'pusher-js';

export const pusherServer = new PusherServer({
    appId: process.env.PUSHER_APP_ID || 'default-app-id',
    key: process.env.NEXT_PUBLIC_PUSHER_KEY || 'default-key',
    secret: process.env.PUSHER_SECRET || 'default-secret',
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1',
    useTLS: true,
});

export const pusherClient = new PusherClient(
    process.env.NEXT_PUBLIC_PUSHER_KEY || 'default-key',
    {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1',
        authEndpoint: '/api/pusher/auth',
    }
);
