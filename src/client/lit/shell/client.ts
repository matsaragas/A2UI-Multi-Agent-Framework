/*
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Part, SendMessageSuccessResponse, Task } from "@a2a-js/sdk";
import { A2AClient } from "@a2a-js/sdk/client";
import { v0_8 } from "@a2ui/lit";

const A2UI_MIME_TYPE = "application/json+a2ui";

export class A2UIClient {
  #serverUrl: string;
  #client: A2AClient | null = null;

  constructor(serverUrl: string = "") {
    this.#serverUrl = serverUrl;
  }

  #ready: Promise<void> = Promise.resolve();
  get ready() {
    return this.#ready;
  }

  async #getClient() {
    if (!this.#client) {
      // Default to localhost:10002 if no URL provided (fallback for restaurant app default)
      const baseUrl = this.#serverUrl || "http://localhost:10002";

      this.#client = await A2AClient.fromCardUrl(
        `${baseUrl}/.well-known/agent-card.json`,
        {
          fetchImpl: async (url, init) => {
            const headers = new Headers(init?.headers);
            headers.set("X-A2A-Extensions", "https://a2ui.org/a2a-extension/a2ui/v0.8");
            return fetch(url, { ...init, headers });
          }
        }
      );
    }
    return this.#client;
  }

  async send(
    message: v0_8.Types.A2UIClientEventMessage | string
  ): Promise<v0_8.Types.ServerToClientMessage[]> {
    const client = await this.#getClient();

    let parts: Part[] = [];

    if (typeof message === 'string') {
      // Try to parse as JSON first, just in case
      try {
        const parsed = JSON.parse(message);
        if (typeof parsed === 'object' && parsed !== null) {
          parts = [{
            kind: "data",
            data: parsed as unknown as Record<string, unknown>,
            mimeType: A2UI_MIME_TYPE,
          } as Part];
        } else {
          parts = [{ kind: "text", text: message }];
        }
      } catch {
        parts = [{ kind: "text", text: message }];
      }
    } else {
      parts = [{
        kind: "data",
        data: message as unknown as Record<string, unknown>,
        mimeType: A2UI_MIME_TYPE,
      } as Part];
    }

    const response = await client.sendMessage({
      message: {
        messageId: crypto.randomUUID(),
        role: "user",
        parts: parts,
        kind: "message",
      },
    });

    if ("error" in response) {
      throw new Error(response.error.message);
    }

    const result = (response as SendMessageSuccessResponse).result as Task;
    const messages: v0_8.Types.ServerToClientMessage[] = [];

    // 1. Try extracting parts from the standard status message
    let responseParts: Part[] = result.status.message?.parts ?? [];

    // 2. If no parts found, check artifacts (common in ADK-based agents)
    if (responseParts.length === 0 && (result as any).artifacts?.length > 0) {
      for (const artifact of (result as any).artifacts) {
        if (artifact.parts) {
          responseParts.push(...artifact.parts);
        }
      }
    }

    // 3. Fallback to the last agent message in history
    if (responseParts.length === 0 && (result as any).history?.length > 0) {
      const history = (result as any).history;
      for (let i = history.length - 1; i >= 0; i--) {
        if (history[i].role === 'agent' && history[i].parts) {
          responseParts.push(...history[i].parts);
          break;
        }
      }
    }

    // Process and filter parts based on A2UI mimeType
    for (const part of responseParts) {
      if (part.kind === 'data' &&
          (part.metadata?.mimeType === A2UI_MIME_TYPE ||
           (part as any).mimeType === A2UI_MIME_TYPE)) {
        messages.push(part.data as v0_8.Types.ServerToClientMessage);
      }
    }

    return messages;

    return [];
  }
}
