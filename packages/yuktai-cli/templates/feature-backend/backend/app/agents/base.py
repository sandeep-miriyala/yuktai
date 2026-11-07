"""Simple agent building with LangGraph: give it tools and instructions, get an agent.

    from app.agents.base import build_agent, run_agent
    agent = build_agent(tools=[count_orders], instructions="Answer with tools.", model=model)
    run_agent(agent, "How many orders in Pune?")

The graph:  START → model ⇄ tools → END
- The model decides which tool to call (tool calling), the tools node runs it,
  the result goes back to the model, until it answers.
- max_steps stops endless loops. Unknown tools and tool errors become messages,
  so the model can recover instead of crashing.
"""

from __future__ import annotations

from typing import Any, Sequence

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage, ToolMessage
from langchain_core.tools import BaseTool
from langgraph.graph import END, START, MessagesState, StateGraph


class AgentState(MessagesState):
    steps: int


def build_agent(tools: Sequence[BaseTool], instructions: str, model: Any, max_steps: int = 6):
    """A compiled LangGraph agent. `model` is any LangChain chat model that supports tool calling."""
    by_name = {t.name: t for t in tools}
    bound = model.bind_tools(list(tools))

    def call_model(state: AgentState) -> dict:
        steps = state.get("steps", 0)
        if steps >= max_steps:
            return {"messages": [AIMessage(content="I stopped after too many steps. Please ask a simpler question.")]}
        reply = bound.invoke([SystemMessage(content=instructions), *state["messages"]])
        return {"messages": [reply], "steps": steps + 1}

    def call_tools(state: AgentState) -> dict:
        results = []
        for call in state["messages"][-1].tool_calls:
            tool = by_name.get(call["name"])
            if tool is None:
                content = f"There is no tool called {call['name']}."
            else:
                try:
                    content = str(tool.invoke(call["args"]))
                except Exception as error:  # the model sees the error and can try again
                    content = f"The tool failed: {error}"
            results.append(ToolMessage(content=content, tool_call_id=call["id"], name=call["name"]))
        return {"messages": results}

    def next_step(state: AgentState) -> str:
        last = state["messages"][-1]
        return "tools" if isinstance(last, AIMessage) and last.tool_calls else END

    graph = StateGraph(AgentState)
    graph.add_node("model", call_model)
    graph.add_node("tools", call_tools)
    graph.add_edge(START, "model")
    graph.add_conditional_edges("model", next_step, ["tools", END])
    graph.add_edge("tools", "model")
    return graph.compile()


def run_agent(agent, question: str) -> dict:
    """Runs the agent. Returns the answer and every tool step, for showing on the page."""
    final = agent.invoke({"messages": [HumanMessage(content=question)], "steps": 0})
    steps, calls = [], {}
    for message in final["messages"]:
        if isinstance(message, AIMessage):
            for call in message.tool_calls:
                calls[call["id"]] = call
        elif isinstance(message, ToolMessage):
            call = calls.get(message.tool_call_id, {})
            steps.append({"tool": message.name, "args": call.get("args", {}), "result": message.content})
    return {"answer": str(final["messages"][-1].content), "steps": steps}


def groq_model():
    """The Groq chat model, or None when GROQ_API_KEY is not set."""
    from .. import settings

    key = settings.groq_key()
    if not key:
        return None
    from langchain_groq import ChatGroq

    # Any Groq model with tool use works. Change it in backend/.env (GROQ_MODEL).
    return ChatGroq(api_key=key, model=settings.get("GROQ_MODEL", "llama-3.3-70b-versatile"), temperature=0)
