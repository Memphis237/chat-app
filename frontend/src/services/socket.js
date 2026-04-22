import {io} from 'socket.io-client';

export const socket = io(import.meta.VITE_API_URL);