from http.server import test, SimpleHTTPRequestHandler  # type: ignore

SimpleHTTPRequestHandler.extensions_map['.js'] = 'application/javascript'

test(SimpleHTTPRequestHandler)
