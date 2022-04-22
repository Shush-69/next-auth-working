import { GraphQLClient, gql } from 'graphql-request';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const { GRAPHCMS_URL, GRAPHCMS_PERMANENTAUTH_TOKEN, JWT_SECRET, JWT_EXPIRES_IN } = process.env;
const client = new GraphQLClient('https://api-eu-west-2.graphcms.com/v2/cl28w72q608q601yw3fc9hbtd/master', {
  headers: {
    Authorization: `Bearer ${GRAPHCMS_PERMANENTAUTH_TOKEN}`,
  },
});

const CreateNextUserMutation = gql`
    mutation CreateNextUser($userData: NextUserCreateInput!) {
      createNextUser(data: $userData) {
      id
      email
      token
    }
  }
`;

export default async function handler(req, res) {
  const { email, password, firstname, lastname } = req.body;
  if (!email || !password || !firstname || !lastname) {
    res.status(400).end();
  }
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1d" });
  const hashedPassword = await bcrypt.hash(password, 8);
  const userData = {
    email,
    password: hashedPassword,
    firstname,
    lastname,
    token
  };
  const response = await client.request(CreateNextUserMutation, { userData });
  if (!response?.CreateNextUser?.id) {
    res.status(500);
  }
  res.status(200).json({ token });
}
