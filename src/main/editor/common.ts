import { ServerOptions, WebSocketServer } from 'ws';
import { IncomingMessage, Server } from 'node:http';
import express from 'express';
import * as cp from 'child_process';
import { Socket } from 'node:net';
import { IWebSocket, WebSocketMessageReader, WebSocketMessageWriter } from 'vscode-ws-jsonrpc';
import { createConnection, createServerProcess, forward } from 'vscode-ws-jsonrpc/server';
import { Message, InitializeRequest, InitializeParams } from 'vscode-languageserver';

export enum LanguageName {
    /** https://nodejs.org/api/cli.html  */
    node = 'node',
    /** https://docs.oracle.com/en/java/javase/21/docs/specs/man/java.html */
    java = 'java'
}

export type LanguageServerRunConfig = {
    serverName: string;
    pathName: string;
    runCommand: LanguageName | string;
    runCommandArgs: string[];
    wsServerOptions: ServerOptions,
    spawnOptions?: cp.SpawnOptions;
}

export class LanguageServerCenter {
    port: number = 30001
    app: any;
    server: Server

    router: Map<string, [LanguageServerRunConfig, WebSocketServer]> = new Map()
    serverNames: Map<string, string> = new Map()

    constructor() {
        process.on('uncaughtException', err => {
            console.error('Uncaught Exception: ', err.toString());
            if (err.stack !== undefined) {
                console.error(err.stack);
            }
        });
        this.app = express()
        this.server = this.app.listen(this.port);
        this.initServer()
    }



    run(config: LanguageServerRunConfig) {
        const wss = new WebSocketServer(config.wsServerOptions);
        if (this.serverNames.has(config.serverName)) {
            return console.error(`serverName:${config.serverName} has been registed !!!`)
        }

        if (this.router.has(config.pathName)) {
            return console.error(`pathName:${config.pathName} has been registed !!!`)
        }

        this.serverNames.set(config.serverName, config.pathName)
        this.router.set(config.pathName, [config, wss])
    }


    private initServer() {
        this.server.on('upgrade', (request: IncomingMessage, socket: Socket, head: Buffer) => {
            const baseURL = `http://${request.headers.host}/`;
            const pathName = request.url !== undefined ? new URL(request.url, baseURL).pathname : undefined;

            const target = this.router.get(pathName ?? '')
            if (!target) return
            const [config, wss] = target
            wss.handleUpgrade(request, socket, head, webSocket => {
                const socket: IWebSocket = {
                    send: content => webSocket.send(content, error => {
                        if (error) {
                            throw error;
                        }
                    }),
                    onMessage: cb => webSocket.on('message', (data) => {
                        cb(data);
                    }),
                    onError: cb => webSocket.on('error', cb),
                    onClose: cb => webSocket.on('close', cb),
                    dispose: () => webSocket.close()
                };
                // launch the server when the web socket is opened
                if (webSocket.readyState === webSocket.OPEN) {
                    this.launchLanguageServer(config, socket);
                } else {
                    webSocket.on('open', () => {
                        this.launchLanguageServer(config, socket);
                    });
                }
            });
        });
    }

    private launchLanguageServer(runconfig: LanguageServerRunConfig, socket: IWebSocket) {
        const { serverName, runCommand, runCommandArgs, spawnOptions } = runconfig;
        // start the language server as an external process
        const reader = new WebSocketMessageReader(socket);
        const writer = new WebSocketMessageWriter(socket);
        const socketConnection = createConnection(reader, writer, () => socket.dispose());
        const serverConnection = createServerProcess(serverName, runCommand, runCommandArgs, spawnOptions);
        if (serverConnection) {
            forward(socketConnection, serverConnection, message => {
                if (Message.isRequest(message)) {
                    console.log(`${serverName} Server received:`);
                    console.log(message);
                    if (message.method === InitializeRequest.type.method) {
                        const initializeParams = message.params as InitializeParams;
                        initializeParams.processId = process.pid;
                    }
                }
                if (Message.isResponse(message)) {
                    console.log(`${serverName} Server sent:`);
                    console.log(message);
                }
                return message;
            });
        }
    };
}

export const langCenter = new LanguageServerCenter()