const mongoose = require('mongoose');
const dotenv = require('dotenv');
  const Course = require('../models/Course');

dotenv.config();

if (!process.env.MONGODB_URI) {
  console.error('Error: MONGO_URI is not defined in .env');
  process.exit(1);
}


  // Sample courses data
  const courses = [
    {
      code: 'CS101',
      name: 'Computer Science 101',
      subjects: ['Programming', 'Databases', 'Algorithms'],
    },
    {
      code: 'MATH101',
      name: 'Mathematics 101',
      subjects: ['Calculus', 'Algebra', 'Statistics'],
    },
    {
      code: 'ENG201',
      name: 'English Literature 201',
      subjects: ['Poetry', 'Novels', 'Drama'],
    },
    {
      code: 'PHY301',
      name: 'Physics 301',
      subjects: ['Mechanics', 'Electromagnetism', 'Quantum Physics'],
    },
  ];

  // Function to seed courses
  const seedCourses = async () => {
    try {
      // Connect to MongoDB
      mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
      // Clear existing courses
      console.log('Clearing existing courses...');
      await Course.deleteMany({});
      console.log('Existing courses cleared');

      // Insert new courses
      console.log('Inserting courses...');
      const insertedCourses = await Course.insertMany(courses);
      console.log(`Inserted ${insertedCourses.length} courses:`);
      insertedCourses.forEach(course => {
        console.log(`- ${course.code}: ${course.name} (Subjects: ${course.subjects.join(', ')})`);
      });

      // Verify inserted data
      const count = await Course.countDocuments({});
      console.log(`Total courses in database: ${count}`);
    } catch (err) {
      console.error('Error seeding courses:', err);
    } finally {
      // Close MongoDB connection
      console.log('Closing MongoDB connection...');
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
  };

  // Run the seeding function
  seedCourses();