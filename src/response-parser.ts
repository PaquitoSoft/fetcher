type ResponseParser = (response: Response) => unknown;

let _domParser: DOMParser;
const getDomParser = () => {
  if (!_domParser) {
    _domParser = new DOMParser();
  }
  return _domParser;
}

const parsersMap: Record<string, ResponseParser> = {
  'base': (response: Response) => response.text(),
  'text/plain': (response: Response) => response.text(),
  'text/html': async (response: Response) => {
    const raw = await response.text();
    return getDomParser().parseFromString(raw, 'text/html');
  },
  'text/xml': async (response: Response) => {
    const raw = await response.text();
    return getDomParser().parseFromString(raw, 'text/html');
  },
  'application/json': async (response: Response) => {
    // This is to handle empty responses as response.json()
    // fails in that scenario (try to parse an empty string
    // raises a parsing error)
    const text = await response.text();
    return text ? JSON.parse(text) : {};
  },
};

function parseResponse<T>(response: Response): T {
  const contentType = (response.headers.get('content-type') || 'base').split(';')[0];
  const parser: ResponseParser = parsersMap[contentType.toLowerCase()] || parsersMap.base;

  return parser(response) as T;
}

export default parseResponse;
