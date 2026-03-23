# MongoDB Connection Fix - TODO

## Steps:
- [x] 1. Create backend/config/db.js (extract connection logic with retries/options)
- [x] 2. Update backend/server.js (import/use db.js, remove old connect)
- [x] 3. Create .env.example (URI template)
- [x] 4. Update package.json (add test script)
- [ ] 5. User: Update .env with provided URI/pass, whitelist IP in Atlas
- [ ] 6. Test: Kill server, npm run test:db, npm start, check '✅ MongoDB Connected'
- [ ] 7. Test API: curl http://localhost:3000/api/hostels or browser /hostels.html

Progress: Code fixed. Run tests next!

