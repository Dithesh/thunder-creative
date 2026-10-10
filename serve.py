"""Local preview server: python serve.py  ->  http://localhost:5500
(Windows' default MIME table serves .js as text/plain, which breaks ES modules.)"""
import http.server, functools, os, sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 5500
Handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=os.path.dirname(os.path.abspath(__file__)))
Handler.func.extensions_map.update({'.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.mp4': 'video/mp4'})

print(f'Thunder Creatives preview -> http://localhost:{PORT}')
http.server.ThreadingHTTPServer(('127.0.0.1', PORT), Handler).serve_forever()
