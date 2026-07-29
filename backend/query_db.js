const { BootcampPost } = require('./models');
async function run() {
  const posts = await BootcampPost.findAll({ order: [['createdAt', 'DESC']], limit: 2 });
  console.log(JSON.stringify(posts, null, 2));
  process.exit(0);
}
run();
