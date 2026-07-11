//ye poori file change hogi once we have student frontend to ask doubts
//abhi sirf simulation ke liye banaya he

const { sequelize, User, Doubt } = require("./models");

const seedDoubts = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to database");

    const admin1 = await User.findOne({
      where: { email: "arpit1206477417@gmail.com" },
    });
    const admin2 = await User.findOne({
      where: { email: "a1206477417@gmail.com" },
    });

    if (!admin1 || !admin2) {
      console.log("Error: Both admins not found in the database");
      process.exit(1);
    }

    console.log("Admins found:", admin1.name, admin2.name);

    const MOCK_STUDENTS = [
      { name: "Rahul Sharma", email: "rahul.s@example.com" },
      { name: "Aadya sharma", email: "aadya@example.com" },
      { name: "Aditya Kumar", email: "aditya.k@example.com" },
      { name: "Sneha Gupta", email: "sneha.g@example.com" },
      { name: "Rohan Desai", email: "rohan.d@example.com" },
      { name: "Anjali Verma", email: "anjali.v@example.com" },
      { name: "Karan Singh", email: "karan.s@example.com" },
      { name: "Neha Reddy", email: "neha.r@example.com" },
      { name: "Vikram Joshi", email: "vikram.j@example.com" },
      { name: "Pooja Iyer", email: "pooja.i@example.com" },
      { name: "Amit Mishra", email: "amit.m@example.com" },
      { name: "Megha Nair", email: "megha.n@example.com" },
      { name: "Ravi Teja", email: "ravi.t@example.com" },
      { name: "Shruti Bhat", email: "shruti.b@example.com" },
      { name: "Nikhil Saxena", email: "nikhil.s@example.com" },
      { name: "Kavita Menon", email: "kavita.m@example.com" },
      { name: "Siddharth Rao", email: "siddharth.r@example.com" },
      { name: "Aisha Khan", email: "aisha.k@example.com" },
      { name: "Varun Das", email: "varun.d@example.com" },
      { name: "Simran Kaur", email: "simran.k@example.com" },
    ];

    let students = [];
    for (const data of MOCK_STUDENTS) {
      let [student] = await User.findOrCreate({
        where: { email: data.email },
        defaults: {
          googleId: `dummy_${Date.now()}_${Math.random()}`,
          name: data.name,
          role: "user",
        },
      });
      students.push(student);
    }
    console.log("Created 20 dummy students.");

    await Doubt.destroy({ where: {} });
    console.log("Cleared existing doubts.");

    const qas = [
      {
        q: "How to deploy React app?",
        a: "You can use Vercel or Netlify. Just link your GitHub repository and it auto-deploys!",
      },
      {
        q: "What is CORS?",
        a: "Cross-Origin Resource Sharing. It's a security feature by browsers. You fix it on the backend using the cors package.",
      },
      {
        q: "How to install Vite?",
        a: "Run `npm create vite@latest` in your terminal.",
      },
      {
        q: "SQL injection prevention?",
        a: "Always use parameterized queries or an ORM like Sequelize.",
      },
      {
        q: "Explain JWT",
        a: "JSON Web Tokens are used for stateless authentication. It consists of a header, payload, and signature.",
      },
      {
        q: "CSS grid vs flexbox?",
        a: "Flexbox is 1D (rows OR columns). Grid is 2D (rows AND columns).",
      },
      {
        q: "React useEffect dependencies?",
        a: "Add any state or prop variable used inside the effect to the dependency array to ensure it runs when they change.",
      },
      {
        q: "Advanced TypeScript patterns?",
        a: "Look into utility types like Pick, Omit, and conditional types.",
      },
      {
        q: "Redux toolkit setup?",
        a: "Use configureStore and createSlice for an easier setup compared to legacy Redux.",
      },
      {
        q: "System design basics?",
        a: "Start with load balancing, caching, and database scaling.",
      },
      {
        q: "Dockerizing Node app?",
        a: "Create a Dockerfile, define the base image (node:alpine), copy package.json, run npm install, and expose the port.",
      },
      {
        q: "How to handle forms in React?",
        a: "You can use controlled components or libraries like React Hook Form for better performance.",
      },
      {
        q: "Difference between SQL and NoSQL?",
        a: "SQL is relational with strict schemas. NoSQL is non-relational and schema-flexible.",
      },
      {
        q: "What is a REST API?",
        a: "An architectural style for APIs that uses standard HTTP methods like GET, POST, PUT, DELETE.",
      },
      {
        q: "How to center a div?",
        a: "Use Flexbox: `display: flex; align-items: center; justify-content: center;`",
      },
    ];

    for (let i = 0; i < 10; i++) {
      await Doubt.create({
        question: qas[i].q,
        answer: qas[i].a,
        status: "resolved",
        studentId: students[i % students.length].id,
        answeredByAdminId: admin1.id,
      });
    }

    await Doubt.create({
      question: qas[10].q,
      answer: qas[10].a,
      status: "resolved",
      studentId: students[10 % students.length].id,
      answeredByAdminId: admin2.id,
    });

    for (let i = 11; i < 15; i++) {
      await Doubt.create({
        question: qas[i].q,
        answer: qas[i].a,
        status: "resolved",
        studentId: students[i % students.length].id,
        answeredByAdminId: admin1.id,
      });
    }

    console.log("Seeded 15 answered doubts.");

    const pendingQuestions = [
      "How to write unit tests with Jest?",
      "Node.js connection refused error locally?",
      "How to deploy to AWS EC2?",
      "What are React Portals?",
      "How to use GraphQL mutations?",
      "Best way to manage global state?",
      "How to implement dark mode in React?",
    ];

    for (let i = 0; i < 7; i++) {
      await Doubt.create({
        question: pendingQuestions[i],
        status: "pending",
        studentId: students[(i + 5) % students.length].id,
      });
    }

    console.log("Seeded 7 unanswered doubts.");
    console.log("Database seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding:", error);
    process.exit(1);
  }
};

seedDoubts();
