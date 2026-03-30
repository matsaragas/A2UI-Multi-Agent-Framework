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

import { AppConfig } from "./types.js";

export const config: AppConfig = {
  key: "universal",
  title: "Universal Assistant",
  heroImage: "/hero.png",
  heroImageDark: "/hero-dark.png",
  background: `radial-gradient(
    at 0% 0%,
    light-dark(rgba(139, 92, 246, 0.3), rgba(139, 92, 246, 0.15)) 0px,
    transparent 50%
  ),
  radial-gradient(
    at 100% 0%,
    light-dark(rgba(236, 72, 153, 0.3), rgba(236, 72, 153, 0.15)) 0px,
    transparent 50%
  ),
  radial-gradient(
    at 100% 100%,
    light-dark(rgba(16, 185, 129, 0.3), rgba(16, 185, 129, 0.15)) 0px,
    transparent 50%
  ),
  radial-gradient(
    at 0% 100%,
    light-dark(rgba(59, 130, 246, 0.3), rgba(59, 130, 246, 0.15)) 0px,
    transparent 50%
  ),
  linear-gradient(
    120deg,
    light-dark(#f8fafc, #020617) 0%,
    light-dark(#f1f5f9, #0f172a) 100%
  )`,
  placeholder: "How can I help you today?",
  loadingText: [
    "Thinking...",
    "Understanding your intent...",
    "Finding the right agent...",
    "Almost there...",
  ],
  serverUrl: "http://localhost:10002",
};
