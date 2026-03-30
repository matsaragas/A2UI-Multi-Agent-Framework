Explore the Google's [A2UI](https://a2ui.org/) protocol for Agent-Driven Interfaces. 


1. #### Run the Agent (Backend):

   Open a new terminal for each command

   ```shell
   cd src/agent/adk/restaurant_finder
   uv run . --port=10003
   ```

   ```shell
   cd samples/agent/adk/contact_lookup
   uv run . --port=10004
   ```

   Run the orchestrator agent:

   ```shell
   cd samples/agent/adk/orchestrator
   uv run . --port=10002 --subagent_urls=http://localhost:10003 --subagent_urls=http://localhost:10004
   ```


2. #### Run the Client (Frontend): Open a new terminal window:

   ```bash
   # Install and build the Markdown renderer
   cd renderers/markdown/markdown-it
   npm install
   npm run build

   # Install and build the Web Core library
   cd ../../web_core
   npm install
   npm run build

   # Install and build the Lit renderer
   cd ../lit
   npm install
   npm run build

   # Install and run the shell client
   cd ../../samples/client/lit/shell
   npm install
   npm run dev
   ```

3. Try commands that work with any agent: a. "Who is Alex Jordan?" (routed to contact lookup agent) b. "Show me chinese food restaurants in NYC" (routed to restaurant finder agent) 