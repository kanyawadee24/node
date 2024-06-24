import 'dotenv/config';
import express from 'express';
import db from './prisma-client.js';

const PORT = process.env.PORT;
const app = express();

app.use(express.json());

app.get('/', (request, response) => {
  return response.json({ message: 'Hi' });
});

// GET /users
app.get('/users', async (req, res, next) => {
  // หา users ใน db
  const users = await db.user.findMany();
  return res.json(users);
});

app.post('/users', async (req, res, next) => {
  const { email, name, password, confirmPassword, isAdmin = false } = req.body;
  // Step-1 : Validate exist
  if (!email || !name || !password || !confirmPassword) {
    return res.status(400).json({ message: 'All field required' });
  }
  // Step-2 : Validate password
  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'password mismatch' });
  }

  if (!email.includes('@')) {
    return res.status(400).json({ message: 'invalid email address' });
  }

  // HW : Check ว่าอีเมลล์ถูกสมัครไปรึยัง
  const existUser = await db.user.findUnique({ where: { email: email } });
  if (existUser) {
    return res.status(400).json({ message: 'email already in use' });
  }

  // Step-3 : Create NewUser
  const newUser = await db.user.create({
    data: {
      email: email,
      name: name,
      password: password,
      isAdmin: isAdmin,
    },
  });
  res.status(201).json(newUser);
});

// GET /users/2
app.get('/users/:userId', async (req, res, next) => {
  // Step-1 : แกะ path parameter จาก request object
  const params = req.params; // {userId : "1"}
  const userId = params.userId;
  const user = await db.user.findUnique({ where: { id: +userId } });

  //step3 check user no? > 404
  if (!user) {
    return res.status(404).json({ message: 'user not found' });
  }

  //ถ้าเจอ
  res.json(user);
});

app.listen(PORT, () => {
  console.log('server running at port', PORT);
});
