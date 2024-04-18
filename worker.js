addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  if (request.method === "OPTIONS") {
      return new Response("", corsHeaders(204));
  }

  let body = await parseRequestBody(request);
  let data = prepareData(body);

  const response = await fetch('https://api.cohere.ai/v1/chat', {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${API_AUTH_TOKEN}`
      }
  });

  if (response.status !== 200) return response;

  if (!data.stream) {
      return handleNonStreamResponse(response);
  }

  return handleStreamResponse(response);
}

const corsHeaders = (status) => ({
  headers: {
      'Access-Control-Allow-Origin': '*',
      "Access-Control-Allow-Headers": '*',
      'Content-Type': 'application/json; charset=UTF-8'
  }, status
});

async function parseRequestBody(request) {
  try {
      return await request.json();
  } catch (e) {
      return {
          "messages": [{ "role": "user", "content": (new URL(request.url)).searchParams.get('q') || "hello" }],
          "model": "command-r", "temperature": 0.5, "presence_penalty": 0, "frequency_penalty": 0, "top_p": 1, stream: true
      };
  }
}

function prepareData(body) {
  let data = { chat_history: [], stream: body.stream === true };

  body.messages.slice(0, -1).forEach(msg => {
      data.chat_history.push({ "role": msg.role === "assistant" ? "CHATBOT" : msg.role.toUpperCase(), "message": msg.content });
  });

  data.message = body.messages[body.messages.length - 1].content;
  if (body.model.startsWith("net-")) data.connectors = [{ "id": "web-search" }];
  // data.model = /^(net-)?command/.test(body.model) ? body.model.replace(/^net-/, "") : "command-r";
  data.model = 'command-r-plus';

  return data;
}

async function handleNonStreamResponse(response) {
  let jsonResponse;
  try {
      jsonResponse = await response.json();
  } catch (e) {
      jsonResponse = { error: e.message };
  }

  return new Response(JSON.stringify(jsonResponse), corsHeaders(response.status));
}

async function handleStreamResponse(response) {
  const { readable, writable } = new TransformStream();
  response.body.pipeTo(writable);
  return new Response(readable, {
      headers: {
          'Access-Control-Allow-Origin': '*',
          "Access-Control-Allow-Headers": '*',
          'Content-Type': 'text/event-stream; charset=UTF-8'
      }, status: response.status
  });
}
