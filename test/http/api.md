### Default settings
- port 4221
- host 'localhost'

### Test 200 OK
```bash
curl -v http://localhost:4221
```
### Extract URL part
```bash
curl -v http://localhost:4221/abcdefg
curl -v http://localhost:4221/
```
### Response with body
```bash
curl -v http://localhost:4221/echo/abc
```
### Read Header
```bash
curl -v --header "User-Agent: foobar/1.2.3" http://localhost:4221/user-agent
```
### Return a file
```bash
./your_program.sh --directory /tmp/
curl -i http://localhost:4221/files/non_existant_file
curl -i http://localhost:4221/files/foo
```
### Read request body
```bash
curl -v --data "12345" -H "Content-Type: application/octet-stream" http://localhost:4221/files/file_123
```
