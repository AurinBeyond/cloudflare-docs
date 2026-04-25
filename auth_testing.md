# Matrix Aurin / prulesoul.site — Auth Testing Playbook

## Setup test user + session

```bash
mongosh --eval "
use('test_database');
var userId = 'test-user-' + Date.now();
var sessionToken = 'test_session_' + Date.now();
db.users.insertOne({
  user_id: userId,
  email: 'test.user.' + Date.now() + '@example.com',
  name: 'Test User',
  picture: 'https://via.placeholder.com/150',
  created_at: new Date()
});
db.user_sessions.insertOne({
  user_id: userId,
  session_token: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000),
  created_at: new Date()
});
print('Session token: ' + sessionToken);
print('User ID: ' + userId);
"
```

## Test backend

```bash
# Cookie-based
curl -X GET "$API_URL/api/auth/me" --cookie "session_token=YOUR_SESSION_TOKEN"

# Bearer fallback
curl -X GET "$API_URL/api/auth/me" -H "Authorization: Bearer YOUR_SESSION_TOKEN"

# Logout
curl -X POST "$API_URL/api/auth/logout" --cookie "session_token=YOUR_SESSION_TOKEN"
```

## Browser testing (Playwright)

```python
await page.context.add_cookies([{
    "name": "session_token",
    "value": "YOUR_SESSION_TOKEN",
    "domain": "<host>",
    "path": "/",
    "httpOnly": True,
    "secure": True,
    "sameSite": "None"
}])
await page.goto("https://<host>/portal")
```

## Cleanup

```bash
mongosh --eval "
use('test_database');
db.users.deleteMany({email: /test\.user\./});
db.user_sessions.deleteMany({session_token: /test_session/});
"
```

## Notes
- Sessions expire 7 days from creation (timezone-aware UTC)
- Cookie is `httpOnly, secure, samesite=None, path=/`
- Backend checks cookie first, then `Authorization: Bearer` header
- /api/auth/session is the callback endpoint (called by frontend with session_id fragment from Emergent Auth)
- Emergent Auth callback URL must be the frontend origin + /auth/callback (we use the URL hash session_id pattern)
