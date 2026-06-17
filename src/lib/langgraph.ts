import { StateGraph, MessagesAnnotation } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { StructuredToolInterface } from '@langchain/core/tools';
import { llm } from './ai';

/**
 * Creates a reusable ReAct agent graph using LangGraph.
 * 
 * Flow: __start__ -> agent <-> tools -> __end__
 * 
 * @param tools - An array of LangChain tools
 * @returns A compiled LangGraph runnable
 */
export function createReActAgent(tools: StructuredToolInterface[]) {
  const toolNode = new ToolNode(tools);
  const modelWithTools = llm.bindTools(tools);

  const callModel = async (state: typeof MessagesAnnotation.State) => {
    const { messages } = state;
    const response = await modelWithTools.invoke(messages);
    return { messages: [response] };
  };

  const shouldContinue = (state: typeof MessagesAnnotation.State) => {
    const { messages } = state;
    const lastMessage = messages[messages.length - 1];
    
    if (
      'tool_calls' in lastMessage && 
      Array.isArray(lastMessage.tool_calls) && 
      lastMessage.tool_calls.length > 0
    ) {
      return 'tools';
    }
    
    return '__end__';
  };

  const workflow = new StateGraph(MessagesAnnotation)
    .addNode('agent', callModel)
    .addNode('tools', toolNode)
    .addEdge('__start__', 'agent')
    .addConditionalEdges('agent', shouldContinue)
    .addEdge('tools', 'agent');

  return workflow.compile();
}
