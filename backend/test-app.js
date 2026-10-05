/**
 * BookLoop - End-to-End Test & Verification Script
 * Validates authentication, books CRUD, search, requests, ownership permissions, and error handling.
 */

const http = require('http');
const dotenv = require('dotenv');
dotenv.config();

// Ensure test port
const PORT = 5005;
process.env.PORT = PORT;

const { app, server } = require('./server');

const BASE_URL = `http://localhost:${PORT}/api`;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting BookLoop Comprehensive Automated Tests ---');

  try {
    // Wait 2 seconds for MongoDB connection to settle
    await new Promise((r) => setTimeout(r, 2000));

    // 1. Health check
    console.log('\n[1] Testing Health Check...');
    const health = await request('GET', '/health');
    console.log('Health check status:', health.status, health.body.status);
    if (health.status !== 200) throw new Error('Health check failed');

    // 2. Register Alice
    console.log('\n[2] Testing User Registration (Alice)...');
    const timestamp = Date.now();
    const aliceEmail = `alice_${timestamp}@example.com`;
    const regAlice = await request('POST', '/auth/register', {
      name: 'Alice Reader',
      email: aliceEmail,
      password: 'password123'
    });
    console.log('Alice registered:', regAlice.status, regAlice.body.success);
    if (regAlice.status !== 201) throw new Error('Alice registration failed: ' + JSON.stringify(regAlice.body));
    const aliceToken = regAlice.body.token;

    // 3. Register Bob
    console.log('\n[3] Testing User Registration (Bob)...');
    const bobEmail = `bob_${timestamp}@example.com`;
    const regBob = await request('POST', '/auth/register', {
      name: 'Bob Bookworm',
      email: bobEmail,
      password: 'password123'
    });
    console.log('Bob registered:', regBob.status, regBob.body.success);
    if (regBob.status !== 201) throw new Error('Bob registration failed: ' + JSON.stringify(regBob.body));
    const bobToken = regBob.body.token;

    // 4. Test Login
    console.log('\n[4] Testing User Login...');
    const loginRes = await request('POST', '/auth/login', {
      email: aliceEmail,
      password: 'password123'
    });
    console.log('Login result:', loginRes.status, loginRes.body.user.name);
    if (loginRes.status !== 200 || !loginRes.body.token) throw new Error('Login failed');

    // 5. Alice adds books
    console.log('\n[5] Alice adding books...');
    const book1Res = await request('POST', '/books', {
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      category: 'Classic Fiction'
    }, aliceToken);
    console.log('Book 1 added:', book1Res.status, book1Res.body.book.title);
    const book1Id = book1Res.body.book._id;

    const book2Res = await request('POST', '/books', {
      title: '1984',
      author: 'George Orwell',
      category: 'Dystopian Fiction'
    }, aliceToken);
    console.log('Book 2 added:', book2Res.status, book2Res.body.book.title);
    const book2Id = book2Res.body.book._id;

    // 6. Bob adds a book
    console.log('\n[6] Bob adding a book...');
    const book3Res = await request('POST', '/books', {
      title: 'Clean Code',
      author: 'Robert C. Martin',
      category: 'Technology'
    }, bobToken);
    console.log('Book 3 added:', book3Res.status, book3Res.body.book.title);

    // 7. Get all books
    console.log('\n[7] Testing Get All Books...');
    const allBooks = await request('GET', '/books');
    console.log(`Found ${allBooks.body.count} books in total.`);
    if (allBooks.body.count < 3) throw new Error('Expected at least 3 books in catalog');

    // 8. Search books by author "Orwell"
    console.log('\n[8] Testing Book Search by "Orwell"...');
    const searchRes = await request('GET', '/books?search=Orwell');
    console.log(`Search result count: ${searchRes.body.count}, Book: ${searchRes.body.books[0]?.title}`);
    if (searchRes.body.count !== 1 || searchRes.body.books[0]?.title !== '1984') {
      throw new Error('Search did not return 1984');
    }

    // 9. Alice retrieves her own books
    console.log('\n[9] Testing Get My Books (Alice)...');
    const aliceBooks = await request('GET', '/books/my-books', null, aliceToken);
    console.log(`Alice owns ${aliceBooks.body.count} books.`);
    if (aliceBooks.body.count !== 2) throw new Error('Alice should have 2 books');

    // 10. Bob requests Alice's book "1984"
    console.log('\n[10] Bob requesting Alice\'s book "1984"...');
    const requestRes = await request('POST', '/requests', { bookId: book2Id }, bobToken);
    console.log('Request status:', requestRes.status, requestRes.body.message);
    if (requestRes.status !== 201) throw new Error('Requesting book failed');
    const requestId = requestRes.body.request._id;

    // 11. Security Check: Alice tries to request her own book
    console.log('\n[11] Security check: Alice attempting to request her own book...');
    const selfRequest = await request('POST', '/requests', { bookId: book2Id }, aliceToken);
    console.log('Self-request blocked with code:', selfRequest.status, 'Message:', selfRequest.body.message);
    if (selfRequest.status !== 400) throw new Error('Self-request should have been blocked with 400');

    // 12. Security Check: Bob tries to delete Alice's book
    console.log('\n[12] Security check: Bob attempting to delete Alice\'s book...');
    const unauthorizedDelete = await request('DELETE', `/books/${book1Id}`, null, bobToken);
    console.log('Unauthorized delete blocked with code:', unauthorizedDelete.status, 'Message:', unauthorizedDelete.body.message);
    if (unauthorizedDelete.status !== 403) throw new Error('Unauthorized delete should return 403');

    // 13. Bob checks his sent requests
    console.log('\n[13] Bob checks My Requests...');
    const bobRequests = await request('GET', '/requests/my-requests', null, bobToken);
    console.log(`Bob has ${bobRequests.body.count} requests. First status:`, bobRequests.body.requests[0]?.status);
    if (bobRequests.body.requests[0]?.status !== 'Pending') throw new Error('Request status should be Pending');

    // 14. Alice checks received requests and accepts Bob's request
    console.log('\n[14] Alice accepts Bob\'s request...');
    const acceptRes = await request('PUT', `/requests/${requestId}/status`, { status: 'Accepted' }, aliceToken);
    console.log('Update status result:', acceptRes.status, acceptRes.body.request.status);
    if (acceptRes.body.request.status !== 'Accepted') throw new Error('Status should be Accepted');

    // 15. Alice deletes one of her own books
    console.log('\n[15] Alice deletes her own book ("The Great Gatsby")...');
    const deleteRes = await request('DELETE', `/books/${book1Id}`, null, aliceToken);
    console.log('Delete result:', deleteRes.status, deleteRes.body.message);
    if (deleteRes.status !== 200) throw new Error('Alice should be able to delete her own book');

    // 16. Verify book count decreased
    const verifyAliceBooks = await request('GET', '/books/my-books', null, aliceToken);
    console.log(`Alice now has ${verifyAliceBooks.body.count} book left.`);
    if (verifyAliceBooks.body.count !== 1) throw new Error('Expected 1 book remaining for Alice');

    console.log('\n=======================================================');
    console.log('  ALL BOOKLOOP AUTOMATED TESTS PASSED SUCCESSFULLY!  ');
    console.log('=======================================================');

  } catch (err) {
    console.error('\n❌ Test failed with error:', err.message);
    process.exit(1);
  } finally {
    server.close();
    process.exit(0);
  }
}

runTests();
