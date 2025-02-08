import { resolve } from 'node:path'
import { IncomingMessage } from 'node:http'
import { LanguageName } from './common'
export const jsonRunnerConfig = () => {
  const processRunPath = resolve(__dirname, '../../lib/json-server.mjs')
  return {
    serverName: 'Json',
    pathName: '/json',
    runCommand: LanguageName.node,
    runCommandArgs: [processRunPath, '--stdio'],
    wsServerOptions: {
      noServer: true,
      perMessageDeflate: false,
      clientTracking: true,
      verifyClient: (
        _clientInfo: { origin: string; secure: boolean; req: IncomingMessage },
        callback
      ) => {
        callback(true)
        // const parsedURL = new URL(`${clientInfo.origin}${clientInfo.req.url ?? ''}`);
        // const authToken = parsedURL.searchParams.get('authorization');
        // if (authToken === 'UserAuth') {
        //     callback(true);
        // } else {
        //     callback(false);
        // }
      }
    }
  }
}
