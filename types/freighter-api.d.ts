interface FreighterSignMessageOptions {
  address?: string;
  networkPassphrase?: string;
}

interface FreighterSignMessageResponse {
  signedMessage: string | null;
  signerAddress?: string;
  error?: string;
}

interface FreighterApi {
  isConnected: () => Promise<boolean>;
  getPublicKey: () => Promise<string>;
  signMessage: (
    message: string,
    opts?: FreighterSignMessageOptions,
  ) => Promise<string | FreighterSignMessageResponse>;
  signTransaction: (
    xdr: string,
    networkPassphrase: string,
    network?: string,
  ) => Promise<string>;
}

interface Window {
  freighterApi?: FreighterApi;
}
