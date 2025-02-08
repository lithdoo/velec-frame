import { resolve } from 'node:path'
import { IncomingMessage } from 'node:http'
import { LanguageName } from './common'

export const sqlRunnerConfig = () => {
  const processRunPath = resolve(__dirname, '../../node_modules/sql-language-server/npm_bin/cli.js')
  return {
    serverName: 'Sql',
    pathName: '/sql',
    runCommand: LanguageName.node,
    runCommandArgs: [processRunPath, 'up', '--method', 'stdio'],
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
