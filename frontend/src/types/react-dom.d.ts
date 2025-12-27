declare module 'react-dom/client' {
  import { ReactNode } from 'react';

  export interface Root {
    render(children: ReactNode): void;
    unmount(): void;
  }

  export interface CreateRootOptions {
    identifierPrefix?: string;
    onRecoverableError?: (error: unknown) => void;
  }

  export function createRoot(
    container: Element | DocumentFragment,
    options?: CreateRootOptions
  ): Root;

  export function hydrateRoot(
    container: Element | DocumentFragment,
    children: ReactNode,
    options?: CreateRootOptions
  ): Root;
}

