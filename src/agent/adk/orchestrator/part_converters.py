# Copyright 2025 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from typing import Optional
import logging

from a2a import types as a2a_types
from google.genai import types as genai_types

from google.adk.a2a.converters import part_converter
from a2ui.a2a import is_a2ui_part

import pydantic

logger = logging.getLogger(__name__)


def convert_a2a_part_to_genai_part(
    a2a_part: a2a_types.Part,
) -> Optional[genai_types.Part]:
  if is_a2ui_part(a2a_part):
    genai_part = genai_types.Part(text=a2a_part.model_dump_json())
    logger.info(
        f"Converted A2UI part from A2A: {a2a_part.model_dump_json(exclude_none=True)} to GenAI: {genai_part.model_dump_json(exclude_none=True)}"[
            :200
        ]
        + "..."
    )
    return genai_part

  return part_converter.convert_a2a_part_to_genai_part(a2a_part)


def _strip_markdown_json(text: str) -> str:
  """Strips markdown code blocks from a JSON string."""
  text = text.strip()
  if text.startswith("```json"):
    text = text[len("```json") :]
  elif text.startswith("```"):
    text = text[len("```") :]
  if text.endswith("```"):
    text = text[: -len("```")]
  return text.strip()


def _find_json_part(text: str) -> Optional[str]:
  """Tries to find a JSON-like block in a string if it's not pure JSON."""
  import re

  # Look for something that looks like an A2A Part JSON (has "root" and "data")
  # OR any JSON block starting with { and ending with }
  matches = re.findall(r"(\{.*?\})", text, re.DOTALL)
  for match in matches:
    if "root" in match and "data" in match:
      return match
  return None


def convert_genai_part_to_a2a_part(
    part: genai_types.Part,
) -> Optional[a2a_types.Part]:
  if part.text:
    # 1. Try strict parsing first after stripping markdown
    cleaned_text = _strip_markdown_json(part.text)
    try:
      a2a_part = a2a_types.Part.model_validate_json(cleaned_text)
      if is_a2ui_part(a2a_part):
        logger.info(
            f"Successfully converted A2UI part after stripping markdown: {cleaned_text}"
        )
        return a2a_part
    except pydantic.ValidationError:
      pass

    # 2. Try to find a JSON block within the text (more resilient to LLM chatter)
    json_candidate = _find_json_part(part.text)
    if json_candidate:
      try:
        a2a_part = a2a_types.Part.model_validate_json(json_candidate)
        if is_a2ui_part(a2a_part):
          logger.info(
              f"Extracted A2UI part from conversational text: {json_candidate}"
          )
          return a2a_part
      except pydantic.ValidationError:
        pass

    logger.debug(f"Part is not a recognizable A2UI payload: {part.text}")

  return part_converter.convert_genai_part_to_a2a_part(part)
