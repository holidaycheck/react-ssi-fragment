export interface SSIFragmentProps {
  isOnClient?: boolean;
  id: string;
  url: string;
}

export interface SSIFragmentState {
  fallbackHtml: string;
}
