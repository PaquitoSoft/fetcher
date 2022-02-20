type ResponseParser = (response: Response) => unknown;

const domParser = new DOMParser();

const parsersMap: Record<string, ResponseParser> = {
  'base': (response: Response) => response.text(),
  'text/plain': (response: Response) => response.text(),
  'text/html': async (response: Response) => {
    const raw = await response.text();
    return domParser.parseFromString(raw, 'text/html');
  },
  'text/xml': async (response: Response) => {
    const raw = await response.text();
    return domParser.parseFromString(raw, 'text/html');
  },
  'application/json': async (response: Response) => {
    // This is to handle empty responses as response.json()
    // fails in that scenario (try to parse an empty string
    // raises a parsing error)
    const text = await response.text();
    return text ? JSON.parse(text) : {};
  },
};

function parseResponse(response: Response) {
  const contentType = (response.headers.get('content-type') || 'base').split(';')[0];
  const parser: ResponseParser = parsersMap[contentType.toLowerCase()] || parsersMap.base;

  return parser(response);
}

export default parseResponse;
