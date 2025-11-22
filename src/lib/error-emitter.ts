import { EventEmitter } from 'events';
import { type FirestorePermissionError } from './errors';

type AppEvents = {
  'permission-error': (error: FirestorePermissionError) => void;
};

// Extend the basic EventEmitter to be type-safe
declare interface TypedEventEmitter<TEvents extends Record<string, any>> {
  on<TEvent extends keyof TEvents>(event: TEvent, listener: TEvents[TEvent]): this;
  off<TEvent extends keyof TEvents>(event: TEvent, listener: TEvents[TEvent]): this;
  emit<TEvent extends keyof TEvents>(event: TEvent, ...args: Parameters<TEvents[TEvent]>): boolean;
}

class TypedEventEmitter<TEvents extends Record<string, any>> extends EventEmitter {}

// Create and export a single, app-wide instance of the event emitter
export const errorEmitter = new TypedEventEmitter<AppEvents>();
